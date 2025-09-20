import { ChevronLeft, Search, Filter, Shield, Radio, Camera, Wifi, MapPin, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface Filters {
  safe: boolean;
  warning: boolean;
  alert: boolean;
  offline: boolean;
  maintenance: boolean;
  
  sensorNode: boolean;
  camera: boolean;
  gateway: boolean;
  
  states: string[];
  districts: string[];
  categories: string[];
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const allStates = ['Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Puducherry'];
const allDistricts = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Bangalore', 'Mysore', 
  'Dakshina Kannada', 'Dharwad', 'Visakhapatnam', 'Chittoor', 'Krishna', 
  'Hyderabad', 'Warangal', 'Ernakulam', 'Thiruvananthapuram', 'Kozhikode', 'Puducherry'
];
const allCategories = ['transport', 'industrial', 'heritage', 'commercial', 'port', 'tourism'];

export default function MapSidebar({ isCollapsed, onToggleCollapse, filters, onFilterChange }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFilterChange = (filterType: keyof Filters, value?: any) => {
    if (Array.isArray(filters[filterType])) {
      const currentArray = filters[filterType] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      onFilterChange({ ...filters, [filterType]: newArray });
    } else {
      onFilterChange({ ...filters, [filterType]: !filters[filterType] });
    }
  };

  const clearAllFilters = () => {
    onFilterChange({
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
  };

  // Get active filter count for mobile
  const getActiveFilterCount = () => {
    let count = 0;
    if (!filters.safe) count++;
    if (!filters.warning) count++;
    if (!filters.alert) count++;
    if (!filters.offline) count++;
    if (!filters.maintenance) count++;
    if (!filters.sensorNode) count++;
    if (!filters.camera) count++;
    if (!filters.gateway) count++;
    count += filters.states.length;
    count += filters.districts.length;
    count += filters.categories.length;
    return count;
  };

  // Mobile Filter Button
  if (isMobile) {
    return (
      <>
        {/* Mobile Filter Toggle Button */}
        <button
  onClick={() => setShowMobileFilters(true)}
  className="
    fixed bottom-4 left-4 z-40
    bg-map-card border border-map-card-border rounded-lg p-3 shadow-lg flex items-center gap-2
    md:top-2 md:left-2 md:bottom-auto  /* go back to top-left on md+ screens */
  "
>
  <Menu className="w-4 h-4 text-map-text-primary" />
  <span className="text-sm text-map-text-primary font-medium">Filters</span>
  {getActiveFilterCount() > 0 && (
    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
      {getActiveFilterCount()}
    </span>
  )}
</button>


        {/* Mobile Filter Panel */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-sidebar border-r border-sidebar-border overflow-y-auto">
              {/* Mobile Header */}
              <div className="p-4 border-b border-sidebar-border bg-sidebar sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sidebar-foreground font-semibold text-lg">Device Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-sidebar-accent rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-sidebar-foreground" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sidebar-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search devices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder-sidebar-foreground/60 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
                  />
                </div>
              </div>

              {/* Mobile Filter Content */}
              <div className="p-4 space-y-6">
                {/* Status Section */}
                <div>
                  <h3 className="text-sidebar-foreground font-medium text-base mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Status
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'safe' as const, label: 'Safe', color: 'hsl(120, 60%, 50%)' },
                      { key: 'warning' as const, label: 'Warning', color: 'hsl(38, 92%, 50%)' },
                      { key: 'alert' as const, label: 'Alert', color: 'hsl(0, 84%, 60%)' },
                      { key: 'offline' as const, label: 'Offline', color: 'hsl(0, 0%, 45%)' },
                      { key: 'maintenance' as const, label: 'Maintenance', color: 'hsl(217, 91%, 60%)' }
                    ].map(({ key, label, color }) => (
                      <label key={key} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={filters[key]}
                          onChange={() => handleFilterChange(key)}
                          className="w-4 h-4 text-sidebar-primary border-sidebar-border rounded focus:ring-sidebar-ring"
                        />
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                        <span className="text-sidebar-foreground text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Device Type Section */}
                <div>
                  <h3 className="text-sidebar-foreground font-medium text-base mb-3">Device Type</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'sensorNode' as const, label: 'Sensor Node', icon: Radio },
                      { key: 'camera' as const, label: 'Camera', icon: Camera },
                      { key: 'gateway' as const, label: 'Gateway', icon: Wifi }
                    ].map(({ key, label, icon: Icon }) => (
                      <label key={key} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={filters[key]}
                          onChange={() => handleFilterChange(key)}
                          className="w-4 h-4 text-sidebar-primary border-sidebar-border rounded focus:ring-sidebar-ring"
                        />
                        <Icon className="h-5 w-5 text-sidebar-foreground flex-shrink-0" />
                        <span className="text-sidebar-foreground text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Filters */}
                <div>
                  <h3 className="text-sidebar-foreground font-medium text-base mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </h3>
                  
                  {/* States */}
                  <div className="mb-4">
                    <h4 className="text-sidebar-foreground text-sm font-medium mb-2">States</h4>
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                      {allStates.map(state => (
                        <label key={state} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-sidebar-accent/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.states.includes(state)}
                            onChange={() => handleFilterChange('states', state)}
                            className="w-3 h-3 text-sidebar-primary border-sidebar-border rounded"
                          />
                          <span className="text-sidebar-foreground text-xs">{state}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-4">
                    <h4 className="text-sidebar-foreground text-sm font-medium mb-2">Categories</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {allCategories.map(category => (
                        <label key={category} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-sidebar-accent/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={() => handleFilterChange('categories', category)}
                            className="w-3 h-3 text-sidebar-primary border-sidebar-border rounded"
                          />
                          <span className="text-sidebar-foreground text-xs capitalize">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="p-4 border-t border-sidebar-border bg-sidebar sticky bottom-0">
                <div className="flex gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="flex-1 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop Sidebar (original behavior)
  if (isCollapsed) {
    return (
      <div className="w-16 min-h-full bg-sidebar border-r border-sidebar-border flex flex-col items-center justify-end p-3">
        <button
          onClick={onToggleCollapse}
          className="transform rotate-180 text-sidebar-foreground hover:bg-sidebar-accent p-2 rounded-md transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 min-h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sidebar-foreground font-semibold text-lg">Device Filters</h2>
          <button
            onClick={onToggleCollapse}
            className="text-sidebar-foreground hover:bg-sidebar-accent p-2 rounded-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sidebar-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder-sidebar-foreground/60 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
          />
        </div>
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Status Section */}
        <div className="mb-6">
          <h3 className="text-sidebar-foreground font-medium text-sm mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Status
          </h3>
          <div className="space-y-2">
            {[
              { key: 'safe' as const, label: 'Safe', color: 'hsl(120, 60%, 50%)' },
              { key: 'warning' as const, label: 'Warning', color: 'hsl(38, 92%, 50%)' },
              { key: 'alert' as const, label: 'Alert', color: 'hsl(0, 84%, 60%)' },
              { key: 'offline' as const, label: 'Offline', color: 'hsl(0, 0%, 45%)' },
              { key: 'maintenance' as const, label: 'Maintenance', color: 'hsl(217, 91%, 60%)' }
            ].map(({ key, label, color }) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters[key]}
                  onChange={() => handleFilterChange(key)}
                  className="w-4 h-4 text-sidebar-primary border-sidebar-border rounded focus:ring-sidebar-ring"
                />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-sidebar-foreground text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Device Type Section */}
        <div className="mb-6">
          <h3 className="text-sidebar-foreground font-medium text-sm mb-3">Device Type</h3>
          <div className="space-y-2">
            {[
              { key: 'sensorNode' as const, label: 'Sensor Node', icon: Radio },
              { key: 'camera' as const, label: 'Camera', icon: Camera },
              { key: 'gateway' as const, label: 'Gateway', icon: Wifi }
            ].map(({ key, label, icon: Icon }) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters[key]}
                  onChange={() => handleFilterChange(key)}
                  className="w-4 h-4 text-sidebar-primary border-sidebar-border rounded focus:ring-sidebar-ring"
                />
                <Icon className="h-4 w-4 text-sidebar-foreground" />
                <span className="text-sidebar-foreground text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Filters */}
        <div className="mb-6">
          <h3 className="text-sidebar-foreground font-medium text-sm mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </h3>
          
          {/* States */}
          <div className="mb-4">
            <h4 className="text-sidebar-foreground text-xs font-medium mb-2">States</h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {allStates.map(state => (
                <label key={state} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.states.includes(state)}
                    onChange={() => handleFilterChange('states', state)}
                    className="w-3 h-3 text-sidebar-primary border-sidebar-border rounded"
                  />
                  <span className="text-sidebar-foreground text-xs">{state}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <h4 className="text-sidebar-foreground text-xs font-medium mb-2">Categories</h4>
            <div className="space-y-1">
              {allCategories.map(category => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleFilterChange('categories', category)}
                    className="w-3 h-3 text-sidebar-primary border-sidebar-border rounded"
                  />
                  <span className="text-sidebar-foreground text-xs capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Filters Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={clearAllFilters}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Clear All Filters
        </button>
      </div>
    </div>
  );
}