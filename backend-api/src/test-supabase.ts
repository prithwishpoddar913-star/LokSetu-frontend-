import { supabase } from "./config/supabase.js";

const tables = [
  "customers",
  "profiles",
  "stamps",
  "orders",
  "order_items",
  "payments",
  "user_sessions",
  "website_activity",
];

async function testTables() {
  console.log("\n===== STAMP SAFAR DATABASE TEST =====\n");

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select("*")
      .limit(1);

    if (error) {
      console.log(`❌ ${table}: FAILED - ${error.message}`);
    } else {
      console.log(`✅ ${table}: ACCESSIBLE`);
    }
  }

  console.log("\n===== TEST COMPLETED =====");
}

testTables();