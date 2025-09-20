import { SafenceLogo } from "@/components/ui/safence-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "react-router-dom";
import { Shield, Camera, Map, Activity, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import DroneSim from "@/components/DroneSim";
import { animated, useSpring } from "@react-spring/web";

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
  // Animation for hero title
  const titleAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    delay: 200,
    config: { mass: 1, tension: 120, friction: 14 }
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-safence-primary/5 via-transparent to-safence-success/5"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Side: Text Content */}
          <div className="flex-1 text-left space-y-6">
            <animated.div style={titleAnimation}>
              <div className="flex items-center gap-4 mb-6">
                <SafenceLogo className="text-safence-primary animate-pulse" size={64} />
                <h1 className="text-6xl font-bold text-foreground">
                  Sa<span className="text-safence-primary">Fe</span>nce
                </h1>
              </div>
            </animated.div>

            <animated.p
              style={titleAnimation}
              className="text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              Advanced perimeter security system with AI-powered drone monitoring.
              Real-time surveillance, intelligent threat detection, and automated response for comprehensive protection.
            </animated.p>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">Toggle Dark/Light Mode</span>
            </div>

            <div className="flex items-center gap-4 mt-4">
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

          {/* Right Side: Drone Simulation */}
          <div className="flex-1 w-full max-w-xl h-[500px]">
            <DroneSim />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
  );
};

export default Index;
