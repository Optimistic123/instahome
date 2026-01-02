import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, MapPin, Bed, Bath, Square, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { safeObject, safeArray, safeApiCall, safeGet } from '../utils/apiHelpers';

function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitData, setVisitData] = useState({ name: '', phone: '', preferred_date: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchProperty();
    checkAuth();
  }, [id]);

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

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const data = await safeApiCall(
        api.get(`/properties/${id}`),
        null
      );
      const propertyObj = safeObject(data, null);
      if (!propertyObj) {
        toast.error('Property not found');
        navigate('/properties');
        return;
      }
      setProperty(propertyObj);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Property not found');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/visit-requests', { ...visitData, property_id: id });
      toast.success('Visit request submitted successfully!');
      setVisitData({ name: '', phone: '', preferred_date: '', notes: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">RentalSquare</span>
            </Link>
            <Button asChild variant="ghost" className="rounded-full">
              <Link to={isAuthenticated ? `/dashboard/${userRole}` : '/login'}>
                {isAuthenticated ? 'Dashboard' : 'Sign In'}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6 rounded-full" asChild data-testid="back-button">
          <Link to="/properties">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
          </Link>
        </Button>

        {property ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {safeArray(property.images, []).length > 0 ? (
                  safeArray(property.images, []).map((img, idx) => (
                    <div key={idx} className={`${idx === 0 ? 'col-span-2' : ''} h-64 rounded-2xl overflow-hidden`}>
                      <img src={img || '/placeholder-property.jpg'} alt={property.title || 'Property'} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 h-64 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
              </div>

            <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
              <div>
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium mb-3">
                  {property.property_type}
                </div>
                <h1 className="text-3xl font-bold mb-2" data-testid="property-title">{property.title}</h1>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{property.address}, {property.city}, {property.state}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Bed className="h-6 w-6 text-primary" />
                  <span>{property.bedrooms} Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-6 w-6 text-primary" />
                  <span>{property.bathrooms} Baths</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-6 w-6 text-primary" />
                  <span>{property.area_sqft} sqft</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                {safeArray(property.amenities, []).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {safeArray(property.amenities, []).map((amenity, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No amenities listed</p>
                )}
              </div>
            </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card p-8 rounded-2xl border shadow-sm space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="text-4xl font-bold text-primary" data-testid="rent-amount">
                  ${property.rent_amount.toLocaleString()}
                </p>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Security Deposit</span>
                  <span className="font-medium">${property.deposit_amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Request Property Visit</h3>
                <form onSubmit={handleVisitRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={visitData.name}
                      onChange={(e) => setVisitData({ ...visitData, name: e.target.value })}
                      required
                      data-testid="name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1-555-1234"
                      value={visitData.phone}
                      onChange={(e) => setVisitData({ ...visitData, phone: e.target.value })}
                      data-testid="phone-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_date">Preferred Date</Label>
                    <Input
                      id="preferred_date"
                      type="date"
                      value={visitData.preferred_date}
                      onChange={(e) => setVisitData({ ...visitData, preferred_date: e.target.value })}
                      data-testid="date-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or questions..."
                      value={visitData.notes}
                      onChange={(e) => setVisitData({ ...visitData, notes: e.target.value })}
                      data-testid="notes-input"
                      rows={3}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full h-12 rounded-full text-base" 
                    data-testid="request-visit-button"
                  >
                    {submitting ? 'Submitting...' : 'Request a Visit'}
                  </Button>
                </form>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Our team will contact you within 24 hours to schedule your visit
              </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Property not found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyDetailPage;
