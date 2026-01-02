import React, { useState, useEffect } from 'react';
import { api } from '../../App';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, Eye, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { safeArray, safeApiCall, safeMap } from '../../utils/apiHelpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function TenantDashboard({ user }) {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [archivedVisits, setArchivedVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const visitsData = await safeApiCall(
        api.get('/visit-requests'),
        []
      );
      const visitsArray = safeArray(visitsData, []);
      setVisits(visitsArray);
      
      const propIds = [...new Set(safeMap(visitsArray, v => v?.property_id, []).filter(Boolean))];
      const propPromises = propIds.map(id => api.get(`/properties/${id}`));
      const propResponses = await Promise.allSettled(propPromises);
      const validProperties = propResponses
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value?.data)
        .filter(Boolean);
      setProperties(validProperties);
    } catch (error) {
      console.error('Error fetching visits:', error);
      setVisits([]);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  const archiveVisit = (visitId) => {
    const visit = visits.find(v => v.visit_id === visitId);
    if (visit) {
      setArchivedVisits([...archivedVisits, { ...visit, archived_at: new Date().toISOString() }]);
      setVisits(visits.filter(v => v.visit_id !== visitId));
      toast.success('Visit archived successfully');
    }
  };

  const activeVisits = visits;

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">My Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/properties">Browse Properties</Link>
              </Button>
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
          <h1 className="text-3xl font-bold mb-2">My Visit Requests</h1>
          <p className="text-muted-foreground">Track your property visit requests</p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Requests</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="bg-card rounded-xl border p-6">
              {activeVisits.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground mb-4">No active visit requests</p>
                  <Button asChild className="rounded-full">
                    <Link to="/properties">Browse Properties</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Requested On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeVisits.map((visit) => {
                      const property = properties.find(p => p.property_id === visit.property_id);
                      return (
                        <TableRow key={visit.visit_id}>
                          <TableCell className="font-medium">
                            <a
                              href={`/properties/${visit.property_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              data-testid={`property-link-${visit.property_id}`}
                            >
                              {property?.title}
                            </a>
                          </TableCell>
                          <TableCell>{property?.city}, {property?.state}</TableCell>
                          <TableCell>
                            <Badge>{visit.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{visit.stage}</Badge>
                          </TableCell>
                          <TableCell>{new Date(visit.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`archive-visit-${visit.visit_id}`}
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Archive Visit Request?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will move the visit request to your archived list. You can view it later in the Archived tab.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => archiveVisit(visit.visit_id)}>
                                    Archive
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="archived">
            <div className="bg-card rounded-xl border p-6">
              {archivedVisits.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground">No archived requests</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Requested On</TableHead>
                      <TableHead>Archived On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedVisits.map((visit) => {
                      const property = properties.find(p => p.property_id === visit.property_id);
                      return (
                        <TableRow key={visit.visit_id}>
                          <TableCell className="font-medium">
                            <a
                              href={`/properties/${visit.property_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {property?.title}
                            </a>
                          </TableCell>
                          <TableCell>{property?.city}, {property?.state}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{visit.stage}</Badge>
                          </TableCell>
                          <TableCell>{new Date(visit.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(visit.archived_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default TenantDashboard;
