import { useState } from "react";
import { Play, Pause, Volume2, Maximize, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LiveFeedSection() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="bg-sentinel-container border border-sentinel-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-sentinel-text">Live Camera Feed</h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-sentinel-muted">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            LIVE
          </span>
        </div>
      </div>
      
      {/* Video Feed Area */}
      <div className="relative bg-gray-900 rounded-lg aspect-video mb-4 flex items-center justify-center">
        <Camera className="w-16 h-16 text-gray-600" />
        <div className="absolute top-4 left-4 bg-black/50 rounded px-2 py-1 text-white text-sm">
          CAM-001
        </div>
        <div className="absolute top-4 right-4 bg-black/50 rounded px-2 py-1 text-white text-sm">
          2024-09-19 13:45:22
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <select className="bg-sentinel-container border border-sentinel-border rounded px-3 py-1 text-sm text-sentinel-text">
            <option>CAM-001</option>
            <option>CAM-002</option>
            <option>CAM-003</option>
          </select>
          <span className="text-sm text-sentinel-muted">1080p • 30fps</span>
        </div>
      </div>
    </div>
  );
}