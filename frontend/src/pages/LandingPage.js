import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../App';
import { Button } from '@/components/ui/button';
import { Building2, Search, MapPin, Home, LogIn } from 'lucide-react';
import { safeArray, safeApiCall } from '../utils/apiHelpers';

function LandingPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await safeApiCall(
        api.get('/properties?status=available'),
        []
      );
      const propertiesArray = safeArray(data, []);
      setProperties(propertiesArray.slice(0, 3));
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight">RentalSquare</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/properties" className="text-sm font-medium hover:text-primary transition" data-testid="properties-nav-link">
                Properties
              </Link>
              <Button asChild variant="ghost" size="sm" className="rounded-full" data-testid="login-nav-button">
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance" data-testid="hero-title">
              Find Your
              <span className="text-primary"> Perfect </span>
              Rental Home
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover premium properties managed by trusted professionals. Your dream home awaits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8 rounded-full text-base" asChild data-testid="browse-properties-button">
                <Link to="/properties">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Properties
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-full text-base" asChild data-testid="get-started-button">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="featured-section-title">Featured Properties</h2>
            <p className="text-muted-foreground">Handpicked homes for your next chapter</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No properties available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div
                  key={property.property_id}
                  className="property-card group bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                  data-testid={`property-card-${property.property_id}`}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={property.images?.[0] || '/placeholder-property.jpg'}
                      alt={property.title || 'Property'}
                      className="property-card-image w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                      ${(property.rent_amount || 0).toLocaleString()}/mo
                    </div>
                  </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold line-clamp-1" data-testid={`property-title-${property.property_id}`}>
                    {property.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{property.city}, {property.state}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{property.bedrooms} Beds</span>
                    <span>•</span>
                    <span>{property.bathrooms} Baths</span>
                    <span>•</span>
                    <span>{property.area_sqft} sqft</span>
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

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="rounded-full" asChild data-testid="view-all-button">
              <Link to="/properties">View All Properties</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-8 rounded-2xl bg-primary/5">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Verified Properties</h3>
              <p className="text-muted-foreground text-sm">
                All listings are verified and managed by professional property managers
              </p>
            </div>
            <div className="text-center space-y-4 p-8 rounded-2xl bg-accent/5">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Easy Search</h3>
              <p className="text-muted-foreground text-sm">
                Find your perfect home with advanced filters and detailed property information
              </p>
            </div>
            <div className="text-center space-y-4 p-8 rounded-2xl bg-primary/5">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Hassle-Free Process</h3>
              <p className="text-muted-foreground text-sm">
                Request visits online and get instant updates on your rental journey
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-muted/30 py-12 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>© 2024 RentalSquare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;