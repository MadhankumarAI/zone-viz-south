import { useMemo, useEffect, useRef, useState } from "react";
import L, { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, MapPin, Route, Clock, Car, X, Leaf, Menu, ChevronDown, ChevronUp } from "lucide-react";

// Professional SVG Icons
const RouteIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4l6 3 5.447-2.724A1 1 0 0121 5.382v8.764a1 1 0 01-.553.894L15 18l-6-3z" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 7v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NavigationIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="3,11 22,2 13,21 11.5,13.5 3,11" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
  </svg>
);

// Animation component for loading route
const RouteLoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="relative">
      <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-map-safe/30 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary rounded-full animate-spin" 
           style={{ borderTopColor: 'transparent', animationDirection: 'reverse' }}></div>
    </div>
    <span className="ml-3 text-primary font-medium text-sm sm:text-base">Calculating optimal route...</span>
  </div>
);

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

// User location icon
const createUserLocationIcon = () => {
  const svgString = `
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="hsl(142, 76%, 26%)" stroke="#ffffff" stroke-width="2"/>
      <circle cx="10" cy="10" r="3" fill="#ffffff"/>
    </svg>
  `;
  
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const icons = {
  safe: createSVGIcon('hsl(120, 60%, 50%)'),       // Green
  warning: createSVGIcon('hsl(38, 92%, 50%)'),     // Orange  
  alert: createSVGIcon('hsl(0, 84%, 60%)'),        // Red
  offline: createSVGIcon('hsl(0, 0%, 45%)'),       // Gray
  maintenance: createSVGIcon('hsl(217, 91%, 60%)'), // Blue
  userLocation: createUserLocationIcon()
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

// Zone overlays for South India
export const zoneOverlays = [
  // Red Alert Zones (High Risk)
  {
    id: 'red-zone-1',
    name: 'Chennai High Security Zone',
    bounds: [[13.0400, 80.2400], [13.1200, 80.3000]] as LatLngBoundsExpression,
    color: 'hsl(0, 84%, 60%)',
    fillOpacity: 0.2,
    type: 'alert' as const
  },
  {
    id: 'red-zone-2', 
    name: 'Visakhapatnam Industrial Zone',
    bounds: [[17.6800, 83.2000], [17.7600, 83.3000]] as LatLngBoundsExpression,
    color: 'hsl(0, 84%, 60%)',
    fillOpacity: 0.2,
    type: 'alert' as const
  },
  
  // Orange Warning Zones (Medium Risk)
  {
    id: 'orange-zone-1',
    name: 'Bangalore Tech Corridor',
    bounds: [[12.9400, 77.5600], [13.0000, 77.6400]] as LatLngBoundsExpression,
    color: 'hsl(38, 92%, 50%)',
    fillOpacity: 0.15,
    type: 'warning' as const
  },
  {
    id: 'orange-zone-2',
    name: 'Coimbatore Industrial Belt',
    bounds: [[10.9800, 76.9200], [11.0500, 77.0000]] as LatLngBoundsExpression,
    color: 'hsl(38, 92%, 50%)', 
    fillOpacity: 0.15,
    type: 'warning' as const
  },
  {
    id: 'orange-zone-3',
    name: 'Hyderabad Business District',
    bounds: [[17.4200, 78.3600], [17.4800, 78.4200]] as LatLngBoundsExpression,
    color: 'hsl(38, 92%, 50%)',
    fillOpacity: 0.15,
    type: 'warning' as const
  },
  
  // Green Safe Zones (Low Risk)
  {
    id: 'green-zone-1',
    name: 'Kochi Safe Harbor',
    bounds: [[9.9000, 76.2400], [9.9600, 76.2900]] as LatLngBoundsExpression,
    color: 'hsl(120, 60%, 50%)',
    fillOpacity: 0.1,
    type: 'safe' as const
  },
  {
    id: 'green-zone-2',
    name: 'Mysore Heritage Zone',
    bounds: [[12.2900, 76.6300], [12.3200, 76.6700]] as LatLngBoundsExpression,
    color: 'hsl(120, 60%, 50%)',
    fillOpacity: 0.1,
    type: 'safe' as const
  },
  {
    id: 'green-zone-3',
    name: 'Trivandrum Secure Area',
    bounds: [[8.4600, 76.9000], [8.5000, 76.9400]] as LatLngBoundsExpression,
    color: 'hsl(120, 60%, 50%)',
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

interface RouteInfo {
  distance: string;
  duration: string;
  instructions: string[];
  arrivalTime: string;
  carbonFootprint: string;
  routeType: 'driving' | 'walking' | 'cycling';
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
  const userLocationMarker = useRef<L.Marker | null>(null);
  const routeLayer = useRef<L.Polyline | null>(null);
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [showPinDetails, setShowPinDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredLocations = useMemo(() => {
    return southIndiaLocations.filter(location => {
      if (!filters[location.status]) return false;
      if (!filters[location.type]) return false;
      if (filters.states.length > 0 && !filters.states.includes(location.state)) return false;
      if (filters.districts.length > 0 && !filters.districts.includes(location.district)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(location.category)) return false;
      return true;
    });
  }, [filters]);

  const filteredZones = useMemo(() => {
    return zoneOverlays.filter(zone => {
      return filters[zone.type];
    });
  }, [filters]);

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLocationError(null);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get route calculation
  const getRoute = async (destination: [number, number]) => {
    if (!userLocation) {
      getCurrentLocation();
      return;
    }

    setIsLoadingRoute(true);
    setShowRoutePanel(true);
    
    try {
      let routeData = null;
      
      try {
        const osrmResponse = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&steps=true`
        );
        
        if (osrmResponse.ok) {
          const osrmData = await osrmResponse.json();
          if (osrmData.routes && osrmData.routes.length > 0) {
            const route = osrmData.routes[0];
            routeData = {
              features: [{
                geometry: route.geometry,
                properties: {
                  summary: {
                    distance: route.distance,
                    duration: route.duration
                  },
                  segments: [{
                    steps: route.legs[0].steps.map((step: any) => ({
                      instruction: step.maneuver.instruction || 'Continue',
                      distance: step.distance,
                      duration: step.duration
                    }))
                  }]
                }
              }]
            };
          }
        }
      } catch (error) {
        console.log('OSRM failed, using fallback...');
      }
      
      if (routeData && routeData.features && routeData.features.length > 0) {
        const route = routeData.features[0];
        let coordinates;
        
        if (route.geometry.coordinates[0].length === 2) {
          coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        } else {
          coordinates = route.geometry.coordinates;
        }
        
        if (routeLayer.current) {
          map.current?.removeLayer(routeLayer.current);
        }
        
        routeLayer.current = L.polyline(coordinates, {
          color: 'hsl(142, 76%, 26%)',
          weight: 4,
          opacity: 0.8,
          className: 'animated-route'
        }).addTo(map.current!);
        
        const group = new L.FeatureGroup([routeLayer.current]);
        map.current?.fitBounds(group.getBounds().pad(0.15));
        
        const distanceKm = route.properties.summary ? 
          (route.properties.summary.distance / 1000) : 
          (route.properties.segments?.[0]?.distance / 1000 || 0);
        
        const durationMinutes = route.properties.summary ? 
          (route.properties.summary.duration / 60) : 
          (route.properties.segments?.[0]?.duration / 60 || 0);
        
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + (durationMinutes * 60000));
        const carbonKg = (distanceKm * 0.21).toFixed(2);
        
        setRouteInfo({
          distance: `${distanceKm.toFixed(1)} km`,
          duration: `${Math.round(durationMinutes)} min`,
          arrivalTime: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          carbonFootprint: `${carbonKg} kg CO₂`,
          routeType: 'driving',
          instructions: route.properties.segments?.[0]?.steps?.slice(0, 5).map((step: any) => 
            step.instruction || 'Continue'
          ) || ['Route calculated successfully']
        });
        
      } else {
        throw new Error('No route data available');
      }
      
    } catch (error) {
      console.error('Routing failed:', error);
      
      const distance = calculateDistance(
        userLocation[0], userLocation[1],
        destination[0], destination[1]
      );
      
      const midLat = (userLocation[0] + destination[0]) / 2;
      const midLng = (userLocation[1] + destination[1]) / 2;
      const offset = 0.01;
      const curvePoints = [
        userLocation,
        [midLat + offset, midLng - offset],
        [midLat - offset, midLng + offset],
        destination
      ];
      
      if (routeLayer.current) {
        map.current?.removeLayer(routeLayer.current);
      }
      
      routeLayer.current = L.polyline(curvePoints, {
        color: 'hsl(38, 92%, 50%)',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }).addTo(map.current!);
      
      const group = new L.FeatureGroup([routeLayer.current]);
      map.current?.fitBounds(group.getBounds().pad(0.15));
      
      const baseSpeed = 45;
      const estimatedTime = Math.round((distance / baseSpeed) * 60);
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + (estimatedTime * 60000));
      const carbonKg = (distance * 0.21).toFixed(2);
      
      setRouteInfo({
        distance: `${distance.toFixed(1)} km`,
        duration: `~${estimatedTime} min`,
        arrivalTime: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        carbonFootprint: `${carbonKg} kg CO₂`,
        routeType: 'driving',
        instructions: [
          'Estimated route (road data unavailable)',
          'Actual route may vary based on traffic',
          'Consider using GPS navigation for real-time directions'
        ]
      });
    }
    
    setIsLoadingRoute(false);
  };

  // Clear route
  const clearRoute = () => {
    if (routeLayer.current) {
      map.current?.removeLayer(routeLayer.current);
      routeLayer.current = null;
    }
    setRouteInfo(null);
    setSelectedPin(null);
    setShowRoutePanel(false);
  };

  // Handle pin click
  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    setShowPinDetails(true);
    onPinClick?.(pin);
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = L.map(mapContainer.current, {
      center: [13.0827, 80.2707],
      zoom: isMobile ? 5 : 6,
      zoomControl: false,
      maxBounds: [[8.0, 74.0], [20.0, 84.0]],
      maxBoundsViscosity: 0.8
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    getCurrentLocation();

    return () => {
      map.current?.remove();
    };
  }, [isMobile]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    if (userLocationMarker.current) {
      map.current.removeLayer(userLocationMarker.current);
    }

    userLocationMarker.current = L.marker(userLocation, {
      icon: icons.userLocation
    });

    userLocationMarker.current.bindPopup(`
      <div class="text-sm">
        <strong>Your Location</strong><br/>
        <span class="text-xs text-map-text-secondary">
          Current GPS Position
        </span>
      </div>
    `);

    userLocationMarker.current.addTo(map.current);
  }, [userLocation]);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    Object.values(markers.current).forEach(marker => {
      map.current?.removeLayer(marker);
    });
    markers.current = {};

    filteredLocations.forEach(location => {
      const marker = L.marker(location.position, {
        icon: icons[location.status]
      });

      const popupContent = `
        <div class="text-sm max-w-xs bg-map-card text-map-text-primary">
          <strong class="text-base">${location.name}</strong><br/>
          <span class="capitalize text-xs text-map-text-secondary block mb-2">
            ${location.type} • ${location.status}
          </span>
          <p class="text-xs mb-2">${location.description}</p>
          <span class="text-xs text-map-text-secondary block mb-3">
            ${location.district}, ${location.state}
          </span>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        handlePinClick(location as Pin);
      });

      marker.addTo(map.current!);
      markers.current[location.id] = marker;
    });
  }, [filteredLocations, onPinClick]);

  // Update zones
  useEffect(() => {
    if (!map.current) return;

    Object.values(zones.current).forEach(zone => {
      map.current?.removeLayer(zone);
    });
    zones.current = {};

    filteredZones.forEach(zone => {
      const rectangle = L.rectangle(zone.bounds, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: zone.fillOpacity,
        weight: 2
      });

      rectangle.bindPopup(`
        <div class="text-sm bg-map-card text-map-text-primary">
          <strong>${zone.name}</strong><br/>
          <span class="capitalize">${zone.type} Zone</span>
        </div>
      `);

      rectangle.addTo(map.current!);
      zones.current[zone.id] = rectangle;
    });
  }, [filteredZones]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'hsl(120, 60%, 50%)';
      case 'warning': return 'hsl(38, 92%, 50%)';
      case 'alert': return 'hsl(0, 84%, 60%)';
      case 'offline': return 'hsl(0, 0%, 45%)';
      case 'maintenance': return 'hsl(217, 91%, 60%)';
      default: return 'hsl(0, 0%, 45%)';
    }
  };

  return (
    <div className="w-full h-screen sm:h-full relative bg-map-bg overflow-hidden">
      {/* Custom CSS for Safence theme and responsive design */}
      <style jsx>{`
        :root {
          /* Light theme (default) */
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
        }
        
        .animated-route {
          animation: dashArray 2s linear infinite;
        }
        
        @keyframes dashArray {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 20;
          }
        }
        
        .leaflet-popup-content {
          margin: 8px 12px;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          background: hsl(var(--map-card));
          color: hsl(var(--map-text-primary));
        }
        
        @media (max-width: 768px) {
          .leaflet-popup-content-wrapper {
            max-width: 250px !important;
          }
          
          .leaflet-container {
            height: 100vh !important;
            width: 100vw !important;
          }
          
          .mobile-map-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 10 !important;
          }
        }
      `}</style>

      <div 
        ref={mapContainer} 
        className={`w-full h-full ${isMobile ? 'mobile-map-container' : ''}`} 
      />
      
      {/* Mobile-First Route Panel */}
      {showRoutePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[1000]">
          <div className="bg-map-card rounded-t-xl sm:rounded-xl shadow-2xl p-4 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-map-text-primary flex items-center gap-2">
                <RouteIcon className="w-5 h-5 text-primary" />
                Route Information
              </h3>
              <button
                onClick={clearRoute}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-map-text-secondary" />
              </button>
            </div>
            
            {isLoadingRoute ? (
              <RouteLoadingSpinner />
            ) : routeInfo ? (
              <div className="space-y-4">
                {/* Destination */}
                {selectedPin && (
                  <div className="bg-primary/10 rounded-lg p-3">
                    <div className="font-semibold text-primary text-sm sm:text-base">{selectedPin.name}</div>
                    <div className="text-xs sm:text-sm text-map-text-secondary">{selectedPin.district}, {selectedPin.state}</div>
                  </div>
                )}
                
                {/* Route Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Route className="w-4 h-4 text-primary mr-1" />
                    </div>
                    <div className="text-base sm:text-lg font-bold text-map-text-primary">{routeInfo.distance}</div>
                    <div className="text-xs text-map-text-secondary">Distance</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-map-safe mr-1" />
                    </div>
                    <div className="text-base sm:text-lg font-bold text-map-text-primary">{routeInfo.duration}</div>
                    <div className="text-xs text-map-text-secondary">Travel Time</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-purple-500 mr-1" />
                    </div>
                    <div className="text-base sm:text-lg font-bold text-map-text-primary">{routeInfo.arrivalTime}</div>
                    <div className="text-xs text-map-text-secondary">Arrival</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Leaf className="w-4 h-4 text-map-safe mr-1" />
                    </div>
                    <div className="text-base sm:text-lg font-bold text-map-text-primary">{routeInfo.carbonFootprint}</div>
                    <div className="text-xs text-map-text-secondary">CO₂ Impact</div>
                  </div>
                </div>
                
                {/* Quick Instructions */}
                <div className="bg-muted rounded-lg p-3">
                  <h4 className="font-semibold text-map-text-primary mb-2 text-sm">Route Overview</h4>
                  <div className="space-y-2">
                    {routeInfo.instructions.slice(0, 3).map((instruction, index) => (
                      <div key={index} className="text-xs text-map-text-secondary flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="flex-1">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (selectedPin) {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPin.position[0]},${selectedPin.position[1]}`;
                        window.open(url, '_blank');
                      }
                    }}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
                  >
                    <NavigationIcon className="w-4 h-4" />
                    Start Navigation
                  </button>
                  
                  <button
                    onClick={clearRoute}
                    className="sm:flex-none px-4 py-3 border border-border hover:bg-muted text-map-text-primary rounded-lg text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Pin Details Panel - Mobile Optimized */}
      {showPinDetails && selectedPin && (
        <div className={`${isMobile ? 'fixed' : 'absolute'} inset-0 bg-black bg-opacity-50 flex ${isMobile ? 'items-end' : 'items-center justify-center'} z-[1000]`}>
          <div className={`bg-map-card ${isMobile ? 'rounded-t-2xl' : 'rounded-xl'} shadow-2xl p-4 sm:p-6 ${isMobile ? 'w-full h-auto max-h-[80vh]' : 'w-full max-w-md mx-4 max-h-[70vh]'} overflow-y-auto`}>
            {/* Header with Close Button */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-map-card-border">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getStatusColor(selectedPin.status) }}
                ></div>
                <h3 className="text-lg sm:text-xl font-bold text-map-text-primary">
                  Device Details
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowPinDetails(false);
                  setSelectedPin(null);
                }}
                className="p-2 hover:bg-muted rounded-full transition-colors flex-shrink-0"
                aria-label="Close device details"
              >
                <X className="w-5 h-5 text-map-text-secondary" />
              </button>
            </div>

            {/* Pin Information */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-map-text-primary text-base sm:text-lg mb-1">
                  {selectedPin.name}
                </h4>
                <p className="text-sm text-map-text-secondary mb-3">
                  {selectedPin.description}
                </p>
              </div>

              {/* Status and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-map-text-secondary uppercase tracking-wide mb-1">Status</div>
                  <div className={`text-sm font-medium capitalize`} style={{ color: getStatusColor(selectedPin.status) }}>
                    {selectedPin.status}
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-map-text-secondary uppercase tracking-wide mb-1">Type</div>
                  <div className="text-sm font-medium capitalize text-map-text-primary">
                    {selectedPin.type.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-map-text-secondary uppercase tracking-wide mb-2">Location</div>
                <div className="space-y-1">
                  <div className="text-sm text-map-text-primary">
                    <span className="font-medium">District:</span> {selectedPin.district}
                  </div>
                  <div className="text-sm text-map-text-primary">
                    <span className="font-medium">State:</span> {selectedPin.state}
                  </div>
                  <div className="text-sm text-map-text-primary">
                    <span className="font-medium">Category:</span> {selectedPin.category}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {userLocation && (
                  <button
                    onClick={() => {
                      setShowPinDetails(false);
                      getRoute(selectedPin.position);
                    }}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
                  >
                    <RouteIcon className="w-4 h-4" />
                    Get Route
                  </button>
                )}
                
                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPin.position[0]},${selectedPin.position[1]}`;
                    window.open(url, '_blank');
                  }}
                  className="flex-1 bg-map-safe hover:bg-map-safe/90 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
                >
                  <NavigationIcon className="w-4 h-4" />
                  Open in Maps
                </button>
              </div>

              {!userLocation && (
                <div className="bg-map-warning/10 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 text-map-warning mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Location Services Disabled</span>
                  </div>
                  <p className="text-xs text-map-text-secondary mb-3">
                    Enable location services to get directions and route calculations.
                  </p>
                  <button
                    onClick={getCurrentLocation}
                    className="w-full bg-map-warning hover:bg-map-warning/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Enable Location
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
{/* Mobile-Optimized Control Panel - GPS removed */}
{(selectedPin && !showPinDetails) || (routeInfo && !showRoutePanel) ? (
  <div className={`absolute ${isMobile ? 'top-2 left-2 right-2' : 'top-4 right-4'} bg-map-card rounded-lg shadow-lg p-3 ${isMobile ? 'max-w-none' : 'max-w-xs'} z-[999] border border-map-card-border`}>
    {selectedPin && !showPinDetails && (
      <div className="border-b border-map-card-border pb-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: getStatusColor(selectedPin.status) }}
            ></div>
            <span className="text-xs text-map-text-primary font-medium truncate">
              {selectedPin.name}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setShowPinDetails(true)}
              className="text-primary hover:text-primary/90 text-xs px-2 py-1 rounded hover:bg-primary/10 transition-colors"
            >
              Details
            </button>
            <button
              onClick={() => setSelectedPin(null)}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-3 h-3 text-map-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* Quick Route Controls */}
    {routeInfo && !showRoutePanel && (
      <div className="border-t border-map-card-border pt-3">
        <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
          <span className="text-xs text-map-text-secondary font-medium">Route Active</span>
          <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
            <button
              onClick={() => setShowRoutePanel(true)}
              className={`text-primary hover:text-primary/90 text-xs px-3 py-1 rounded hover:bg-primary/10 transition-colors font-medium ${isMobile ? 'flex-1' : ''}`}
            >
              View Details
            </button>
            <button
              onClick={clearRoute}
              className={`text-destructive hover:text-destructive/90 text-xs px-3 py-1 rounded hover:bg-destructive/10 transition-colors font-medium ${isMobile ? 'flex-1' : ''}`}
            >
              Clear Route
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
) : null}

{/* GPS Status Indicator - Bottom Right Dot Only */}
{userLocation && (
  <div className="fixed bottom-4 right-4 z-[999] group">
    <button 
      className="w-4 h-4 bg-map-safe rounded-full animate-pulse shadow-lg border-2 border-white hover:scale-110 transition-transform"
      onClick={() => {}}
    >
    </button>
    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-map-card border border-map-card-border rounded text-xs text-map-text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
      GPS Enabled
    </div>
  </div>
)}
</div>
  );
}

