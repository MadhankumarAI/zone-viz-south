import { useState } from "react";
import { Tag, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const activityTypes = [
  "Normal Activity",
  "Suspicious Behavior", 
  "Unauthorized Access",
  "Equipment Malfunction",
  "Emergency Situation",
  "Maintenance Required"
];

const recentTags = [
  { id: 1, timestamp: "13:42:15", type: "Normal Activity", status: "confirmed" },
  { id: 2, timestamp: "13:38:22", type: "Suspicious Behavior", status: "pending" },
  { id: 3, timestamp: "13:35:07", type: "Normal Activity", status: "confirmed" },
  { id: 4, timestamp: "13:31:44", type: "Equipment Malfunction", status: "pending" },
];

export function ActivityTagging() {
  const [selectedActivity, setSelectedActivity] = useState("");

  return (
    <div className="bg-sentinel-container border border-sentinel-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Tag className="w-5 h-5 text-sentinel-green" />
        <h3 className="text-lg font-semibold text-sentinel-text">Activity Tagging</h3>
      </div>

      {/* Activity Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-sentinel-text mb-2">
          Select Activity Type
        </label>
        <select 
          className="w-full bg-sentinel-bg border border-sentinel-border rounded-lg px-3 py-2 text-sentinel-text"
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
        >
          <option value="">Choose activity type...</option>
          {activityTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Tag Button */}
      <Button 
        className="w-full mb-6" 
        variant="sentinel"
        disabled={!selectedActivity}
      >
        Tag Current Frame
      </Button>

      {/* Recent Tags */}
      <div>
        <h4 className="text-sm font-medium text-sentinel-text mb-3">Recent Tags</h4>
        <div className="space-y-2">
          {recentTags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-2 bg-sentinel-bg rounded border border-sentinel-border">
              <div className="flex-1">
                <div className="text-sm text-sentinel-text">{tag.type}</div>
                <div className="text-xs text-sentinel-muted">{tag.timestamp}</div>
              </div>
              <div className="flex items-center gap-1">
                {tag.status === "confirmed" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
                <Badge variant={tag.status === "confirmed" ? "default" : "secondary"}>
                  {tag.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}