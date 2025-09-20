
import MapLegend from "../components/MapLegend";
import MapSidebar from "../components/MapSidebar";
import MapView, { southIndiaLocations } from "../components/MapView";


import { useState, useEffect } from "react";


interface Filters {
  // Status filters
  safe: boolean;
  warning: boolean;
  alert: boolean;
  offline: boolean;
  maintenance: boolean;
  
  // Device type filters
  sensorNode: boolean;
  camera: boolean;
  gateway: boolean;
  
  // Location filters
  states: string[];
  districts: string[];
  categories: string[];
}

interface Pin {
  id: string;
  name: string;
  position: [number, number];
  status: 'safe' | 'warning' | 'alert' | 'offline' | 'maintenance';
  type: 'sensorNode' | 'camera' | 'gateway';
  state: string;
  district: string;
  category: string;
  description?: string;
}

// Mock data for demo
const southIndiaLocations = [
  { id: '1', name: 'Chennai Central', position: [13.0843, 80.2705], status: 'safe', type: 'camera', state: 'Tamil Nadu', district: 'Chennai', category: 'transport' },
  { id: '2', name: 'Bangalore Tech Park', position: [12.9716, 77.5946], status: 'warning', type: 'sensorNode', state: 'Karnataka', district: 'Bangalore', category: 'commercial' },
  { id: '3', name: 'Hyderabad HITEC', position: [17.4485, 78.3908], status: 'alert', type: 'gateway', state: 'Telangana', district: 'Hyderabad', category: 'commercial' },
];

