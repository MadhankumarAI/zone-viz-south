import { cn } from "@/lib/utils";

interface SentinelLogoProps {
  className?: string;
  size?: number;
}

export function SentinelLogo({ className, size = 24 }: SentinelLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <path
        d="M12 2L3 7L12 12L21 7L12 2Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M3 17L12 22L21 17M3 12L12 17L21 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="2"
        fill="currentColor"
      />
    </svg>
  );
}