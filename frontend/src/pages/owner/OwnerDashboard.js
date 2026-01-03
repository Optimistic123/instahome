import React, { useState, useEffect } from 'react';
import { api } from '../../App';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, LogOut, DollarSign, Home, X, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import OwnerDashboardShimmer from '../../components/shimmer/OwnerDashboardShimmer';

function OwnerDashboard({ user }) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');

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
    return <OwnerDashboardShimmer />;
  }

  // Filter properties
  const filteredProperties = dashboard.property_earnings.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentFilter === 'all' || property.payment_status === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-base sm:text-2xl font-bold truncate">Owner Dashboard</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              <span className="hidden sm:inline text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <span className="sm:hidden text-xs text-muted-foreground truncate max-w-[80px]">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-6 mb-8">
          <div className="bg-card p-3 md:p-6 rounded-lg md:rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Total Properties</p>
                <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2">{dashboard.total_properties}</p>
              </div>
              <Building2 className="h-8 w-8 md:h-12 md:w-12 text-primary opacity-20 flex-shrink-0 ml-1 md:ml-2" />
            </div>
          </div>
          <div className="bg-card p-3 md:p-6 rounded-lg md:rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Active Rentals</p>
                <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2">{dashboard.active_properties}</p>
              </div>
              <Home className="h-8 w-8 md:h-12 md:w-12 text-accent opacity-20 flex-shrink-0 ml-1 md:ml-2" />
            </div>
          </div>
          <div className="bg-card p-3 md:p-6 rounded-lg md:rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Monthly Income</p>
                <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2">${dashboard.total_monthly_income.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 md:h-12 md:w-12 text-primary opacity-20 flex-shrink-0 ml-1 md:ml-2" />
            </div>
          </div>
          <div className="bg-card p-3 md:p-6 rounded-lg md:rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Pending Payments</p>
                <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2">{dashboard.pending_payments}</p>
              </div>
              <DollarSign className="h-8 w-8 md:h-12 md:w-12 text-destructive opacity-20 flex-shrink-0 ml-1 md:ml-2" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Property Earnings</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-10 bg-background"
                  data-testid="owner-search-input"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="clear-search-button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-40" data-testid="payment-filter">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Property</TableHead>
                  <TableHead className="min-w-[100px]">Monthly Rent</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Payment Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Next Payment Due</TableHead>
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
                  <TableCell>${property.rent_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={property.status === 'occupied' ? 'default' : 'secondary'} className="text-xs whitespace-nowrap">
                      {property.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={property.payment_status === 'paid' ? 'default' : 'destructive'} className="text-xs whitespace-nowrap">
                      {property.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {property.next_payment_due ? new Date(property.next_payment_due).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          {filteredProperties.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No properties found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
