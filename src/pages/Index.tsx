// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Map Interface Dashboard</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Interactive map monitoring system for South India
        </p>
        <Link to="/map">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            View Map Interface
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
