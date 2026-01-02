import React, { useState, useEffect } from 'react';
import { api } from '../../App';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Users, Eye, LogOut, X, UserPlus, Home, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [agents, setAgents] = useState([]);
  const [owners, setOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('visits');
  
  // Create Owner Modal State
  const [showCreateOwner, setShowCreateOwner] = useState(false);
  const [newOwner, setNewOwner] = useState({ name: '', email: '', phone: '', address: '' });
  const [creatingOwner, setCreatingOwner] = useState(false);
  const [createdOwnerInfo, setCreatedOwnerInfo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propsRes, visitsRes, agentsRes, ownersRes] = await Promise.all([
        api.get('/properties'),
        api.get('/visit-requests'),
        api.get('/agents'),
        api.get('/admin/owners')
      ]);
      setProperties(propsRes.data);
      setVisits(visitsRes.data);
      setAgents(agentsRes.data);
      setOwners(ownersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateOwner = async (e) => {
    e.preventDefault();
    setCreatingOwner(true);
    try {
      const response = await api.post('/admin/owners', newOwner);
      setCreatedOwnerInfo(response.data);
      toast.success('Owner created successfully!');
      setNewOwner({ name: '', email: '', phone: '', address: '' });
      fetchData();
    } catch (error) {
      // Handle validation errors (detail is an array) vs regular errors (detail is a string)
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to create owner';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      }
      toast.error(errorMessage);
    } finally {
      setCreatingOwner(false);
    }
  };

  const closeCreateOwnerDialog = () => {
    setShowCreateOwner(false);
    setCreatedOwnerInfo(null);
    setNewOwner({ name: '', email: '', phone: '', address: '' });
  };

  // Create Agent Modal State
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', phone: '', specialization: '' });
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [createdAgentInfo, setCreatedAgentInfo] = useState(null);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setCreatingAgent(true);
    try {
      const response = await api.post('/agents', newAgent);
      setCreatedAgentInfo(response.data);
      toast.success('Agent created successfully!');
      setNewAgent({ name: '', email: '', phone: '', specialization: '' });
      fetchData();
    } catch (error) {
      // Handle validation errors (detail is an array) vs regular errors (detail is a string)
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to create agent';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      }
      toast.error(errorMessage);
    } finally {
      setCreatingAgent(false);
    }
  };

  const closeCreateAgentDialog = () => {
    setShowCreateAgent(false);
    setCreatedAgentInfo(null);
    setNewAgent({ name: '', email: '', phone: '', specialization: '' });
  };

  // Delete Agent State
  const [showDeleteAgentDialog, setShowDeleteAgentDialog] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [deletingAgent, setDeletingAgent] = useState(false);

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    
    setDeletingAgent(true);
    try {
      await api.delete(`/agents/${agentToDelete.user_id}`);
      toast.success('Agent deleted successfully!');
      setShowDeleteAgentDialog(false);
      setAgentToDelete(null);
      fetchData();
    } catch (error) {
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to delete agent';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      }
      toast.error(errorMessage);
    } finally {
      setDeletingAgent(false);
    }
  };

  const openDeleteAgentDialog = (agent) => {
    setAgentToDelete(agent);
    setShowDeleteAgentDialog(true);
  };

  // Edit Agent State
  const [showEditAgentDialog, setShowEditAgentDialog] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState(null);
  const [editAgentData, setEditAgentData] = useState({ name: '', phone: '', specialization: '' });
  const [savingAgent, setSavingAgent] = useState(false);

  const openEditAgentDialog = (agent) => {
    setAgentToEdit(agent);
    setEditAgentData({
      name: agent.name || '',
      phone: agent.phone || '',
      specialization: agent.specialization || ''
    });
    setShowEditAgentDialog(true);
  };

  const handleEditAgent = async (e) => {
    e.preventDefault();
    if (!agentToEdit) return;
    
    setSavingAgent(true);
    try {
      await api.patch(`/agents/${agentToEdit.user_id}`, editAgentData);
      toast.success('Agent updated successfully!');
      setShowEditAgentDialog(false);
      setAgentToEdit(null);
      fetchData();
    } catch (error) {
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to update agent';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      }
      toast.error(errorMessage);
    } finally {
      setSavingAgent(false);
    }
  };

  // Delete Owner State
  const [showDeleteOwnerDialog, setShowDeleteOwnerDialog] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [deletingOwner, setDeletingOwner] = useState(false);

  const openDeleteOwnerDialog = (owner) => {
    setOwnerToDelete(owner);
    setShowDeleteOwnerDialog(true);
  };

  const handleDeleteOwner = async () => {
    if (!ownerToDelete) return;
    
    setDeletingOwner(true);
    try {
      await api.delete(`/admin/owners/${ownerToDelete.user_id}`);
      toast.success('Owner deleted successfully!');
      setShowDeleteOwnerDialog(false);
      setOwnerToDelete(null);
      fetchData();
    } catch (error) {
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to delete owner';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      }
      toast.error(errorMessage);
    } finally {
      setDeletingOwner(false);
    }
  };

  // Edit Owner State
  const [showEditOwnerDialog, setShowEditOwnerDialog] = useState(false);
  const [ownerToEdit, setOwnerToEdit] = useState(null);
  const [editOwnerData, setEditOwnerData] = useState({ name: '', phone: '', address: '' });
  const [savingOwner, setSavingOwner] = useState(false);

  const openEditOwnerDialog = (owner) => {
    setOwnerToEdit(owner);
    setEditOwnerData({
      name: owner.name || '',
      phone: owner.phone || '',
      address: owner.address || ''
    });
    setShowEditOwnerDialog(true);
  };

  const handleEditOwner = async (e) => {
    e.preventDefault();
    if (!ownerToEdit) return;
    
    setSavingOwner(true);
    try {
      await api.patch(`/admin/owners/${ownerToEdit.user_id}`, editOwnerData);
      toast.success('Owner updated successfully!');
      setShowEditOwnerDialog(false);
      setOwnerToEdit(null);
      fetchData();
    } catch (error) {
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to update owner';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      }
      toast.error(errorMessage);
    } finally {
      setSavingOwner(false);
    }
  };

  // Delete Property State
  const [showDeletePropertyDialog, setShowDeletePropertyDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deletingProperty, setDeletingProperty] = useState(false);

  const openDeletePropertyDialog = (property) => {
    setPropertyToDelete(property);
    setShowDeletePropertyDialog(true);
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;
    
    setDeletingProperty(true);
    try {
      await api.delete(`/properties/${propertyToDelete.property_id}`);
      toast.success('Property deleted successfully!');
      setShowDeletePropertyDialog(false);
      setPropertyToDelete(null);
      fetchData();
    } catch (error) {
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to delete property';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      }
      toast.error(errorMessage);
    } finally {
      setDeletingProperty(false);
    }
  };

  // Edit Property State
  const [showEditPropertyDialog, setShowEditPropertyDialog] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [editPropertyData, setEditPropertyData] = useState({
    title: '', description: '', property_type: '', address: '', city: '', state: '',
    rent_amount: '', deposit_amount: '', bedrooms: 1, bathrooms: 1, area_sqft: ''
  });
  const [savingProperty, setSavingProperty] = useState(false);

  const openEditPropertyDialog = (property) => {
    setPropertyToEdit(property);
    setEditPropertyData({
      title: property.title || '',
      description: property.description || '',
      property_type: property.property_type || 'apartment',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      rent_amount: property.rent_amount?.toString() || '',
      deposit_amount: property.deposit_amount?.toString() || '',
      bedrooms: property.bedrooms || 1,
      bathrooms: property.bathrooms || 1,
      area_sqft: property.area_sqft?.toString() || ''
    });
    setShowEditPropertyDialog(true);
  };

  const handleEditProperty = async (e) => {
    e.preventDefault();
    if (!propertyToEdit) return;
    
    setSavingProperty(true);
    try {
      await api.put(`/properties/${propertyToEdit.property_id}`, {
        ...editPropertyData,
        rent_amount: parseFloat(editPropertyData.rent_amount),
        deposit_amount: parseFloat(editPropertyData.deposit_amount),
        area_sqft: parseInt(editPropertyData.area_sqft),
        owner_id: propertyToEdit.owner_id,
        amenities: propertyToEdit.amenities || [],
        images: propertyToEdit.images || []
      });
      toast.success('Property updated successfully!');
      setShowEditPropertyDialog(false);
      setPropertyToEdit(null);
      fetchData();
    } catch (error) {
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to update property';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      }
      toast.error(errorMessage);
    } finally {
      setSavingProperty(false);
    }
  };

  // Create Property Modal State
  const [showCreateProperty, setShowCreateProperty] = useState(false);
  const [creatingProperty, setCreatingProperty] = useState(false);
  const [newProperty, setNewProperty] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    address: '',
    city: '',
    state: '',
    rent_amount: '',
    deposit_amount: '',
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: '',
    amenities: [],
    images: [],
    owner_id: ''
  });

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    if (!newProperty.owner_id) {
      toast.error('Please select an owner for this property');
      return;
    }
    setCreatingProperty(true);
    try {
      await api.post('/properties', {
        ...newProperty,
        rent_amount: parseFloat(newProperty.rent_amount),
        deposit_amount: parseFloat(newProperty.deposit_amount),
        area_sqft: parseInt(newProperty.area_sqft)
      });
      toast.success('Property created successfully!');
      setShowCreateProperty(false);
      setNewProperty({
        title: '',
        description: '',
        property_type: 'apartment',
        address: '',
        city: '',
        state: '',
        rent_amount: '',
        deposit_amount: '',
        bedrooms: 1,
        bathrooms: 1,
        area_sqft: '',
        amenities: [],
        images: [],
        owner_id: ''
      });
      fetchData();
    } catch (error) {
      // Handle validation errors (detail is an array) vs regular errors (detail is a string)
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to create property';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      }
      toast.error(errorMessage);
    } finally {
      setCreatingProperty(false);
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

  // Filter for agent view - by agent name
  const filteredAgentsForView = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter owners
  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm text-muted-foreground">Property Owners</p>
                <p className="text-3xl font-bold mt-2">{owners.length}</p>
              </div>
              <Home className="h-12 w-12 text-accent opacity-20" />
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visit Requests</p>
                <p className="text-3xl font-bold mt-2">{visits.length}</p>
              </div>
              <Eye className="h-12 w-12 text-primary opacity-20" />
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
              <TabsTrigger value="owners">Owners</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="agent-view">Agent View</TabsTrigger>
            </TabsList>
            <div className="relative w-72">
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
                data-testid="admin-search-input"
              />
              <Eye className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  data-testid="clear-search-button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">All Properties</h3>
              <Dialog open={showCreateProperty} onOpenChange={setShowCreateProperty}>
                <DialogTrigger asChild>
                  <Button className="rounded-full" data-testid="add-property-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                      Create a new property listing. Select the owner who owns this property.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateProperty} className="space-y-4">
                    {/* Owner Selection - Required */}
                    <div className="space-y-2 p-4 bg-muted/50 rounded-lg border-2 border-primary/20">
                      <Label htmlFor="property-owner" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Property Owner *
                      </Label>
                      <Select
                        value={newProperty.owner_id}
                        onValueChange={(value) => setNewProperty({ ...newProperty, owner_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select the property owner" />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map(owner => (
                            <SelectItem key={owner.user_id} value={owner.user_id}>
                              {owner.name} ({owner.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {owners.length === 0 && (
                        <p className="text-xs text-destructive">
                          No owners available. Please create an owner first in the Owners tab.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="property-title">Title *</Label>
                        <Input
                          id="property-title"
                          placeholder="Modern 2BR Apartment"
                          value={newProperty.title}
                          onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="property-description">Description *</Label>
                        <Input
                          id="property-description"
                          placeholder="Beautiful apartment with great views..."
                          value={newProperty.description}
                          onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="property-type">Property Type</Label>
                        <Select
                          value={newProperty.property_type}
                          onValueChange={(value) => setNewProperty({ ...newProperty, property_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="property-address">Address *</Label>
                        <Input
                          id="property-address"
                          placeholder="123 Main St"
                          value={newProperty.address}
                          onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="property-city">City *</Label>
                        <Input
                          id="property-city"
                          placeholder="San Francisco"
                          value={newProperty.city}
                          onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="property-state">State *</Label>
                        <Input
                          id="property-state"
                          placeholder="CA"
                          value={newProperty.state}
                          onChange={(e) => setNewProperty({ ...newProperty, state: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="property-rent">Monthly Rent ($) *</Label>
                        <Input
                          id="property-rent"
                          type="number"
                          placeholder="2500"
                          value={newProperty.rent_amount}
                          onChange={(e) => setNewProperty({ ...newProperty, rent_amount: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="property-deposit">Security Deposit ($) *</Label>
                        <Input
                          id="property-deposit"
                          type="number"
                          placeholder="5000"
                          value={newProperty.deposit_amount}
                          onChange={(e) => setNewProperty({ ...newProperty, deposit_amount: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="property-bedrooms">Bedrooms</Label>
                        <Input
                          id="property-bedrooms"
                          type="number"
                          min="0"
                          value={newProperty.bedrooms}
                          onChange={(e) => setNewProperty({ ...newProperty, bedrooms: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="property-bathrooms">Bathrooms</Label>
                        <Input
                          id="property-bathrooms"
                          type="number"
                          min="0"
                          value={newProperty.bathrooms}
                          onChange={(e) => setNewProperty({ ...newProperty, bathrooms: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="property-area">Area (sqft) *</Label>
                        <Input
                          id="property-area"
                          type="number"
                          placeholder="1200"
                          value={newProperty.area_sqft}
                          onChange={(e) => setNewProperty({ ...newProperty, area_sqft: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowCreateProperty(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={creatingProperty || owners.length === 0}>
                        {creatingProperty ? 'Creating...' : 'Create Property'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => {
                  const owner = owners.find(o => o.user_id === property.owner_id);
                  return (
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
                    <TableCell className="text-muted-foreground">
                      {owner?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>${property.rent_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePropertyStatus(property.property_id, property.status === 'available' ? 'occupied' : 'available')}
                        >
                          Mark as {property.status === 'available' ? 'Occupied' : 'Available'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditPropertyDialog(property)}
                          title="Edit property"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openDeletePropertyDialog(property)}
                          title="Delete property"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredProperties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No properties found
              </div>
            )}

            {/* Delete Property Confirmation Dialog */}
            <Dialog open={showDeletePropertyDialog} onOpenChange={setShowDeletePropertyDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Delete Property</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this property? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                {propertyToDelete && (
                  <div className="py-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium">{propertyToDelete.title}</p>
                      <p className="text-sm text-muted-foreground">{propertyToDelete.address}, {propertyToDelete.city}</p>
                      <p className="text-sm text-muted-foreground">Rent: ${propertyToDelete.rent_amount?.toLocaleString()}/mo</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Note: Occupied properties or properties with active visits cannot be deleted.
                    </p>
                  </div>
                )}
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeletePropertyDialog(false)}
                    disabled={deletingProperty}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteProperty}
                    disabled={deletingProperty}
                  >
                    {deletingProperty ? 'Deleting...' : 'Delete Property'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Property Dialog */}
            <Dialog open={showEditPropertyDialog} onOpenChange={setShowEditPropertyDialog}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Property</DialogTitle>
                  <DialogDescription>
                    Update property details.
                  </DialogDescription>
                </DialogHeader>
                {propertyToEdit && (
                  <form onSubmit={handleEditProperty} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="edit-property-title">Title *</Label>
                        <Input
                          id="edit-property-title"
                          value={editPropertyData.title}
                          onChange={(e) => setEditPropertyData({ ...editPropertyData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="edit-property-description">Description</Label>
                        <Input
                          id="edit-property-description"
                          value={editPropertyData.description}
                          onChange={(e) => setEditPropertyData({ ...editPropertyData, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-property-type">Type</Label>
                        <Select
                          value={editPropertyData.property_type}
                          onValueChange={(value) => setEditPropertyData({ ...editPropertyData, property_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="edit-property-address">Address *</Label>
                        <Input
                          id="edit-property-address"
                          value={editPropertyData.address}
                          onChange={(e) => setEditPropertyData({ ...editPropertyData, address: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-property-city">City *</Label>
                        <Input
                          id="edit-property-city"
                          value={editPropertyData.city}
                          onChange={(e) => setEditPropertyData({ ...editPropertyData, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-property-state">State *</Label>
                        <Input
                          id="edit-property-state"
                          value={editPropertyData.state}
                          onChange={(e) => setEditPropertyData({ ...editPropertyData, state: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-property-rent">Rent ($/month) *</Label>
                        <Input
                          id="edit-property-rent"
                          type="number"
                          value={editPropertyData.rent_amount}
                          onChange={(e) => setEditPropertyData({ ...editPropertyData, rent_amount: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-property-deposit">Deposit ($) *</Label>
                        <Input
                          id="edit-property-deposit"
                          type="number"
                          value={editPropertyData.deposit_amount}
                          onChange={(e) => setEditPropertyData({ ...editPropertyData, deposit_amount: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-property-bedrooms">Bedrooms</Label>
                        <Input
                          id="edit-property-bedrooms"
                          type="number"
                          min="0"
                          value={editPropertyData.bedrooms}
                          onChange={(e) => setEditPropertyData({ ...editPropertyData, bedrooms: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-property-bathrooms">Bathrooms</Label>
                        <Input
                          id="edit-property-bathrooms"
                          type="number"
                          min="0"
                          value={editPropertyData.bathrooms}
                          onChange={(e) => setEditPropertyData({ ...editPropertyData, bathrooms: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-property-area">Area (sqft) *</Label>
                        <Input
                          id="edit-property-area"
                          type="number"
                          value={editPropertyData.area_sqft}
                          onChange={(e) => setEditPropertyData({ ...editPropertyData, area_sqft: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowEditPropertyDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={savingProperty}>
                        {savingProperty ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="owners" className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Property Owners</h3>
              <Dialog open={showCreateOwner} onOpenChange={setShowCreateOwner}>
                <DialogTrigger asChild>
                  <Button className="rounded-full" data-testid="add-owner-button">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Owner
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {createdOwnerInfo ? 'Owner Created Successfully!' : 'Add New Owner'}
                    </DialogTitle>
                    <DialogDescription>
                      {createdOwnerInfo 
                        ? 'Share these credentials with the owner.' 
                        : 'Create a new property owner account. A temporary password will be generated.'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {createdOwnerInfo ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div>
                          <span className="text-sm text-muted-foreground">Name:</span>
                          <p className="font-medium">{createdOwnerInfo.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <p className="font-medium">{createdOwnerInfo.email}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Temporary Password:</span>
                          <p className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                            {createdOwnerInfo.temp_password}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ⚠️ Please save this password! It won't be shown again.
                      </p>
                      <DialogFooter>
                        <Button onClick={closeCreateOwnerDialog} className="w-full">
                          Done
                        </Button>
                      </DialogFooter>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateOwner} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="owner-name">Full Name *</Label>
                        <Input
                          id="owner-name"
                          placeholder="John Smith"
                          value={newOwner.name}
                          onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner-email">Email *</Label>
                        <Input
                          id="owner-email"
                          type="email"
                          placeholder="owner@email.com"
                          value={newOwner.email}
                          onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner-phone">Phone</Label>
                        <Input
                          id="owner-phone"
                          placeholder="+1-555-1234"
                          value={newOwner.phone}
                          onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner-address">Address</Label>
                        <Input
                          id="owner-address"
                          placeholder="123 Main St, City, State"
                          value={newOwner.address}
                          onChange={(e) => setNewOwner({ ...newOwner, address: e.target.value })}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeCreateOwnerDialog}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={creatingOwner}>
                          {creatingOwner ? 'Creating...' : 'Create Owner'}
                        </Button>
                      </DialogFooter>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.map((owner) => (
                  <TableRow key={owner.user_id}>
                    <TableCell className="font-medium">{owner.name}</TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>{owner.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={owner.property_count > 0 ? 'default' : 'secondary'}>
                        {owner.property_count} {owner.property_count === 1 ? 'property' : 'properties'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(owner.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditOwnerDialog(owner)}
                          title="Edit owner"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openDeleteOwnerDialog(owner)}
                          title="Delete owner"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredOwners.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No owners found. Click "Add New Owner" to onboard a property owner.
              </div>
            )}

            {/* Delete Owner Confirmation Dialog */}
            <Dialog open={showDeleteOwnerDialog} onOpenChange={setShowDeleteOwnerDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Delete Owner</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this owner? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                {ownerToDelete && (
                  <div className="py-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium">{ownerToDelete.name}</p>
                      <p className="text-sm text-muted-foreground">{ownerToDelete.email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Note: Owners with properties cannot be deleted. Reassign or delete properties first.
                    </p>
                  </div>
                )}
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteOwnerDialog(false)}
                    disabled={deletingOwner}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteOwner}
                    disabled={deletingOwner}
                  >
                    {deletingOwner ? 'Deleting...' : 'Delete Owner'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Owner Dialog */}
            <Dialog open={showEditOwnerDialog} onOpenChange={setShowEditOwnerDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Owner</DialogTitle>
                  <DialogDescription>
                    Update owner details. Email cannot be changed.
                  </DialogDescription>
                </DialogHeader>
                {ownerToEdit && (
                  <form onSubmit={handleEditOwner} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email (read-only)</Label>
                      <Input value={ownerToEdit.email} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-owner-name">Name</Label>
                      <Input
                        id="edit-owner-name"
                        value={editOwnerData.name}
                        onChange={(e) => setEditOwnerData({ ...editOwnerData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-owner-phone">Phone</Label>
                      <Input
                        id="edit-owner-phone"
                        value={editOwnerData.phone}
                        onChange={(e) => setEditOwnerData({ ...editOwnerData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-owner-address">Address</Label>
                      <Input
                        id="edit-owner-address"
                        value={editOwnerData.address}
                        onChange={(e) => setEditOwnerData({ ...editOwnerData, address: e.target.value })}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowEditOwnerDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={savingOwner}>
                        {savingOwner ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="agents" className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">All Agents</h3>
              <Dialog open={showCreateAgent} onOpenChange={setShowCreateAgent}>
                <DialogTrigger asChild>
                  <Button className="rounded-full" data-testid="add-agent-button">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {createdAgentInfo ? 'Agent Created Successfully!' : 'Add New Agent'}
                    </DialogTitle>
                    <DialogDescription>
                      {createdAgentInfo 
                        ? 'Share these credentials with the agent.' 
                        : 'Create a new agent account. A temporary password will be generated.'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {createdAgentInfo ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div>
                          <span className="text-sm text-muted-foreground">Name:</span>
                          <p className="font-medium">{createdAgentInfo.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <p className="font-medium">{createdAgentInfo.email}</p>
                        </div>
                        {createdAgentInfo.specialization && (
                          <div>
                            <span className="text-sm text-muted-foreground">Specialization:</span>
                            <p className="font-medium">{createdAgentInfo.specialization}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-muted-foreground">Temporary Password:</span>
                          <p className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                            {createdAgentInfo.temp_password}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ⚠️ Please save this password! It won't be shown again.
                      </p>
                      <DialogFooter>
                        <Button onClick={closeCreateAgentDialog} className="w-full">
                          Done
                        </Button>
                      </DialogFooter>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateAgent} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="agent-name">Full Name *</Label>
                        <Input
                          id="agent-name"
                          placeholder="John Smith"
                          value={newAgent.name}
                          onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agent-email">Email *</Label>
                        <Input
                          id="agent-email"
                          type="email"
                          placeholder="agent@email.com"
                          value={newAgent.email}
                          onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agent-phone">Phone</Label>
                        <Input
                          id="agent-phone"
                          placeholder="+1-555-1234"
                          value={newAgent.phone}
                          onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agent-specialization">Specialization</Label>
                        <Select
                          value={newAgent.specialization}
                          onValueChange={(value) => setNewAgent({ ...newAgent, specialization: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Residential">Residential</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                            <SelectItem value="Luxury">Luxury</SelectItem>
                            <SelectItem value="Student Housing">Student Housing</SelectItem>
                            <SelectItem value="Family Homes">Family Homes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeCreateAgentDialog}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={creatingAgent}>
                          {creatingAgent ? 'Creating...' : 'Create Agent'}
                        </Button>
                      </DialogFooter>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Assigned Visits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => {
                  const assignedCount = visits.filter(v => v.assigned_agent_id === agent.user_id).length;
                  return (
                    <TableRow key={agent.user_id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.email}</TableCell>
                      <TableCell>{agent.phone || 'N/A'}</TableCell>
                      <TableCell>
                        {agent.specialization ? (
                          <Badge variant="outline">{agent.specialization}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={assignedCount > 0 ? 'default' : 'secondary'}>
                          {assignedCount} {assignedCount === 1 ? 'visit' : 'visits'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditAgentDialog(agent)}
                            title="Edit agent"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openDeleteAgentDialog(agent)}
                            title="Delete agent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredAgents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No agents found. Click "Add New Agent" to create one.
              </div>
            )}

            {/* Delete Agent Confirmation Dialog */}
            <Dialog open={showDeleteAgentDialog} onOpenChange={setShowDeleteAgentDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Delete Agent</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this agent? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                {agentToDelete && (
                  <div className="py-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium">{agentToDelete.name}</p>
                      <p className="text-sm text-muted-foreground">{agentToDelete.email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Note: Agents with active (non-completed) visits cannot be deleted.
                    </p>
                  </div>
                )}
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteAgentDialog(false)}
                    disabled={deletingAgent}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAgent}
                    disabled={deletingAgent}
                  >
                    {deletingAgent ? 'Deleting...' : 'Delete Agent'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Agent Dialog */}
            <Dialog open={showEditAgentDialog} onOpenChange={setShowEditAgentDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Agent</DialogTitle>
                  <DialogDescription>
                    Update agent details. Email cannot be changed.
                  </DialogDescription>
                </DialogHeader>
                {agentToEdit && (
                  <form onSubmit={handleEditAgent} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email (read-only)</Label>
                      <Input value={agentToEdit.email} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-agent-name">Name</Label>
                      <Input
                        id="edit-agent-name"
                        value={editAgentData.name}
                        onChange={(e) => setEditAgentData({ ...editAgentData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-agent-phone">Phone</Label>
                      <Input
                        id="edit-agent-phone"
                        value={editAgentData.phone}
                        onChange={(e) => setEditAgentData({ ...editAgentData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-agent-specialization">Specialization</Label>
                      <Select
                        value={editAgentData.specialization}
                        onValueChange={(value) => setEditAgentData({ ...editAgentData, specialization: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Residential">Residential</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Luxury">Luxury</SelectItem>
                          <SelectItem value="Student Housing">Student Housing</SelectItem>
                          <SelectItem value="Family Homes">Family Homes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowEditAgentDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={savingAgent}>
                        {savingAgent ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="agent-view" className="space-y-6">
            {filteredAgentsForView.map((agent) => {
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
            {filteredAgentsForView.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No agents found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;
