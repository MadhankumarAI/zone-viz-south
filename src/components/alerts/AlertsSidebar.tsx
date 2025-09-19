import { useState } from "react";
import { Filter, AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const filterOptions = {
  severity: [
    { id: "critical", label: "Critical", count: 12, color: "text-red-500" },
    { id: "high", label: "High", count: 8, color: "text-orange-500" },
    { id: "medium", label: "Medium", count: 15, color: "text-yellow-500" },
    { id: "low", label: "Low", count: 23, color: "text-green-500" },
  ],
  status: [
    { id: "active", label: "Active", count: 18 },
    { id: "resolved", label: "Resolved", count: 32 },
    { id: "investigating", label: "Investigating", count: 8 },
  ],
  category: [
    { id: "security", label: "Security Breach", count: 12 },
    { id: "equipment", label: "Equipment Failure", count: 15 },
    { id: "environmental", label: "Environmental", count: 8 },
    { id: "system", label: "System Alert", count: 23 },
  ]
};

export function AlertsSidebar() {
  const [selectedFilters, setSelectedFilters] = useState({
    severity: [],
    status: [],
    category: []
  });

  return (
    <div className="w-80 p-6 bg-sentinel-bg border-r border-sentinel-border">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-sentinel-green" />
        <h2 className="text-lg font-semibold text-sentinel-text">Filter Alerts</h2>
      </div>

      {/* Severity Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-sentinel-text mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Severity Level
        </h3>
        <div className="space-y-2">
          {filterOptions.severity.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox id={option.id} />
                <label htmlFor={option.id} className={`text-sm cursor-pointer ${option.color}`}>
                  {option.label}
                </label>
              </div>
              <span className="text-xs text-sentinel-muted">({option.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-sentinel-text mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Status
        </h3>
        <div className="space-y-2">
          {filterOptions.status.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox id={option.id} />
                <label htmlFor={option.id} className="text-sm text-sentinel-text cursor-pointer">
                  {option.label}
                </label>
              </div>
              <span className="text-xs text-sentinel-muted">({option.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-sentinel-text mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Category
        </h3>
        <div className="space-y-2">
          {filterOptions.category.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox id={option.id} />
                <label htmlFor={option.id} className="text-sm text-sentinel-text cursor-pointer">
                  {option.label}
                </label>
              </div>
              <span className="text-xs text-sentinel-muted">({option.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time Range */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-sentinel-text mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Time Range
        </h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
            Last 24 Hours
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
            Last 7 Days
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
            Custom Range
          </Button>
        </div>
      </div>

      {/* Apply Filters */}
      <div className="space-y-2">
        <Button variant="sentinel" className="w-full">
          Apply Filters
        </Button>
        <Button variant="outline" className="w-full bg-sentinel-container border-sentinel-border text-sentinel-text hover:bg-sentinel-green hover:text-white">
          Clear All
        </Button>
      </div>
    </div>
  );
}