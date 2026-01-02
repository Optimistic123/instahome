import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Search } from 'lucide-react';
import { safeArray, safeApiCall, safeMap } from '../utils/apiHelpers';

function PropertyListingPage() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setIsAuthenticated(true);
      setUserRole(response.data?.role);
    } catch {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  useEffect(() => {
    filterProperties();
  }, [searchTerm, cityFilter, typeFilter, properties]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await safeApiCall(
        api.get('/properties?status=available'),
        []
      );
      const propertiesArray = safeArray(data, []);
      setProperties(propertiesArray);
      setFilteredProperties(propertiesArray);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = safeArray(properties, []);

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cityFilter !== 'all') {
      filtered = filtered.filter(p => p?.city === cityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p?.property_type === typeFilter);
    }

    setFilteredProperties(filtered);
  };

  const cities = [...new Set(safeMap(properties, p => p?.city, []).filter(Boolean))];
  const types = [...new Set(safeMap(properties, p => p?.property_type, []).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">RentalSquare</span>
            </Link>
            <Button asChild variant="ghost" className="rounded-full" data-testid="login-button">
              <Link to={isAuthenticated ? `/dashboard/${userRole}` : '/login'}>
                {isAuthenticated ? 'Dashboard' : 'Sign In'}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" data-testid="page-title">Available Properties</h1>
          <p className="text-muted-foreground">Find your perfect rental home</p>
        </div>

        <div className="bg-card p-6 rounded-2xl border shadow-sm mb-8" data-testid="filter-section">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger data-testid="city-filter">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading properties...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="property-grid">
            {safeArray(filteredProperties, []).map(property => (
              <div
                key={property?.property_id || Math.random()}
                className="property-card group bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                data-testid={`property-card-${property?.property_id}`}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={property?.images?.[0] || '/placeholder-property.jpg'}
                    alt={property?.title || 'Property'}
                    className="property-card-image w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                    ${(property?.rent_amount || 0).toLocaleString()}/mo
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    {property?.property_type || 'Property'}
                  </div>
                  <h3 className="text-xl font-semibold line-clamp-1">
                    {property?.title || 'Untitled Property'}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{property?.city || ''}, {property?.state || ''}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{property?.bedrooms || 0} Beds</span>
                    <span>•</span>
                    <span>{property?.bathrooms || 0} Baths</span>
                    <span>•</span>
                    <span>{property?.area_sqft || 0} sqft</span>
                  </div>
                <Button
                  className="w-full rounded-full mt-4"
                  asChild
                  data-testid={`view-details-${property.property_id}`}
                >
                  <Link to={`/properties/${property.property_id}`}>View Details</Link>
                </Button>
              </div>
            </div>
            ))}
          </div>
        )}

        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-12" data-testid="no-results">
            <p className="text-muted-foreground">No properties found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyListingPage;