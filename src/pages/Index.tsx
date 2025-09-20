import { SafenceLogo } from "@/components/ui/safence-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "react-router-dom";
import { Shield, Camera, Map, Activity, AlertTriangle, FileText, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Live Dashboard",
    description: "Real-time monitoring of all security devices and systems",
    href: "/dashboard",
    color: "text-safence-success"
  },
  {
    icon: Camera,
    title: "Camera Feed",
    description: "Monitor live camera feeds and manage surveillance systems", 
    href: "/camera-feed",
    color: "text-blue-500"
  },
  {
    icon: Map,
    title: "Map View",
    description: "Geographic visualization of devices and security zones",
    href: "/map", 
    color: "text-purple-500"
  },
  {
    icon: AlertTriangle,
    title: "Alert Management",
    description: "Centralized alert monitoring and incident response",
    href: "/alerts",
    color: "text-safence-danger"
  },
  {
    icon: FileText,
    title: "Logs & History",
    description: "Access historical data and system event logs",
    href: "/logs-history",
    color: "text-safence-warning"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-safence-primary/5 via-transparent to-safence-success/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            {/* Logo and Title with animations */}
            <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
              <SafenceLogo className="text-safence-primary animate-pulse" size={64} />
              <h1 className="text-6xl font-bold text-foreground">
                Sa<span className="text-safence-primary">Fe</span>nce
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
              Advanced perimeter security system with AI-powered drone monitoring.
              Real-time surveillance, intelligent threat detection, and automated response for comprehensive protection.
            </p>
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">Toggle Dark/Light Mode</span>
            </div>
            
            <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
              <Link to="/dashboard">
                <Button variant="safence" size="lg" className="gap-2 hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5" />
                  Access Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/map">
                <Button variant="outline" size="lg" className="gap-2 hover:scale-105 transition-transform">
                  <Map className="w-5 h-5" />
                  View Map
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Features Grid with staggered animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.href}
                  className="group bg-card border border-border rounded-xl p-6 hover:border-safence-primary transition-all duration-300 hover:shadow-lg hover:shadow-safence-primary/20 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className={`inline-flex p-3 rounded-lg bg-muted mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-safence-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-safence-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Access <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* System Status */}
      <div className="border-t border-border bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">System Status</h2>
            <p className="text-muted-foreground">Real-time operational overview</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center animate-fade-in">
              <div className="text-3xl font-bold text-safence-success mb-2">98.5%</div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="text-3xl font-bold text-blue-500 mb-2">247</div>
              <div className="text-sm text-muted-foreground">Active Devices</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="text-3xl font-bold text-safence-warning mb-2">12</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="text-3xl font-bold text-purple-500 mb-2">5.2s</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SafenceLogo className="text-safence-primary" size={24} />
              <span className="text-foreground font-semibold">Safence</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Safence. Advanced Perimeter Security System.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
