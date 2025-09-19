import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react";

const summaryStats = [
  {
    label: "Total Alerts",
    value: "58",
    change: "+12%",
    trend: "up",
    timeframe: "vs last week"
  },
  {
    label: "Critical Alerts", 
    value: "12",
    change: "-8%",
    trend: "down",
    timeframe: "vs last week"
  },
  {
    label: "Avg Response Time",
    value: "4.2m",
    change: "-15%", 
    trend: "down",
    timeframe: "vs last week"
  },
  {
    label: "Resolution Rate",
    value: "94%",
    change: "+3%",
    trend: "up", 
    timeframe: "vs last week"
  }
];

const recentActivity = [
  {
    id: 1,
    action: "Alert Resolved",
    description: "Security breach at Gate A",
    timestamp: "2 minutes ago",
    icon: CheckCircle,
    iconColor: "text-green-500"
  },
  {
    id: 2,
    action: "New Alert",
    description: "Equipment malfunction detected",
    timestamp: "8 minutes ago", 
    icon: AlertTriangle,
    iconColor: "text-red-500"
  },
  {
    id: 3,
    action: "Investigation Started",
    description: "Unauthorized access attempt",
    timestamp: "15 minutes ago",
    icon: Clock,
    iconColor: "text-yellow-500"
  },
  {
    id: 4,
    action: "System Check",
    description: "Routine maintenance completed",
    timestamp: "1 hour ago",
    icon: Activity,
    iconColor: "text-blue-500"
  },
  {
    id: 5,
    action: "Alert Resolved", 
    description: "Temperature alert cleared",
    timestamp: "2 hours ago",
    icon: CheckCircle,
    iconColor: "text-green-500"
  }
];

export function ActivitySummary() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-sentinel-text mb-6">Activity Summary</h2>
      
      {/* Stats Cards */}
      <div className="space-y-4 mb-8">
        {summaryStats.map((stat, index) => (
          <div key={index} className="bg-sentinel-container border border-sentinel-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-sentinel-muted">{stat.label}</span>
              <div className={`flex items-center text-xs ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-sentinel-text mb-1">{stat.value}</div>
            <div className="text-xs text-sentinel-muted">{stat.timeframe}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-md font-medium text-sentinel-text mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-sentinel-bg border border-sentinel-border rounded-lg">
                <div className={`p-1.5 rounded-full ${activity.iconColor}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-sentinel-text">{activity.action}</div>
                  <div className="text-xs text-sentinel-muted truncate">{activity.description}</div>
                  <div className="text-xs text-sentinel-muted mt-1">{activity.timestamp}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-md font-medium text-sentinel-text mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-3 bg-sentinel-container border border-sentinel-border rounded-lg hover:border-sentinel-green transition-colors">
            <div className="text-sm font-medium text-sentinel-text">Generate Report</div>
            <div className="text-xs text-sentinel-muted">Export weekly summary</div>
          </button>
          <button className="w-full text-left p-3 bg-sentinel-container border border-sentinel-border rounded-lg hover:border-sentinel-green transition-colors">
            <div className="text-sm font-medium text-sentinel-text">System Health</div>
            <div className="text-xs text-sentinel-muted">Check overall status</div>
          </button>
          <button className="w-full text-left p-3 bg-sentinel-container border border-sentinel-border rounded-lg hover:border-sentinel-green transition-colors">
            <div className="text-sm font-medium text-sentinel-text">Alert Settings</div>
            <div className="text-xs text-sentinel-muted">Configure notifications</div>
          </button>
        </div>
      </div>
    </div>
  );
}