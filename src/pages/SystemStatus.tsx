import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'idle';
  lastCommunication: string;
  firmwareVersion: string;
}

const SystemStatus = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Sample device data
  const devices: Device[] = [
    {
      id: 'SG-ESP-001',
      name: 'Perimeter Sensor A',
      type: 'ESP32',
      status: 'online',
      lastCommunication: '2024-07-26 14:30:00',
      firmwareVersion: '1.2.0'
    },
    {
      id: 'SG-LRA-005',
      name: 'Remote Gateway B',
      type: 'LoRa',
      status: 'online',
      lastCommunication: '2024-07-26 14:29:45',
      firmwareVersion: '2.1.1'
    },
    {
      id: 'SG-RPI-003',
      name: 'Central Hub',
      type: 'Raspberry Pi',
      status: 'online',
      lastCommunication: '2024-07-26 14:30:15',
      firmwareVersion: '3.0.2'
    },
    {
      id: 'SG-ESP-002',
      name: 'Entry Point Sensor',
      type: 'ESP32',
      status: 'offline',
      lastCommunication: '2024-07-26 12:15:30',
      firmwareVersion: '1.1.8'
    },
    {
      id: 'SG-LRA-001',
      name: 'North Sector Monitor',
      type: 'LoRa',
      status: 'idle',
      lastCommunication: '2024-07-26 14:25:00',
      firmwareVersion: '2.0.5'
    },
    {
      id: 'SG-ESP-004',
      name: 'South Perimeter',
      type: 'ESP32',
      status: 'online',
      lastCommunication: '2024-07-26 14:30:10',
      firmwareVersion: '1.2.0'
    },
    {
      id: 'SG-RPI-002',
      name: 'Backup Gateway',
      type: 'Raspberry Pi',
      status: 'online',
      lastCommunication: '2024-07-26 14:29:30',
      firmwareVersion: '3.0.1'
    },
    {
      id: 'SG-LRA-003',
      name: 'East Boundary',
      type: 'LoRa',
      status: 'online',
      lastCommunication: '2024-07-26 14:30:05',
      firmwareVersion: '2.1.0'
    }
  ];

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const deviceStats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    idle: devices.filter(d => d.status === 'idle').length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4" />;
      case 'offline':
        return <WifiOff className="h-4 w-4" />;
      case 'idle':
        return <Pause className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>;
      case 'offline':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Offline</Badge>;
      case 'idle':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Idle</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Unknown</Badge>;
    }
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Device ID', 'Device Name', 'Type', 'Status', 'Last Communication', 'Firmware Version'],
      ...filteredDevices.map(device => [
        device.id,
        device.name,
        device.type,
        device.status,
        device.lastCommunication,
        device.firmwareVersion
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-status-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">System Status Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage all connected devices</p>
        </div>

        {/* Device Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Device Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                    <p className="text-2xl font-bold text-foreground">{deviceStats.total}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Online Devices</p>
                    <p className="text-2xl font-bold text-foreground">{deviceStats.online}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wifi className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Offline Devices</p>
                    <p className="text-2xl font-bold text-foreground">{deviceStats.offline}</p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Idle Devices</p>
                    <p className="text-2xl font-bold text-foreground">{deviceStats.idle}</p>
                  </div>
                  <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Device Details */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-foreground">Device Details</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="idle">Idle</option>
              </select>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Device Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Device ID</th>
                      <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Device Name</th>
                      <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Last Communication</th>
                      <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Firmware Version</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDevices.map((device) => (
                      <tr key={device.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{device.id}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{device.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{device.type}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(device.status)}
                            {getStatusBadge(device.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{device.lastCommunication}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{device.firmwareVersion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
