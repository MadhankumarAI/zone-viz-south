import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Search, Filter, FileText, PanelLeft, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEvent {
  id: string;
  timestamp: string;
  type: string;
  deviceId: string;
  status: "Normal" | "Critical" | "Info" | "Warning";
}

const sampleData: LogEvent[] = [
  {
    id: "EVNT-001-20240701-1",
    timestamp: "2024-07-01 10:30:15",
    type: "Sensor Reading",
    deviceId: "MAG-007",
    status: "Normal"
  },
  {
    id: "EVNT-002-20240701-2",
    timestamp: "2024-07-01 10:35:40",
    type: "Tamper Alert",
    deviceId: "FENC-003",
    status: "Critical"
  },
  {
    id: "EVNT-003-20240701-3",
    timestamp: "2024-07-01 10:45:00",
    type: "System Heartbeat",
    deviceId: "CTRL-001",
    status: "Info"
  },
  {
    id: "EVNT-004-20240701-4",
    timestamp: "2024-07-01 10:50:22",
    type: "Device Offline",
    deviceId: "CAM-005",
    status: "Warning"
  },
  {
    id: "EVNT-005-20240701-5",
    timestamp: "2024-07-01 11:00:05",
    type: "Sensor Reading",
    deviceId: "MAG-007",
    status: "Normal"
  },
  {
    id: "EVNT-006-20240701-6",
    timestamp: "2024-07-01 11:15:30",
    type: "Illegal Activity",
    deviceId: "CAM-002",
    status: "Critical"
  },
  {
    id: "EVNT-007-20240701-7",
    timestamp: "2024-07-01 11:20:10",
    type: "Over-voltage",
    deviceId: "FENC-001",
    status: "Critical"
  },
  {
    id: "EVNT-008-20240701-8",
    timestamp: "2024-07-01 11:25:55",
    type: "Firmware Update",
    deviceId: "ESP-010",
    status: "Info"
  },
  {
    id: "EVNT-009-20240701-9",
    timestamp: "2024-07-01 11:30:00",
    type: "Device Online",
    deviceId: "CAM-005",
    status: "Normal"
  },
  {
    id: "EVNT-010-20240701-10",
    timestamp: "2024-07-01 11:40:18",
    type: "Configuration Change",
    deviceId: "LORA-004",
    status: "Info"
  }
];

function StatusBadge({ status }: { status: LogEvent["status"] }) {
  const getStatusStyles = (status: LogEvent["status"]) => {
    switch (status) {
      case "Critical":
        return "bg-red-500 text-white hover:bg-red-600";
      case "Warning":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200";
      case "Info":
        return "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200";
      case "Normal":
        return "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200";
    }
  };

  return (
    <Badge className={cn("text-xs font-semibold", getStatusStyles(status))}>
      {status}
    </Badge>
  );
}

export function LogsHistory() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleExportCSV = () => {
    // Filter data based on search query
    const filteredData = sampleData.filter(event => 
      event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create CSV content
    const csvContent = [
      ['Event ID', 'Timestamp', 'Type', 'Device ID', 'Status'],
      ...filteredData.map(event => [
        event.id,
        event.timestamp,
        event.type,
        event.deviceId,
        event.status
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // For PDF export, we'll create a simple HTML table and use browser's print to PDF
    const filteredData = sampleData.filter(event => 
      event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Logs History Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .critical { background-color: #ffebee; }
            .warning { background-color: #fff3e0; }
            .info { background-color: #e3f2fd; }
            .normal { background-color: #f1f8e9; }
          </style>
        </head>
        <body>
          <h1>Logs History Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Events: ${filteredData.length}</p>
          <table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Device ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(event => `
                <tr class="${event.status.toLowerCase()}">
                  <td>${event.id}</td>
                  <td>${event.timestamp}</td>
                  <td>${event.type}</td>
                  <td>${event.deviceId}</td>
                  <td>${event.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-sentinel-bg">
      
      <div className="flex">
        {/* Collapsible Sidebar */}
        <div 
          className={cn(
            "transition-all duration-300 bg-sentinel-bg border-r border-sentinel-border",
            isCollapsed ? "w-0" : "w-64"
          )}
        >
          <div className={cn(
            "h-[calc(100vh-64px)] flex flex-col justify-end p-4",
            isCollapsed && "hidden"
          )}>
            <Button
              onClick={() => setIsCollapsed(true)}
              className="w-full bg-sentinel-green hover:bg-sentinel-green/90 text-white"
            >
              <PanelLeft className="w-4 h-4 mr-2" />
              Collapse
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold font-fira-sans text-sentinel-text mb-6">
                Logs and History
              </h1>
              
              {/* Search and Action Bar */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sentinel-muted" />
                  <Input
                    placeholder="Search event ID, device, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-sentinel-bg border-sentinel-border text-sentinel-text placeholder:text-sentinel-muted"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-sentinel-border bg-sentinel-bg text-sentinel-text hover:bg-sentinel-border/20"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  
                  <Button 
                    onClick={handleExportCSV}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  
                  <Button 
                    onClick={handleExportPDF}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 hover:bg-transparent">
                    <TableHead className="bg-gray-50 text-gray-700 font-medium py-4 px-4 w-[280px]">
                      Event ID
                    </TableHead>
                    <TableHead className="bg-gray-50 text-gray-700 font-medium py-4 px-4 w-[280px]">
                      Timestamp
                    </TableHead>
                    <TableHead className="bg-gray-50 text-gray-700 font-medium py-4 px-4 w-[210px]">
                      Type
                    </TableHead>
                    <TableHead className="bg-gray-50 text-gray-700 font-medium py-4 px-4 w-[210px]">
                      Device ID
                    </TableHead>
                    <TableHead className="bg-gray-50 text-gray-700 font-medium py-4 px-4 w-[140px] text-right">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.map((event, index) => (
                    <TableRow
                      key={event.id}
                      className={cn(
                        "border-b border-gray-200 hover:bg-gray-50",
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      )}
                    >
                      <TableCell className="text-gray-900 py-4 px-4 font-normal">
                        {event.id}
                      </TableCell>
                      <TableCell className="text-gray-900 py-4 px-4 font-normal">
                        {event.timestamp}
                      </TableCell>
                      <TableCell className="text-gray-900 py-4 px-4 font-normal">
                        {event.type}
                      </TableCell>
                      <TableCell className="text-gray-900 py-4 px-4 font-normal">
                        {event.deviceId}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-right">
                        <div className="flex justify-end">
                          <StatusBadge status={event.status} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                className="border-sentinel-border bg-sentinel-bg text-sentinel-text hover:bg-sentinel-border/20"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <span className="text-sm text-sentinel-muted">
                Showing 1-10 of 10 events
              </span>
              
              <Button
                variant="outline"
                className="border-sentinel-border bg-sentinel-bg text-sentinel-text hover:bg-sentinel-border/20"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Collapsed Sidebar Expand Button */}
        {isCollapsed && (
          <div className="fixed bottom-4 left-4">
            <Button
              onClick={() => setIsCollapsed(false)}
              className="bg-sentinel-green hover:bg-sentinel-green/90 text-white"
              size="sm"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
