import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, User, Phone } from 'lucide-react';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { ...formData, role: 'tenant' });
      toast.success('Account created successfully!');
      navigate('/dashboard/tenant', { state: { user: response.data } });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-muted/30">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="text-muted-foreground mt-2">Join our rental platform today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border shadow-sm" data-testid="register-form">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="pl-10"
                required
                data-testid="name-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
                data-testid="email-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1-555-1234"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10"
                data-testid="phone-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                required
                minLength={8}
                data-testid="password-input"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-full"
            disabled={loading}
            data-testid="register-submit-button"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/login" className="text-primary hover:underline font-medium" data-testid="login-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;