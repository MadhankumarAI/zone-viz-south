import { useState } from "react";
import MapLegend from "../components/MapLegend";
import MapSidebar from "../components/MapSidebar";
import MapView, { southIndiaLocations } from "../components/MapView";

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

export default function Map() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
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

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    console.log("Pin clicked:", pin);
  };

  // Get stats for display
  const totalDevices = southIndiaLocations.length;
  const activeDevices = southIndiaLocations.filter(loc => loc.status !== 'offline').length;
  const alertDevices = southIndiaLocations.filter(loc => loc.status === 'alert').length;

  return (
    <div className="w-full h-screen bg-map-bg">
      <div className="flex h-full gap-4 p-4">
        {/* Sidebar */}
        <div className="shrink-0">
          <MapSidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((v) => !v)}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Stats Bar */}
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
            <div className="flex-1 min-w-0">
              <MapView
                onPinClick={handlePinClick}
                filters={filters}
              />
            </div>

            {/* Map Legend */}
            <div className="shrink-0">
              <MapLegend />
            </div>
          </div>

          {/* Selected Pin Info
          {selectedPin && (
            <div className="bg-map-card border border-map-card-border rounded-lg p-4">
              <h3 className="text-map-text-primary font-semibold mb-2">Selected Device</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-map-text-secondary">Name:</span>
                  <span className="text-map-text-primary ml-2">{selectedPin.name}</span>
                </div>
                <div>
                  <span className="text-map-text-secondary">Status:</span>
                  <span className={`ml-2 capitalize font-medium ${
                    selectedPin.status === 'safe' ? 'text-map-safe' :
                    selectedPin.status === 'warning' ? 'text-map-warning' :
                    selectedPin.status === 'alert' ? 'text-map-alert' :
                    selectedPin.status === 'offline' ? 'text-map-offline' :
                    'text-map-maintenance'
                  }`}>
                    {selectedPin.status}
                  </span>
                </div>
                <div>
                  <span className="text-map-text-secondary">Type:</span>
                  <span className="text-map-text-primary ml-2 capitalize">{selectedPin.type}</span>
                </div>
                <div>
                  <span className="text-map-text-secondary">Location:</span>
                  <span className="text-map-text-primary ml-2">{selectedPin.district}, {selectedPin.state}</span>
                </div>
                {selectedPin.description && (
                  <div className="col-span-2">
                    <span className="text-map-text-secondary">Description:</span>
                    <span className="text-map-text-primary ml-2">{selectedPin.description}</span>
                  </div>
                )}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}