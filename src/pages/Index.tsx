import { SentinelLogo } from "@/components/ui/sentinel-logo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Camera, Map, Activity, AlertTriangle, FileText, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Live Dashboard",
    description: "Real-time monitoring of all security devices and systems",
    href: "/dashboard",
    color: "text-sentinel-green"
  },
  {
    icon: Camera,
    title: "Camera Feed",
    description: "Monitor live camera feeds and manage surveillance systems", 
    href: "/camera-feed",
    color: "text-sentinel-blue"
  },
  {
    icon: Map,
    title: "Map View",
    description: "Geographic visualization of devices and security zones",
    href: "/map", 
    color: "text-sentinel-purple"
  },
  {
    icon: AlertTriangle,
    title: "Alert Management",
    description: "Centralized alert monitoring and incident response",
    href: "/alerts",
    color: "text-sentinel-red"
  },
  {
    icon: FileText,
    title: "Logs & History",
    description: "Access historical data and system event logs",
    href: "/logs-history",
    color: "text-sentinel-yellow"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-sentinel-bg text-sentinel-text">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sentinel-green/5 via-transparent to-sentinel-blue/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            {/* Logo and Title */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <SentinelLogo className="text-sentinel-green" size={48} />
              <h1 className="text-5xl font-bold text-sentinel-text">
                Sentinel<span className="text-sentinel-green">Guard</span>
              </h1>
            </div>
            
            <p className="text-xl text-sentinel-muted max-w-3xl mx-auto leading-relaxed">
              Advanced security monitoring system for comprehensive perimeter protection.
              Real-time surveillance, intelligent alerts, and centralized control for maximum security.
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link to="/dashboard">
                <Button variant="sentinel" size="lg" className="gap-2">
                  <Shield className="w-5 h-5" />
                  Access Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/map">
                <Button variant="outline" size="lg" className="gap-2 bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
                  <Map className="w-5 h-5" />
                  View Map
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.href}
                  className="group bg-sentinel-container border border-sentinel-border rounded-xl p-6 hover:border-sentinel-green transition-all duration-300 hover:shadow-lg hover:shadow-sentinel-green/20"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-sentinel-bg mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-sentinel-text mb-2 group-hover:text-sentinel-green transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-sentinel-muted group-hover:text-sentinel-text transition-colors">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-sentinel-green opacity-0 group-hover:opacity-100 transition-opacity">
                    Access <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* System Status */}
      <div className="border-t border-sentinel-border bg-sentinel-container/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-sentinel-text mb-2">System Status</h2>
            <p className="text-sentinel-muted">Real-time operational overview</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-sentinel-green mb-2">98.5%</div>
              <div className="text-sm text-sentinel-muted">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sentinel-blue mb-2">247</div>
              <div className="text-sm text-sentinel-muted">Active Devices</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sentinel-yellow mb-2">12</div>
              <div className="text-sm text-sentinel-muted">Active Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sentinel-purple mb-2">5.2s</div>
              <div className="text-sm text-sentinel-muted">Response Time</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-sentinel-border bg-sentinel-bg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SentinelLogo className="text-sentinel-green" size={24} />
              <span className="text-sentinel-text font-semibold">SentinelGuard</span>
            </div>
            <div className="text-sm text-sentinel-muted">
              © 2024 SentinelGuard. Advanced Security Monitoring System.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