export default function Map() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    safe: true,
    warning: true,
    alert: true,
    offline: true,
    maintenance: true,
    sensorNode: true,
    camera: true,
    gateway: true,
    states: [],
    districts: [],
    categories: []
  });

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    console.log("Pin clicked:", pin);
  };

  // Get stats for display
  const totalDevices = southIndiaLocations.length;
  const activeDevices = southIndiaLocations.filter(loc => loc.status !== 'offline').length;
  const alertDevices = southIndiaLocations.filter(loc => loc.status === 'alert').length;

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="w-full h-screen bg-map-bg overflow-hidden">
        {/* Custom CSS for mobile responsiveness */}
        <style jsx>{`
          :root {
            --background: 0 0% 100%;
            --foreground: 0 0% 3.9%;
            --card: 0 0% 100%;
            --card-foreground: 0 0% 3.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 0 0% 3.9%;
            --primary: 142 76% 26%;
            --primary-foreground: 0 0% 98%;
            --secondary: 0 0% 96.1%;
            --secondary-foreground: 0 0% 9%;
            --muted: 0 0% 96.1%;
            --muted-foreground: 0 0% 45.1%;
            --accent: 0 0% 96.1%;
            --accent-foreground: 0 0% 9%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 0 0% 98%;
            --border: 0 0% 89.8%;
            --input: 0 0% 89.8%;
            --ring: 142 76% 26%;
            --radius: 0.5rem;
            --safence-primary: 142 76% 26%;
            --safence-primary-hover: 142 76% 20%;
            --safence-dark: 0 0% 9%;
            --safence-light: 0 0% 98%;
            --safence-gray: 0 0% 45.1%;
            --safence-success: 120 60% 50%;
            --safence-warning: 38 92% 50%;
            --safence-danger: 0 84% 60%;
            --map-safe: 120 60% 50%;
            --map-warning: 38 92% 50%;
            --map-alert: 0 84% 60%;
            --map-offline: 0 0% 45%;
            --map-maintenance: 217 91% 60%;
            --map-bg: 0 0% 98%;
            --map-card: 0 0% 100%;
            --map-card-border: 0 0% 89.8%;
            --map-text-primary: 0 0% 9%;
            --map-text-secondary: 0 0% 45.1%;
            --sidebar-background: 0 0% 98%;
            --sidebar-foreground: 0 0% 9%;
            --sidebar-primary: 142 76% 26%;
            --sidebar-primary-foreground: 0 0% 98%;
            --sidebar-accent: 0 0% 96.1%;
            --sidebar-accent-foreground: 0 0% 9%;
            --sidebar-border: 0 0% 89.8%;
            --sidebar-ring: 142 76% 26%;
          }
        `}</style>

        {/* Mobile Stats Bar - Collapsible */}
        <div className="relative z-30">
          <div className="bg-map-card border-b border-map-card-border p-2">
            <div className="flex justify-between items-center gap-2">
              {/* Compact Stats */}
              <div className="flex gap-1 flex-1">
                <div className="bg-primary/10 rounded-lg p-2 flex-1 min-w-0">
                  <div className="text-xs text-map-text-secondary">Total</div>
                  <div className="text-lg font-bold text-map-text-primary">{totalDevices}</div>
                </div>
                
                <div className="bg-map-safe/10 rounded-lg p-2 flex-1 min-w-0">
                  <div className="text-xs text-map-text-secondary">Active</div>
                  <div className="text-lg font-bold text-map-text-primary">{activeDevices}</div>
                </div>
                
                <div className="bg-map-alert/10 rounded-lg p-2 flex-1 min-w-0">
                  <div className="text-xs text-map-text-secondary">Alerts</div>
                  <div className="text-lg font-bold text-map-text-primary">{alertDevices}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Screen Map */}
        <div className="relative h-full">
          <MapView
            onPinClick={handlePinClick}
            filters={filters}
          />
        </div>

        {/* Mobile Sidebar (renders as overlay) */}
        <MapSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* Mobile Map Legend (fixed position) */}
        <div className="absolute top-16 right-2 z-40">
          <MapLegend />
        </div>
      </div>
    );
  }

  // Desktop Layout (original)
  return (
    <div className="w-full h-screen bg-map-bg">
      {/* Custom CSS for desktop */}
      <style jsx>{`
        :root {
          --background: 0 0% 100%;
          --foreground: 0 0% 3.9%;
          --card: 0 0% 100%;
          --card-foreground: 0 0% 3.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 0 0% 3.9%;
          --primary: 142 76% 26%;
          --primary-foreground: 0 0% 98%;
          --secondary: 0 0% 96.1%;
          --secondary-foreground: 0 0% 9%;
          --muted: 0 0% 96.1%;
          --muted-foreground: 0 0% 45.1%;
          --accent: 0 0% 96.1%;
          --accent-foreground: 0 0% 9%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 89.8%;
          --input: 0 0% 89.8%;
          --ring: 142 76% 26%;
          --radius: 0.5rem;
          --safence-primary: 142 76% 26%;
          --safence-primary-hover: 142 76% 20%;
          --safence-dark: 0 0% 9%;
          --safence-light: 0 0% 98%;
          --safence-gray: 0 0% 45.1%;
          --safence-success: 120 60% 50%;
          --safence-warning: 38 92% 50%;
          --safence-danger: 0 84% 60%;
          --map-safe: 120 60% 50%;
          --map-warning: 38 92% 50%;
          --map-alert: 0 84% 60%;
          --map-offline: 0 0% 45%;
          --map-maintenance: 217 91% 60%;
          --map-bg: 0 0% 98%;
          --map-card: 0 0% 100%;
          --map-card-border: 0 0% 89.8%;
          --map-text-primary: 0 0% 9%;
          --map-text-secondary: 0 0% 45.1%;
          --sidebar-background: 0 0% 98%;
          --sidebar-foreground: 0 0% 9%;
          --sidebar-primary: 142 76% 26%;
          --sidebar-primary-foreground: 0 0% 98%;
          --sidebar-accent: 0 0% 96.1%;
          --sidebar-accent-foreground: 0 0% 9%;
          --sidebar-border: 0 0% 89.8%;
          --sidebar-ring: 142 76% 26%;
        }
      `}</style>

      <div className="flex h-full gap-4 p-4">
        {/* Desktop Sidebar */}
        <div className="shrink-0">
          <MapSidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Desktop Stats Bar */}
          <div className="flex gap-4">
            <div className="bg-map-card border border-map-card-border rounded-lg p-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-map-text-secondary text-sm">Total Devices</p>
                  <p className="text-map-text-primary text-2xl font-bold">{totalDevices}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-map-card border border-map-card-border rounded-lg p-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-map-text-secondary text-sm">Active Devices</p>
                  <p className="text-map-text-primary text-2xl font-bold">{activeDevices}</p>
                </div>
                <div className="w-10 h-10 bg-map-safe/10 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-map-safe rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-map-card border border-map-card-border rounded-lg p-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-map-text-secondary text-sm">Alert Devices</p>
                  <p className="text-map-text-primary text-2xl font-bold">{alertDevices}</p>
                </div>
                <div className="w-10 h-10 bg-map-alert/10 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-map-alert rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Map and Legend Container */}
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Map View */}
            <div className="flex-1 min-w-0 relative">
              <MapView
                onPinClick={handlePinClick}
                filters={filters}
              />
            </div>

            {/* Desktop Map Legend */}
            <div className="shrink-0">
              <MapLegend />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}