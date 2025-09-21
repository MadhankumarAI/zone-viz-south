import { AlertTriangle, CheckCircle, Clock, Eye, MoreVertical, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical": return "text-red-500 bg-red-500/10 border-red-500/20";
    case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    case "low": return "text-green-500 bg-green-500/10 border-green-500/20";
    default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
  }
};

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "active": return <Badge variant="destructive">Active</Badge>;
    case "investigating": return <Badge variant="secondary">Investigating</Badge>;
    case "resolved": return <Badge variant="default">Resolved</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export function AlertsFeed({ selectedFilters }) {
  const [allAlerts, setAllAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [sortBy, setSortBy] = useState("timestamp");

  // Fetch all alerts once
  useEffect(() => {
    fetch("https://alerts-ib70.onrender.com/alerts/?device_id=CAM-002")
      .then((res) => res.json())
      .then((data) => {
        setAllAlerts(data);
        setFilteredAlerts(data);
      })
      .catch(() => {
        setAllAlerts([]);
        setFilteredAlerts([]);
      });
  }, []);

  // Filter alerts whenever selectedFilters change
  useEffect(() => {
    let filtered = [...allAlerts];

    // Apply severity filter
    if (selectedFilters.severity.length > 0) {
      filtered = filtered.filter(alert => 
        selectedFilters.severity.includes(alert.severity?.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilters.status.length > 0) {
      filtered = filtered.filter(alert => 
        selectedFilters.status.includes(alert.status?.toLowerCase())
      );
    }

    // Apply category filter (assuming your API has a 'type' field)
    if (selectedFilters.category.length > 0) {
      filtered = filtered.filter(alert => {
        const alertType = alert.type?.toLowerCase();
        return selectedFilters.category.some(category => {
          // Map categories to your API fields
          if (category === 'security' && (alertType?.includes('security') || alertType?.includes('breach'))) return true;
          if (category === 'equipment' && (alertType?.includes('equipment') || alertType?.includes('malfunction'))) return true;
          if (category === 'environmental' && alertType?.includes('environmental')) return true;
          if (category === 'system' && alertType?.includes('system')) return true;
          return false;
        });
      });
    }

    setFilteredAlerts(filtered);
  }, [selectedFilters, allAlerts]);

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sentinel-text mb-2">Active Alerts</h1>
          <p className="text-sentinel-muted">Monitor and manage system alerts in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-sentinel-container border border-sentinel-border rounded-lg px-3 py-2 text-sentinel-text text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="timestamp">Sort by Time</option>
            <option value="severity">Sort by Severity</option>
            <option value="status">Sort by Status</option>
          </select>
          <Button variant="outline" size="sm" className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
            <Filter className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className="bg-sentinel-container border border-sentinel-border rounded-lg p-6 hover:border-sentinel-green transition-colors">
            <div className="flex items-start justify-between">
              {/* Alert Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sentinel-text">{alert.title}</h3>
                    <p className="text-sm text-sentinel-muted">{alert.id}</p>
                  </div>
                  <div className="ml-auto">
                    {getStatusBadge(alert.status)}
                  </div>
                </div>
                
                <p className="text-sentinel-text mb-4 ml-14">{alert.description}</p>
                
                <div className="flex items-center gap-6 ml-14 text-sm text-sentinel-muted">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {alert.timestamp}
                  </div>
                  <div>Device: <span className="text-sentinel-text">{alert.device_id || 'CAM-002'}</span></div>
                  <div>Location: <span className="text-sentinel-text">{alert.location}</span></div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" className="bg-sentinel-bg border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button variant="ghost" size="sm" className="text-sentinel-muted hover:text-sentinel-text">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-sentinel-border">
        <span className="text-sm text-sentinel-muted">
          Showing {filteredAlerts.length} of {allAlerts.length} alerts
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="bg-sentinel-green text-white">1</Button>
            <Button variant="outline" size="sm" className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">2</Button>
            <Button variant="outline" size="sm" className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">3</Button>
          </div>
          <Button variant="outline" size="sm" className="bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}