import { useState } from "react";
import { Home, Landmark, ShoppingBag, UserCheck, Stamp } from "lucide-react";

export type SafeImageIconType = "home" | "landmark" | "craft" | "guide" | "stamp" | "bag" | "user";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackIcon?: SafeImageIconType;
  fallbackType?: SafeImageIconType;
  label?: string;
  containerClassName?: string;
}

export function SafeImage({
  src,
  alt,
  fallbackIcon,
  fallbackType,
  label,
  className = "",
  containerClassName = "",
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const showPlaceholder = !src || hasError;
  const effectiveIcon = fallbackType || fallbackIcon || "landmark";

  const renderIcon = () => {
    switch (effectiveIcon) {
      case "home":
        return <Home className="w-8 h-8 text-[#F47721]" />;
      case "bag":
      case "craft":
        return <ShoppingBag className="w-8 h-8 text-[#F47721]" />;
      case "user":
      case "guide":
        return <UserCheck className="w-8 h-8 text-[#F47721]" />;
      case "stamp":
        return <Stamp className="w-8 h-8 text-[#F47721]" />;
      case "landmark":
      default:
        return <Landmark className="w-8 h-8 text-[#F47721]" />;
    }
  };

  if (showPlaceholder) {
    return (
      <div
        className={`w-full h-full min-h-[140px] flex flex-col items-center justify-center p-4 text-center select-none bg-gradient-to-br from-[#FFF0E5] via-[#FFF7F0] to-[#F1D8C5] dark:from-[#1E2028] dark:via-[#181A20] dark:to-[#121316] border border-[#F1D8C5]/50 dark:border-white/10 ${containerClassName}`}
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-zinc-800/80 shadow-sm flex items-center justify-center mb-2 border border-[#F47721]/20">
          {renderIcon()}
        </div>
        <span className="text-xs font-semibold text-[#252525] dark:text-zinc-200 line-clamp-1 max-w-[85%]">
          {label || alt}
        </span>
        <span className="text-[10px] text-[#F47721] font-medium tracking-wider uppercase mt-1">
          Stamp Safar Heritage
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      onLoad={() => setLoaded(true)}
      className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      {...props}
    />
  );
}
