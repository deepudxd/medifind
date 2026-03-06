import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { SPECIALIZATIONS } from '@/data/mockDoctors';
import type { UserRole } from '@/types';
import { registerDoctorDetails } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const Register = () => {
  const [role, setRole] = useState<UserRole>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Doctor fields
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [location, setLocation] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(email, password, name, role);

      if (role === 'doctor') {
        if (data?.user) {
          await registerDoctorDetails({
            user_id: data.user.id,
            specialization,
            qualification,
            experience: parseInt(experience) || 0,
            fees: parseFloat(fees) || 0,
            location,
            clinic_address: clinicAddress,
            license_number: licenseNumber
          } as any);
        } else {
          throw new Error("Could not retrieve user details for Doctor registration.");
        }
      }

      toast.success(role === 'doctor'
        ? 'Registration submitted! Your account is pending admin verification.'
        : 'Account created successfully!');
      navigate(role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          </div>
          <CardTitle className="font-display text-2xl">Create Account</CardTitle>
          <CardDescription>Join MediFind as a patient or doctor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>I am a</Label>
              <Select value={role} onValueChange={v => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} />
            </div>

            {role === 'doctor' && (
              <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Doctor Details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Select value={specialization} onValueChange={setSpecialization}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>License Number</Label>
                    <Input required value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="MED-XXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Qualification</Label>
                    <Input value={qualification} onChange={e => setQualification(e.target.value)} placeholder="MBBS, MD" />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience (years)</Label>
                    <Input type="number" min={0} value={experience} onChange={e => setExperience(e.target.value)} placeholder="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Consultation Fee (₹)</Label>
                    <Input type="number" min={0} value={fees} onChange={e => setFees(e.target.value)} placeholder="200" />
                  </div>
                  <div className="space-y-2">
                    <Label>City / Location</Label>
                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="New York" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Clinic Address</Label>
                  <Textarea value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} placeholder="Full clinic address" />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : role === 'doctor' ? 'Submit for Verification' : 'Create Account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
