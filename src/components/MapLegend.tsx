import { useState } from 'react';
import { ChevronRight, ChevronDown } from "lucide-react";

export default function MapLegend() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-64 bg-map-card border border-map-card-border rounded-lg p-4 transition-all duration-300 overflow-hidden">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleOpen}
      >
        {/* Title is on the left */}
        <h3 className="text-map-text-primary font-semibold text-base">
          Map Legend
        </h3>
        
        {/* Button is on the right */}
        <button className="text-map-text-primary hover:text-map-text-secondary transition-transform duration-300">
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
      
      <div 
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
        style={{
          overflow: 'hidden'
        }}
      >
        <div className="space-y-3">
          {/* Safe Devices */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-map-text-primary" style={{ backgroundColor: '#10B981' }}></div>
            <span className="text-map-text-primary text-sm">Safe Devices</span>
          </div>
          
          {/* Warning Devices */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-map-text-primary" style={{ backgroundColor: '#F59E0B' }}></div>
            <span className="text-map-text-primary text-sm">Warning Devices</span>
          </div>
          
          {/* Alert Devices */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-map-text-primary" style={{ backgroundColor: '#EF4444' }}></div>
            <span className="text-map-text-primary text-sm">Alert Devices</span>
          </div>

          {/* Offline Devices */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-map-text-primary" style={{ backgroundColor: '#6B7280' }}></div>
            <span className="text-map-text-primary text-sm">Offline Devices</span>
          </div>

          {/* Maintenance Devices */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-map-text-primary" style={{ backgroundColor: '#3B82F6' }}></div>
            <span className="text-map-text-primary text-sm">Maintenance</span>
          </div>
        </div>
        
        <div className="border-t border-map-card-border pt-3 mt-4">
          <h4 className="text-map-text-primary text-sm font-medium mb-2">Zones</h4>
          
          {/* Safe Zone */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 border-2 rounded-sm bg-opacity-10" style={{ borderColor: '#10B981', backgroundColor: '#10B981' }}></div>
            <span className="text-map-text-primary text-sm">Safe Zone</span>
          </div>
          
          {/* Warning Zone */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 border-2 rounded-sm bg-opacity-15" style={{ borderColor: '#F59E0B', backgroundColor: '#F59E0B' }}></div>
            <span className="text-map-text-primary text-sm">Warning Zone</span>
          </div>
          
          {/* Alert Zone */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 rounded-sm bg-opacity-20" style={{ borderColor: '#EF4444', backgroundColor: '#EF4444' }}></div>
            <span className="text-map-text-primary text-sm">Alert Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
