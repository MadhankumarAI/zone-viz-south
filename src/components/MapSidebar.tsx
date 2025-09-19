import { ChevronLeft, Search, Filter, Shield, Radio, Camera, Wifi, MapPin } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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

  if (isCollapsed) {
    return (
      <div className="w-16 min-h-full bg-sidebar border-r border-sidebar-border flex flex-col items-center justify-end p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="transform rotate-180 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 min-h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sidebar-foreground font-semibold text-lg">Device Filters</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sidebar-foreground h-4 w-4" />
          <Input
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
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
              { key: 'safe' as const, label: 'Safe', color: '#10B981' },
              { key: 'warning' as const, label: 'Warning', color: '#F59E0B' },
              { key: 'alert' as const, label: 'Alert', color: '#EF4444' },
              { key: 'offline' as const, label: 'Offline', color: '#6B7280' },
              { key: 'maintenance' as const, label: 'Maintenance', color: '#3B82F6' }
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center space-x-3">
                <Checkbox
                  id={key}
                  checked={filters[key]}
                  onCheckedChange={() => handleFilterChange(key)}
                  className="border-sidebar-border"
                />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <label htmlFor={key} className="text-sidebar-foreground text-sm cursor-pointer">
                  {label}
                </label>
              </div>
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
              <div key={key} className="flex items-center space-x-3">
                <Checkbox
                  id={key}
                  checked={filters[key]}
                  onCheckedChange={() => handleFilterChange(key)}
                  className="border-sidebar-border"
                />
                <Icon className="h-4 w-4 text-sidebar-foreground" />
                <label htmlFor={key} className="text-sidebar-foreground text-sm cursor-pointer">
                  {label}
                </label>
              </div>
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
                <div key={state} className="flex items-center space-x-2">
                  <Checkbox
                    id={`state-${state}`}
                    checked={filters.states.includes(state)}
                    onCheckedChange={() => handleFilterChange('states', state)}
                    className="border-sidebar-border"
                  />
                  <label htmlFor={`state-${state}`} className="text-sidebar-foreground text-xs cursor-pointer">
                    {state}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <h4 className="text-sidebar-foreground text-xs font-medium mb-2">Categories</h4>
            <div className="space-y-1">
              {allCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => handleFilterChange('categories', category)}
                    className="border-sidebar-border"
                  />
                  <label htmlFor={`category-${category}`} className="text-sidebar-foreground text-xs cursor-pointer capitalize">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Filters Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={clearAllFilters}
          variant="outline"
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 border-sidebar-primary"
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}