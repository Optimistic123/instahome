import React, { useState, useEffect } from 'react';
import { api } from '../../App';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Users, Eye, LogOut, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('visits');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propsRes, visitsRes, agentsRes] = await Promise.all([
        api.get('/properties'),
        api.get('/visit-requests'),
        api.get('/agents')
      ]);
      setProperties(propsRes.data);
      setVisits(visitsRes.data);
      setAgents(agentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const assignAgent = async (visitId, agentId) => {
    try {
      await api.patch(`/visit-requests/${visitId}`, null, { params: { assigned_agent_id: agentId } });
      toast.success('Agent assigned');
      fetchData();
    } catch (error) {
      toast.error('Failed to assign agent');
    }
  };

  const updatePropertyStatus = async (propertyId, status) => {
    try {
      await api.patch(`/properties/${propertyId}/status`, null, { params: { status } });
      toast.success(`Property marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update property');
    }
  };

  // Filter data based on search term
  const filteredVisits = visits.filter(visit => {
    const property = properties.find(p => p.property_id === visit.property_id);
    return visit.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           visit.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           property?.title.toLowerCase().includes(searchTerm.toLowerCase()) || false;
  });

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full" data-testid="logout-button">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-3xl font-bold mt-2">{properties.length}</p>
              </div>
              <Building2 className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visit Requests</p>
                <p className="text-3xl font-bold mt-2">{visits.length}</p>
              </div>
              <Eye className="h-12 w-12 text-accent opacity-20" />
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-3xl font-bold mt-2">{agents.length}</p>
              </div>
              <Users className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="visits" className="space-y-6" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="visits">Visit Requests</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="agent-view">Agent View</TabsTrigger>
            </TabsList>
            <div className="relative w-72">
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="admin-search-input"
              />
              <Eye className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <TabsContent value="visits" className="bg-card rounded-xl border p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.map((visit) => {
                  const property = properties.find(p => p.property_id === visit.property_id);
                  const agent = agents.find(a => a.user_id === visit.assigned_agent_id);
                  return (
                    <TableRow key={visit.visit_id}>
                      <TableCell className="font-medium">{property?.title}</TableCell>
                      <TableCell>{visit.user_name}</TableCell>
                      <TableCell>
                        <Badge variant={visit.stage === 'new' ? 'default' : 'secondary'}>
                          {visit.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>{agent?.name || 'Unassigned'}</TableCell>
                      <TableCell>
                        <Select onValueChange={(value) => assignAgent(visit.visit_id, value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Assign Agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map(agent => (
                              <SelectItem key={agent.user_id} value={agent.user_id}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredVisits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No visit requests found
              </div>
            )}
          </TabsContent>

          <TabsContent value="properties" className="bg-card rounded-xl border p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.property_id}>
                    <TableCell className="font-medium">
                      <a
                        href={`/properties/${property.property_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        data-testid={`property-link-${property.property_id}`}
                      >
                        {property.title}
                      </a>
                    </TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>${property.rent_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePropertyStatus(property.property_id, property.status === 'available' ? 'occupied' : 'available')}
                      >
                        Mark as {property.status === 'available' ? 'Occupied' : 'Available'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredProperties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No properties found
              </div>
            )}
          </TabsContent>

          <TabsContent value="agents" className="bg-card rounded-xl border p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.user_id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.phone || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredAgents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No agents found
              </div>
            )}
          </TabsContent>

          <TabsContent value="agent-view" className="space-y-6">
            {agents.map((agent) => {
              const agentVisits = visits.filter(v => v.assigned_agent_id === agent.user_id);
              return (
                <div key={agent.user_id} className="bg-card rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.email}</p>
                    </div>
                    <Badge variant="secondary">{agentVisits.length} Assigned</Badge>
                  </div>
                  
                  {agentVisits.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Requested On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agentVisits.map((visit) => {
                          const property = properties.find(p => p.property_id === visit.property_id);
                          return (
                            <TableRow key={visit.visit_id}>
                              <TableCell className="font-medium">{property?.title}</TableCell>
                              <TableCell>{visit.user_name}</TableCell>
                              <TableCell>
                                <Badge variant={visit.stage === 'new' ? 'default' : 'secondary'}>
                                  {visit.stage}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(visit.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No visits assigned yet
                    </p>
                  )}
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;
