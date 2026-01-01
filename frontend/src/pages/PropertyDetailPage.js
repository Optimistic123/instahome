import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Building2, MapPin, Bed, Bath, Square, CheckCircle2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitData, setVisitData] = useState({ phone: '', preferred_date: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);

  useEffect(() => {
    fetchProperty();
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    try {
      await api.get('/auth/me');
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
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
      setVisitData({ phone: '', preferred_date: '', notes: '' });
      setShowVisitForm(false);
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
              <Link to={isAuthenticated ? '/dashboard/tenant' : '/login'}>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {property.images.map((img, idx) => (
                <div key={idx} className={`${idx === 0 ? 'col-span-2' : ''} h-64 rounded-2xl overflow-hidden`}>
                  <img src={img} alt={property.title} className="w-full h-full object-cover" />
                </div>
              ))}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card p-8 rounded-2xl border shadow-sm">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="text-4xl font-bold text-primary" data-testid="rent-amount">
                    ${property.rent_amount.toLocaleString()}
                  </p>
                </div>

                <div className="pt-4 border-t mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Security Deposit</span>
                    <span className="font-medium">${property.deposit_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowVisitForm(!showVisitForm)}
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  data-testid="toggle-visit-form"
                >
                  <div className="text-left">
                    <h3 className="text-lg font-semibold mb-1">Request a Visit</h3>
                    <p className="text-sm text-muted-foreground">Schedule a property viewing</p>
                  </div>
                  {showVisitForm ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {showVisitForm && (
                  <div className="p-6 pt-0 border-t animate-fade-in">
                    <form onSubmit={handleVisitRequest} className="space-y-4">
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
                        className="w-full rounded-full h-12" 
                        data-testid="submit-visit-request"
                      >
                        {submitting ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </form>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Our team will contact you within 24 hours to schedule your visit
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailPage;
