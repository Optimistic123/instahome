import React, { useState, useEffect } from 'react';
import { api } from '../../App';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, Eye, Archive, Home } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { safeArray, safeApiCall, safeMap } from '../../utils/apiHelpers';
import TenantDashboardShimmer from '../../components/shimmer/TenantDashboardShimmer';
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

  if (loading) {
    return <TenantDashboardShimmer />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TooltipProvider>
        <header className="glass-effect sticky top-0 z-50 border-b">
          <div className="container mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <span className="text-base sm:text-2xl font-bold truncate">My Dashboard</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="sm" className="rounded-full px-2 sm:px-4">
                      <Link to="/properties">
                        <Eye className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Browse Properties</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="sm:hidden">
                    <p>Browse Properties</p>
                  </TooltipContent>
                </Tooltip>
                <span className="hidden sm:inline text-sm text-muted-foreground">Welcome, {user?.name}</span>
                <span className="sm:hidden text-xs text-muted-foreground truncate max-w-[80px]">{user?.name}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full">
                      <LogOut className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="sm:hidden">
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/properties" className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    <span className="hidden sm:inline">Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>My Visits</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Visits</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Track and manage your property visit requests</p>
          </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="active" className="flex-1 sm:flex-initial">Active Requests</TabsTrigger>
            <TabsTrigger value="archived" className="flex-1 sm:flex-initial">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="bg-card rounded-xl border p-4 sm:p-6">
              {activeVisits.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">No active visit requests</p>
                  <Button asChild className="rounded-full">
                    <Link to="/properties">Browse Properties</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Property</TableHead>
                        <TableHead className="hidden md:table-cell min-w-[120px]">Location</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[100px]">Stage</TableHead>
                        <TableHead className="hidden lg:table-cell">Requested On</TableHead>
                        <TableHead className="min-w-[100px]">Actions</TableHead>
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
                            <TableCell className="hidden md:table-cell">{property?.city}, {property?.state}</TableCell>
                            <TableCell>
                              <Badge className="text-xs whitespace-nowrap">{visit.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs whitespace-nowrap">{visit.stage}</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">{new Date(visit.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 px-2 sm:px-3"
                                    data-testid={`archive-visit-${visit.visit_id}`}
                                  >
                                    <Archive className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Archive</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-base sm:text-lg">Archive Visit Request?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm">
                                      This will move the visit request to your archived list. You can view it later in the Archived tab.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-row justify-end space-x-2">
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
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="archived">
            <div className="bg-card rounded-xl border p-4 sm:p-6">
              {archivedVisits.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-sm sm:text-base text-muted-foreground">No archived requests</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Property</TableHead>
                        <TableHead className="hidden md:table-cell min-w-[120px]">Location</TableHead>
                        <TableHead className="min-w-[100px]">Stage</TableHead>
                        <TableHead className="hidden sm:table-cell">Requested On</TableHead>
                        <TableHead className="hidden lg:table-cell">Archived On</TableHead>
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
                            <TableCell className="hidden md:table-cell">{property?.city}, {property?.state}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs whitespace-nowrap">{visit.stage}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{new Date(visit.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="hidden lg:table-cell">{new Date(visit.archived_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </TooltipProvider>
    </div>
  );
}

export default TenantDashboard;
