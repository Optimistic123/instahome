import React, { useState, useEffect } from 'react';
import { api } from '../../App';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, LogOut, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

function AgentDashboard({ user }) {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await api.get('/visit-requests');
      setVisits(response.data);
      
      const propIds = [...new Set(response.data.map(v => v.property_id))];
      const propPromises = propIds.map(id => api.get(`/properties/${id}`).catch(() => null));
      const propResponses = await Promise.all(propPromises);
      setProperties(propResponses.filter(r => r).map(r => r.data));
    } catch (error) {
      console.error('Error fetching visits:', error);
    }
  };

  const updateStage = async (visitId, stage) => {
    try {
      await api.patch(`/visit-requests/${visitId}`, null, { params: { stage } });
      toast.success('Stage updated');
      fetchVisits();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  // Filter visits by stage
  const filteredVisits = stageFilter === 'all' 
    ? visits 
    : visits.filter(v => v.stage === stageFilter);

  // Create activity timeline
  const activityTimeline = visits
    .map(visit => ({
      visit_id: visit.visit_id,
      property: properties.find(p => p.property_id === visit.property_id)?.title || 'Unknown Property',
      user_name: visit.user_name,
      action: `Stage updated to: ${visit.stage}`,
      timestamp: visit.updated_at,
      stage: visit.stage
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Agent Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Assigned Visits</h1>
          <p className="text-muted-foreground">Manage your assigned property visits</p>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((visit) => {
                const property = properties.find(p => p.property_id === visit.property_id);
                return (
                  <TableRow key={visit.visit_id}>
                    <TableCell className="font-medium">{property?.title}</TableCell>
                    <TableCell>{visit.user_name}</TableCell>
                    <TableCell>{visit.user_phone}</TableCell>
                    <TableCell>
                      <Badge>{visit.stage}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select onValueChange={(value) => updateStage(visit.visit_id, value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Update Stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="talked">Talked</SelectItem>
                          <SelectItem value="visit_scheduled">Visit Scheduled</SelectItem>
                          <SelectItem value="visit_completed">Visit Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default AgentDashboard;
