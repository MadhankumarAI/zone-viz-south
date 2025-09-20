import { SafenceLogo } from "./ui/safence-logo";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";

export function DashboardHeader() {
  const location = useLocation();

  return (
    <div className="w-full h-16 bg-safence-primary shadow-lg border-b border-border relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-safence-primary via-safence-primary-hover to-safence-primary opacity-80 animate-pulse"></div>
      
      <div className="relative flex items-center justify-between px-6 h-full">
        {/* Logo and Brand with hover animation */}
        <Link to="/" className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105">
          <SafenceLogo className="text-white" size={32} />
          <h1 className="font-fira-sans text-2xl font-bold italic text-white group-hover:text-safence-light transition-colors duration-300">
            Safence
          </h1>
        </Link>

        {/* Navigation Menu with slide-in animation */}
        <nav className="flex items-center gap-6">
          {[
            { path: "/dashboard", label: "Dashboard" },
            { path: "/camera-feed", label: "Camera Feed" },
            { path: "/map", label: "Map View" },
            { path: "/alerts", label: "Alerts" },
            { path: "/logs-history", label: "History" },
          ].map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 relative group ${
                location.pathname === item.path
                  ? "text-white font-semibold"
                  : "text-white/90 hover:text-white"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {item.label}
              {/* Animated underline */}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
          <a
            href="#"
            className="text-white/90 text-sm hover:text-white transition-all duration-300 hover:scale-105 relative group"
          >
            System Status
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        {/* Right Side with animated elements */}
        <div className="flex items-center gap-4">
          {/* Search Bar with focus animation */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Search logs, devices..."
              className="w-64 h-9 pl-10 pr-4 text-sm bg-white/10 border border-white/40 rounded-md text-white placeholder:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/80 group-focus-within:text-white transition-colors duration-300"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M10.6224 10.6224C10.8677 10.3771 11.2556 10.362 11.5188 10.5766L11.5698 10.6224L14.4775 13.5301L14.524 13.5811C14.7384 13.8443 14.7227 14.2323 14.4775 14.4775C14.2323 14.7227 13.8443 14.7384 13.5811 14.524L13.5301 14.4775L10.6224 11.5698L10.5766 11.5188C10.362 11.2556 10.3771 10.8677 10.6224 10.6224Z"
                fill="currentColor"
              />
              <path
                d="M12.02 7.32999C12.02 4.73977 9.92027 2.63999 7.33005 2.63999C4.73984 2.63999 2.64005 4.73977 2.64005 7.32999C2.64005 9.92021 4.73984 12.02 7.33005 12.02C9.92027 12.02 12.02 9.92021 12.02 7.32999ZM13.36 7.32999C13.36 10.6603 10.6604 13.36 7.33005 13.36C3.99977 13.36 1.30005 10.6603 1.30005 7.32999C1.30005 3.99971 3.99977 1.29999 7.33005 1.29999C10.6604 1.29999 13.36 3.99971 13.36 7.32999Z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Notification Bell with pulse animation */}
          <button className="p-3 bg-white/10 rounded-md hover:bg-white/20 transition-all duration-300 hover:scale-110 group backdrop-blur-sm">
            <svg className="w-4 h-4 text-white group-hover:animate-pulse" viewBox="0 0 16 16" fill="none">
              <path
                d="M8.61727 13.6025C8.81585 13.3269 9.19487 13.2413 9.4953 13.4147C9.7958 13.5881 9.91137 13.9594 9.77208 14.2692L9.74072 14.33C9.56431 14.6355 9.31065 14.8891 9.00526 15.0655C8.69981 15.2418 8.35295 15.3349 8.00026 15.335C7.64751 15.335 7.30078 15.2418 6.99526 15.0655C6.72787 14.9111 6.50013 14.6976 6.32919 14.4419L6.25918 14.33L6.22777 14.2692C6.08852 13.9594 6.20411 13.5881 6.50454 13.4147C6.80498 13.2413 7.184 13.3269 7.38259 13.6025L7.41991 13.66L7.46835 13.7333C7.52168 13.8028 7.58888 13.8613 7.66526 13.9054C7.76704 13.9641 7.88275 13.995 8.00026 13.995C8.11778 13.9949 8.23349 13.9641 8.33526 13.9054C8.43704 13.8466 8.52119 13.7618 8.57995 13.66L8.61727 13.6025Z"
                fill="currentColor"
              />
              <path
                d="M11.3498 5.32501C11.3498 4.43665 10.9971 3.58468 10.369 2.95645C9.74076 2.32821 8.88832 1.97501 7.99983 1.97501C7.11141 1.97506 6.25947 2.32825 5.63126 2.95645C5.00307 3.58469 4.64982 4.43658 4.64982 5.32501L4.6472 5.61552C4.61852 7.03921 4.37753 8.05687 4.00206 8.85169C3.60645 9.68912 3.08147 10.2297 2.64047 10.685L13.3598 10.685C12.9179 10.2295 12.3936 9.68859 11.9983 8.85169C11.5976 8.00367 11.3498 6.90226 11.3498 5.32501ZM12.6898 5.32501C12.6898 6.76196 12.9149 7.65587 13.2093 8.27917C13.4307 8.74777 13.7035 9.09195 14.0141 9.42876L14.3367 9.76771L14.3511 9.78339C14.5258 9.97548 14.6412 10.2141 14.6828 10.4704C14.7244 10.7266 14.6909 10.9894 14.586 11.2268C14.4809 11.4642 14.3089 11.6662 14.0913 11.8078C13.9009 11.9317 13.6823 12.0054 13.4566 12.0217L13.3598 12.025L2.63982 12.025C2.38011 12.0248 2.12581 11.949 1.90831 11.8071C1.6908 11.6652 1.51909 11.4631 1.41432 11.2254C1.30958 10.9879 1.2762 10.7247 1.31814 10.4685C1.36009 10.2123 1.47559 9.97387 1.65052 9.78205L1.66426 9.76704L1.98683 9.42876C2.29692 9.09208 2.56895 8.74777 2.79031 8.27917C3.06634 7.6948 3.28139 6.87264 3.3072 5.58804L3.30982 5.32501C3.30982 4.08114 3.80429 2.88792 4.68384 2.00838C5.56332 1.12903 6.75611 0.635057 7.99983 0.63501C9.24362 0.63501 10.4369 1.12889 11.3165 2.00838C12.196 2.88792 12.6898 4.08114 12.6898 5.32501Z"
                fill="currentColor"
              />
            </svg>
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-safence-danger rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-safence-danger rounded-full"></span>
          </button>

          {/* User Avatar with hover effect */}
          <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden hover:scale-110 transition-transform duration-300 cursor-pointer backdrop-blur-sm">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/12bcc753772a48d717586ab0695784b0338cbcaf?width=72"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
