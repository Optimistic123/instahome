import React, { useState, useEffect } from 'react';
import { api } from '../../App';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, Eye, Archive, X } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await api.get('/visit-requests');
      setVisits(response.data);
      
      const propIds = [...new Set(response.data.map(v => v.property_id))];
      const propPromises = propIds.map(id => api.get(`/properties/${id}`));
      const propResponses = await Promise.all(propPromises);
      setProperties(propResponses.map(r => r.data));
    } catch (error) {
      console.error('Error fetching visits:', error);
    }
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

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

        <div className="bg-card rounded-xl border p-6">
          {visits.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground mb-4">No visit requests yet</p>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => {
                  const property = properties.find(p => p.property_id === visit.property_id);
                  return (
                    <TableRow key={visit.visit_id}>
                      <TableCell className="font-medium">{property?.title}</TableCell>
                      <TableCell>{property?.city}, {property?.state}</TableCell>
                      <TableCell>
                        <Badge>{visit.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{visit.stage}</Badge>
                      </TableCell>
                      <TableCell>{new Date(visit.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

export default TenantDashboard;
