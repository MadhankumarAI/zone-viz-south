import { useMemo, useEffect, useRef } from "react";
import L, { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

// Create colored SVG icons for different device statuses
const createSVGIcon = (color: string) => {
  const svgString = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="${color}" stroke="#000" stroke-width="1"/>
      <circle cx="12.5" cy="12.5" r="4" fill="#fff"/>
    </svg>
  `;
  
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

const icons = {
  safe: createSVGIcon('#10B981'),       // Green
  warning: createSVGIcon('#F59E0B'),    // Orange  
  alert: createSVGIcon('#EF4444'),      // Red
  offline: createSVGIcon('#6B7280'),    // Gray
  maintenance: createSVGIcon('#3B82F6') // Blue
};

// South India locations data with devices and zones
export const southIndiaLocations = [
  // Tamil Nadu
  { id: '1', name: 'Chennai Central Station', position: [13.0843, 80.2705] as LatLngTuple, status: 'safe' as const, type: 'camera' as const, state: 'Tamil Nadu', district: 'Chennai', category: 'transport', description: 'Main railway station with CCTV monitoring' },
  { id: '2', name: 'Coimbatore Industrial Area', position: [11.0168, 76.9558] as LatLngTuple, status: 'warning' as const, type: 'sensorNode' as const, state: 'Tamil Nadu', district: 'Coimbatore', category: 'industrial', description: 'Industrial zone with sensor network' },
  { id: '3', name: 'Madurai Temple Complex', position: [9.9252, 78.1198] as LatLngTuple, status: 'alert' as const, type: 'camera' as const, state: 'Tamil Nadu', district: 'Madurai', category: 'heritage', description: 'Temple security system alert' },
  { id: '4', name: 'Tiruchirappalli Airport', position: [10.7654, 78.7097] as LatLngTuple, status: 'safe' as const, type: 'gateway' as const, state: 'Tamil Nadu', district: 'Tiruchirappalli', category: 'transport', description: 'Airport security gateway' },
  
  // Karnataka
  { id: '5', name: 'Bangalore Tech Park', position: [12.9716, 77.5946] as LatLngTuple, status: 'safe' as const, type: 'sensorNode' as const, state: 'Karnataka', district: 'Bangalore', category: 'commercial', description: 'Technology park monitoring' },
  { id: '6', name: 'Mysore Palace', position: [12.3051, 76.6551] as LatLngTuple, status: 'warning' as const, type: 'camera' as const, state: 'Karnataka', district: 'Mysore', category: 'heritage', description: 'Historical site surveillance' },
  { id: '7', name: 'Mangalore Port', position: [12.9141, 74.8560] as LatLngTuple, status: 'safe' as const, type: 'gateway' as const, state: 'Karnataka', district: 'Dakshina Kannada', category: 'port', description: 'Port security system' },
  { id: '8', name: 'Dharwad University', position: [15.4589, 75.0078] as LatLngTuple, status: 'offline' as const, type: 'sensorNode' as const, state: 'Karnataka', district: 'Dharwad', category: 'commercial', description: 'University campus monitoring' },
  
  // Andhra Pradesh
  { id: '9', name: 'Visakhapatnam Steel Plant', position: [17.7231, 83.2501] as LatLngTuple, status: 'alert' as const, type: 'sensorNode' as const, state: 'Andhra Pradesh', district: 'Visakhapatnam', category: 'industrial', description: 'Steel plant security alert' },
  { id: '10', name: 'Tirupati Temple', position: [13.6288, 79.4192] as LatLngTuple, status: 'safe' as const, type: 'camera' as const, state: 'Andhra Pradesh', district: 'Chittoor', category: 'heritage', description: 'Temple complex monitoring' },
  { id: '11', name: 'Vijayawada Railway Junction', position: [16.5062, 80.6480] as LatLngTuple, status: 'warning' as const, type: 'gateway' as const, state: 'Andhra Pradesh', district: 'Krishna', category: 'transport', description: 'Major railway junction' },
  
  // Telangana
  { id: '12', name: 'Hyderabad HITEC City', position: [17.4485, 78.3908] as LatLngTuple, status: 'safe' as const, type: 'sensorNode' as const, state: 'Telangana', district: 'Hyderabad', category: 'commercial', description: 'IT city monitoring' },
  { id: '13', name: 'Warangal Fort', position: [18.0074, 79.5941] as LatLngTuple, status: 'maintenance' as const, type: 'camera' as const, state: 'Telangana', district: 'Warangal', category: 'heritage', description: 'Fort under maintenance' },
  
  // Kerala
  { id: '14', name: 'Kochi Port', position: [9.9312, 76.2673] as LatLngTuple, status: 'safe' as const, type: 'gateway' as const, state: 'Kerala', district: 'Ernakulam', category: 'port', description: 'Major port facility' },
  { id: '15', name: 'Trivandrum Airport', position: [8.4821, 76.9199] as LatLngTuple, status: 'safe' as const, type: 'camera' as const, state: 'Kerala', district: 'Thiruvananthapuram', category: 'transport', description: 'International airport' },
  { id: '16', name: 'Kozhikode Beach', position: [11.2588, 75.7804] as LatLngTuple, status: 'warning' as const, type: 'sensorNode' as const, state: 'Kerala', district: 'Kozhikode', category: 'tourism', description: 'Beach area monitoring' },
  
  // Puducherry
  { id: '17', name: 'Puducherry Beach Front', position: [11.9416, 79.8083] as LatLngTuple, status: 'safe' as const, type: 'camera' as const, state: 'Puducherry', district: 'Puducherry', category: 'tourism', description: 'Beach surveillance' }
];

// Zone overlays for South India - Red, Orange, Green zones
export const zoneOverlays = [
  // Red Alert Zones (High Risk)
  {
    id: 'red-zone-1',
    name: 'Chennai High Security Zone',
    bounds: [[13.0400, 80.2400], [13.1200, 80.3000]] as LatLngBoundsExpression,
    color: '#EF4444',
    fillOpacity: 0.2,
    type: 'alert' as const
  },
  {
    id: 'red-zone-2', 
    name: 'Visakhapatnam Industrial Zone',
    bounds: [[17.6800, 83.2000], [17.7600, 83.3000]] as LatLngBoundsExpression,
    color: '#EF4444',
    fillOpacity: 0.2,
    type: 'alert' as const
  },
  
  // Orange Warning Zones (Medium Risk)
  {
    id: 'orange-zone-1',
    name: 'Bangalore Tech Corridor',
    bounds: [[12.9400, 77.5600], [13.0000, 77.6400]] as LatLngBoundsExpression,
    color: '#F59E0B',
    fillOpacity: 0.15,
    type: 'warning' as const
  },
  {
    id: 'orange-zone-2',
    name: 'Coimbatore Industrial Belt',
    bounds: [[10.9800, 76.9200], [11.0500, 77.0000]] as LatLngBoundsExpression,
    color: '#F59E0B', 
    fillOpacity: 0.15,
    type: 'warning' as const
  },
  {
    id: 'orange-zone-3',
    name: 'Hyderabad Business District',
    bounds: [[17.4200, 78.3600], [17.4800, 78.4200]] as LatLngBoundsExpression,
    color: '#F59E0B',
    fillOpacity: 0.15,
    type: 'warning' as const
  },
  
  // Green Safe Zones (Low Risk)
  {
    id: 'green-zone-1',
    name: 'Kochi Safe Harbor',
    bounds: [[9.9000, 76.2400], [9.9600, 76.2900]] as LatLngBoundsExpression,
    color: '#10B981',
    fillOpacity: 0.1,
    type: 'safe' as const
  },
  {
    id: 'green-zone-2',
    name: 'Mysore Heritage Zone',
    bounds: [[12.2900, 76.6300], [12.3200, 76.6700]] as LatLngBoundsExpression,
    color: '#10B981',
    fillOpacity: 0.1,
    type: 'safe' as const
  },
  {
    id: 'green-zone-3',
    name: 'Trivandrum Secure Area',
    bounds: [[8.4600, 76.9000], [8.5000, 76.9400]] as LatLngBoundsExpression,
    color: '#10B981',
    fillOpacity: 0.1,
    type: 'safe' as const
  }
];

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

interface MapViewProps {
  onPinClick?: (pin: Pin) => void;
  filters: Filters;
}

export default function MapView({ onPinClick, filters }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<{ [key: string]: L.Marker }>({});
  const zones = useRef<{ [key: string]: L.Rectangle }>({});

  const filteredLocations = useMemo(() => {
    return southIndiaLocations.filter(location => {
      // Status filter
      if (!filters[location.status]) return false;
      
      // Device type filter
      if (!filters[location.type]) return false;
      
      // State filter
      if (filters.states.length > 0 && !filters.states.includes(location.state)) return false;
      
      // District filter  
      if (filters.districts.length > 0 && !filters.districts.includes(location.district)) return false;
      
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(location.category)) return false;
      
      return true;
    });
  }, [filters]);

  const filteredZones = useMemo(() => {
    return zoneOverlays.filter(zone => {
      return filters[zone.type];
    });
  }, [filters]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize the map
    map.current = L.map(mapContainer.current, {
      center: [13.0827, 80.2707], // Chennai as center
      zoom: 6,
      zoomControl: false,
      maxBounds: [[8.0, 74.0], [20.0, 84.0]], // South India bounds
      maxBoundsViscosity: 0.8
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update markers based on filtered locations
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => {
      map.current?.removeLayer(marker);
    });
    markers.current = {};

    // Add filtered markers
    filteredLocations.forEach(location => {
      const marker = L.marker(location.position, {
        icon: icons[location.status]
      });

      marker.bindPopup(`
        <div class="text-sm">
          <strong>${location.name}</strong><br/>
          <span class="capitalize text-xs text-gray-600">
            ${location.type} • ${location.status}
          </span><br/>
          <span class="text-xs">${location.description}</span><br/>
          <span class="text-xs text-gray-600">
            ${location.district}, ${location.state}
          </span>
        </div>
      `);

      marker.on('click', () => {
        onPinClick?.(location as Pin);
      });

      marker.addTo(map.current!);
      markers.current[location.id] = marker;
    });
  }, [filteredLocations, onPinClick]);

  // Update zones based on filtered zones
  useEffect(() => {
    if (!map.current) return;

    // Clear existing zones
    Object.values(zones.current).forEach(zone => {
      map.current?.removeLayer(zone);
    });
    zones.current = {};

    // Add filtered zones
    filteredZones.forEach(zone => {
      const rectangle = L.rectangle(zone.bounds, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: zone.fillOpacity,
        weight: 2
      });

      rectangle.bindPopup(`
        <div class="text-sm">
          <strong>${zone.name}</strong><br/>
          <span class="capitalize">${zone.type} Zone</span>
        </div>
      `);

      rectangle.addTo(map.current!);
      zones.current[zone.id] = rectangle;
    });
  }, [filteredZones]);

  return (
    <div className="w-full h-full relative bg-map-bg rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}