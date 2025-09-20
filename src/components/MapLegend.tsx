import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MapLegend() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse on mobile
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`
      ${isMobile ? 'fixed top-16 right-2 z-50' : 'relative'}
      ${isOpen ? 'w-64' : 'w-12'}
      bg-map-card border border-map-card-border rounded-lg transition-all duration-300 overflow-hidden
      ${isMobile ? 'shadow-xl max-w-[calc(100vw-1rem)]' : ''}
    `}>
      {/* Toggle Button - Always visible */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={toggleOpen}
      >
        {/* Title - only show when open or on desktop */}
        {(isOpen || !isMobile) && (
          <h3 className={`text-map-text-primary font-semibold transition-opacity duration-300 ${
            isOpen ? 'opacity-100 text-sm sm:text-base' : 'opacity-0'
          }`}>
            Map Legend
          </h3>
        )}
        
        {/* Toggle button */}
        <button className="text-map-text-primary hover:text-map-text-secondary transition-all duration-300 flex-shrink-0">
          {isOpen ? <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>
      
      {/* Content - slides from right */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ overflow: 'hidden' }}
      >
        <div className="px-3 pb-3 space-y-3">
          {/* Device Status Legend */}
          <div className="space-y-2">
            <h4 className="text-map-text-primary text-xs sm:text-sm font-medium uppercase tracking-wide">
              Device Status
            </h4>
            
            {/* Safe Devices */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-map-text-primary/20" 
                   style={{ backgroundColor: 'hsl(120, 60%, 50%)' }}>
              </div>
              <span className="text-map-text-primary text-xs sm:text-sm">Safe Devices</span>
            </div>
            
            {/* Warning Devices */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-map-text-primary/20" 
                   style={{ backgroundColor: 'hsl(38, 92%, 50%)' }}>
              </div>
              <span className="text-map-text-primary text-xs sm:text-sm">Warning Devices</span>
            </div>
            
            {/* Alert Devices */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-map-text-primary/20" 
                   style={{ backgroundColor: 'hsl(0, 84%, 60%)' }}>
              </div>
              <span className="text-map-text-primary text-xs sm:text-sm">Alert Devices</span>
            </div>

            {/* Offline Devices */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-map-text-primary/20" 
                   style={{ backgroundColor: 'hsl(0, 0%, 45%)' }}>
              </div>
              <span className="text-map-text-primary text-xs sm:text-sm">Offline Devices</span>
            </div>

            {/* Maintenance Devices */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-map-text-primary/20" 
                   style={{ backgroundColor: 'hsl(217, 91%, 60%)' }}>
              </div>
              <span className="text-map-text-primary text-xs sm:text-sm">Maintenance</span>
            </div>
          </div>
          
          {/* Zone Legend */}
          <div className="border-t border-map-card-border pt-2 mt-3">
            <h4 className="text-map-text-primary text-xs sm:text-sm font-medium mb-2 uppercase tracking-wide">
              Security Zones
            </h4>
            
            {/* Safe Zone */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border border-map-safe rounded-sm bg-map-safe/10"></div>
              <span className="text-map-text-primary text-xs sm:text-sm">Safe Zone</span>
            </div>
            
            {/* Warning Zone */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border border-map-warning rounded-sm bg-map-warning/15"></div>
              <span className="text-map-text-primary text-xs sm:text-sm">Warning Zone</span>
            </div>
            
            {/* Alert Zone */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border border-map-alert rounded-sm bg-map-alert/20"></div>
              <span className="text-map-text-primary text-xs sm:text-sm">Alert Zone</span>
            </div>
          </div>

          {/* Device Types - Mobile only compact version */}
          {isMobile && (
            <div className="border-t border-map-card-border pt-2 mt-3">
              <h4 className="text-map-text-primary text-xs font-medium mb-2 uppercase tracking-wide">
                Device Types
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-muted rounded text-xs">Sensors</span>
                <span className="px-2 py-1 bg-muted rounded text-xs">Cameras</span>
                <span className="px-2 py-1 bg-muted rounded text-xs">Gateways</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom styles for mobile positioning */}
      <style jsx>{`
        @media (max-width: 767px) {
          .legend-container {
            position: fixed;
            top: 4rem;
            right: 0.5rem;
            z-index: 50;
            max-width: calc(100vw - 1rem);
          }
        }
      `}</style>
    </div>
  );
}