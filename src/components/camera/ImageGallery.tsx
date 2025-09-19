import { useState } from "react";
import { Search, Filter, Calendar, Camera, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const galleryImages = [
  { id: 1, src: "/api/placeholder/200/150", camera: "CAM-001", timestamp: "2024-09-19 13:45:22", type: "Normal" },
  { id: 2, src: "/api/placeholder/200/150", camera: "CAM-002", timestamp: "2024-09-19 13:40:15", type: "Alert" },
  { id: 3, src: "/api/placeholder/200/150", camera: "CAM-003", timestamp: "2024-09-19 13:35:08", type: "Warning" },
  { id: 4, src: "/api/placeholder/200/150", camera: "CAM-001", timestamp: "2024-09-19 13:30:45", type: "Normal" },
  { id: 5, src: "/api/placeholder/200/150", camera: "CAM-004", timestamp: "2024-09-19 13:25:33", type: "Alert" },
  { id: 6, src: "/api/placeholder/200/150", camera: "CAM-002", timestamp: "2024-09-19 13:20:12", type: "Normal" },
];

export function ImageGallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const filteredImages = galleryImages.filter(img => {
    const matchesSearch = img.camera.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || img.type.toLowerCase() === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-sentinel-container border border-sentinel-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-sentinel-text">Image Gallery</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sentinel-muted w-4 h-4" />
          <Input
            placeholder="Search by camera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-sentinel-bg border-sentinel-border text-sentinel-text"
          />
        </div>
        <select 
          className="bg-sentinel-bg border border-sentinel-border rounded-lg px-3 py-2 text-sentinel-text"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="normal">Normal</option>
          <option value="alert">Alert</option>
          <option value="warning">Warning</option>
        </select>
        <Button variant="outline" size="sm" className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredImages.map((image) => (
          <div key={image.id} className="bg-sentinel-bg border border-sentinel-border rounded-lg overflow-hidden hover:border-sentinel-green transition-colors">
            {/* Image */}
            <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-600" />
              <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1 text-white text-xs">
                {image.camera}
              </div>
              <div className={`absolute top-2 right-2 rounded px-2 py-1 text-xs ${
                image.type === 'Alert' ? 'bg-red-500/80 text-white' :
                image.type === 'Warning' ? 'bg-yellow-500/80 text-black' :
                'bg-green-500/80 text-white'
              }`}>
                {image.type}
              </div>
            </div>
            
            {/* Image Info */}
            <div className="p-3">
              <div className="text-sm text-sentinel-text mb-2">{image.timestamp}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-sentinel-muted">{image.camera}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-sentinel-text hover:bg-sentinel-green hover:text-white">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-sentinel-text hover:bg-sentinel-green hover:text-white">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-sentinel-border">
        <span className="text-sm text-sentinel-muted">
          Showing {filteredImages.length} of {galleryImages.length} images
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}