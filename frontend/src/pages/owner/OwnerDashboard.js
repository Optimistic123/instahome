import React, { useState, useEffect } from 'react';
import { api } from '../../App';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, DollarSign, Home } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function OwnerDashboard({ user }) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/owner/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  if (!dashboard) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Owner Dashboard</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-3xl font-bold mt-2">{dashboard.total_properties}</p>
              </div>
              <Building2 className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Rentals</p>
                <p className="text-3xl font-bold mt-2">{dashboard.active_properties}</p>
              </div>
              <Home className="h-12 w-12 text-accent opacity-20" />
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-3xl font-bold mt-2">${dashboard.total_monthly_income.toLocaleString()}</p>
              </div>
              <DollarSign className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-3xl font-bold mt-2">{dashboard.pending_payments}</p>
              </div>
              <DollarSign className="h-12 w-12 text-destructive opacity-20" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-2xl font-bold mb-6">Property Earnings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Monthly Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Next Payment Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.property_earnings.map((property) => (
                <TableRow key={property.property_id}>
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>${property.rent_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={property.status === 'occupied' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={property.payment_status === 'paid' ? 'default' : 'destructive'}>
                      {property.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {property.next_payment_due ? new Date(property.next_payment_due).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
