import { cn } from "@/lib/utils";

interface SafenceLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function SafenceLogo({ className, size = 24, showText = false }: SafenceLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Drone and Fence Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-current"
      >
        {/* Drone Body */}
        <path
          d="M50 25L45 30H55L50 25Z"
          fill="currentColor"
        />
        <rect x="47" y="30" width="6" height="8" fill="currentColor" />
        
        {/* Drone Arms */}
        <line x1="42" y1="34" x2="30" y2="22" stroke="currentColor" strokeWidth="2" />
        <line x1="58" y1="34" x2="70" y2="22" stroke="currentColor" strokeWidth="2" />
        <line x1="42" y1="34" x2="30" y2="46" stroke="currentColor" strokeWidth="2" />
        <line x1="58" y1="34" x2="70" y2="46" stroke="currentColor" strokeWidth="2" />
        
        {/* Propellers */}
        <circle cx="30" cy="22" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="70" cy="22" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="30" cy="46" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="70" cy="46" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        
        {/* Signal Waves */}
        <path
          d="M35 45C35 50 40 55 45 55C50 55 55 50 55 45"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M30 50C30 58 38 66 46 66C54 66 62 58 62 50"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M25 55C25 66 34 77 47 77C60 77 69 66 69 55"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Fence */}
        <g transform="translate(15, 65)">
          {/* Fence Posts */}
          {[0, 10, 20, 30, 40, 50, 60, 70].map((x) => (
            <rect key={x} x={x} y="0" width="2" height="20" fill="currentColor" />
          ))}
          
          {/* Horizontal Rails */}
          <rect x="0" y="5" width="70" height="2" fill="currentColor" />
          <rect x="0" y="10" width="70" height="2" fill="currentColor" />
          <rect x="0" y="15" width="70" height="2" fill="currentColor" />
        </g>
      </svg>
      
      {showText && (
        <span className="font-bold text-xl">
          Sa<span className="text-safence-primary">Fe</span>nce
        </span>
      )}
    </div>
  );
}