/**
 * Auth Actions - Hardened Security with Synchronized Lockout & Rate-Limiting
 * Routes through secure-login Edge Function or atomic locked Postgres function.
 */
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

type AuthMode = "login" | "signup";

type AuthInput = {
  email?: string;
  password?: string;
  fullName?: string;
};

type ResetPasswordInput = {
  email?: string;
  redirectTo?: string;
};

type AuthActionResult = {
  ok: boolean;
  message: string;
  user: User | null;
  session: Session | null;
  needsEmailConfirmation?: boolean;
};

// Client-side in-flight mutex to prevent concurrent double-submits
let loginInFlightMutex = false;

function validateAuthInput(data: AuthInput, mode: AuthMode) {
  const email = String(data.email || "")
    .trim()
    .toLowerCase();
  const password = String(data.password || "");
  const fullName = String(data.fullName || "").trim();

  // Basic regex check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  if (mode === "signup" && !fullName) {
    throw new Error("Please enter your full name.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  return { email, password, fullName };
}

export async function signupUserFn({ data }: { data: AuthInput }): Promise<AuthActionResult> {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  const { email, password, fullName } = validateAuthInput(data, "signup");

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    ok: true,
    message: authData.session
      ? "Account created. Redirecting to your dashboard..."
      : "Account created. Please check your email to confirm your signup.",
    user: authData.user,
    session: authData.session,
    needsEmailConfirmation: !authData.session,
  };
}

/**
 * Login with synchronized server-side rate-limiting and 24h lockout
 */
export async function loginUserFn({ data }: { data: AuthInput }): Promise<AuthActionResult> {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  if (loginInFlightMutex) {
    throw new Error("A login request is already being processed. Please wait.");
  }

  const { email, password } = validateAuthInput(data, "login");

  try {
    loginInFlightMutex = true;

    // 1. Try invoking the secure-login Edge Function first
    try {
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke("secure-login", {
        body: { email, password },
      });

      if (!edgeError && edgeData) {
        if (edgeData.error) {
          throw new Error(edgeData.error);
        }
        if (edgeData.session) {
          await supabase.auth.setSession(edgeData.session);
          return {
            ok: true,
            message: "Signed in. Redirecting to your dashboard...",
            user: edgeData.user,
            session: edgeData.session,
          };
        }
      }
    } catch (edgeInvokeErr: any) {
      // If Edge function returns rate limit or auth error, re-throw it
      if (edgeInvokeErr.message && !edgeInvokeErr.message.includes("Failed to send a request") && !edgeInvokeErr.message.includes("FunctionsFetchError")) {
        throw edgeInvokeErr;
      }
      // Edge Function not deployed yet in cloud -> gracefully enforce via Postgres RPC
    }

    // 2. Direct Database Synchronized Lockout via RPC (Fallback or direct mode)
    const { data: preCheck } = await supabase.rpc("check_and_record_login_attempt", {
      p_email: email,
      p_success: false,
    });

    if (preCheck && preCheck.blocked) {
      const remainingSec = preCheck.remaining_seconds || 86400;
      const hours = Math.floor(remainingSec / 3600);
      const minutes = Math.floor((remainingSec % 3600) / 60);
      throw new Error(`Too many failed login attempts. Account is blocked for 24 hours. Try again in ${hours}h ${minutes}m.`);
    }

    // 3. Attempt direct client sign-in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      // Record failure in locked database function
      const { data: failCheck } = await supabase.rpc("check_and_record_login_attempt", {
        p_email: email,
        p_success: false,
      });

      if (failCheck?.blocked) {
        throw new Error("Too many failed login attempts. Account has been blocked for 24 hours.");
      }

      const attemptsLeft = failCheck?.attempts_remaining ?? 4;
      throw new Error(`Invalid email or password. (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left before 24h lockout)`);
    }

    // 4. Success -> Reset lockout counter
    await supabase.rpc("check_and_record_login_attempt", {
      p_email: email,
      p_success: true,
    });

    return {
      ok: true,
      message: "Signed in. Redirecting to your dashboard...",
      user: authData.user,
      session: authData.session,
    };
  } finally {
    loginInFlightMutex = false;
  }
}

export async function resetPasswordFn({ data }: { data: ResetPasswordInput }) {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  const email = String(data.email || "")
    .trim()
    .toLowerCase();
  const redirectTo = String(data.redirectTo || "");

  if (!email) {
    throw new Error("Enter your email first, then click forgot password.");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || undefined,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    ok: true,
    message: "Password reset email sent. Please check your inbox.",
  };
}
