import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Calendar, Users, Clock } from 'lucide-react';
import type { Appointment } from '@/types';

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', patient_id: '1', doctor_id: '2', date: '2026-03-10', time_slot: '10:00', status: 'booked', created_at: '2026-03-05', patient_name: 'John Patient' },
  { id: '2', patient_id: '5', doctor_id: '2', date: '2026-03-10', time_slot: '11:00', status: 'booked', created_at: '2026-03-05', patient_name: 'Alice Brown' },
];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [verificationStatus] = useState<'pending' | 'verified' | 'rejected'>('verified');

  if (!user || user.role !== 'doctor') return <Navigate to="/login" />;

  const isPending = verificationStatus === 'pending';

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Doctor Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and appointments</p>
        </div>
        <Badge variant={isPending ? 'outline' : 'default'} className={isPending ? 'border-warning text-warning' : 'bg-success text-success-foreground'}>
          {verificationStatus}
        </Badge>
      </div>

      {isPending && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
          <div>
            <p className="font-medium text-foreground">Account Pending Verification</p>
            <p className="text-sm text-muted-foreground">Your account is awaiting admin approval. You can edit your profile but won't appear in search results yet.</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Calendar className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">{MOCK_APPOINTMENTS.length}</p><p className="text-sm text-muted-foreground">Today's Appointments</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10"><Users className="h-6 w-6 text-success" /></div><div><p className="text-2xl font-bold">24</p><p className="text-sm text-muted-foreground">Total Patients</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10"><Clock className="h-6 w-6 text-accent" /></div><div><p className="text-2xl font-bold">4.8</p><p className="text-sm text-muted-foreground">Avg Rating</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="appointments" className="mt-8">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="profile">Edit Profile</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="font-display">Upcoming Appointments</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_APPOINTMENTS.map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium text-foreground">{a.patient_name}</p>
                      <p className="text-sm text-muted-foreground">{a.date} · Token #{a.queue_number || 'N/A'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Complete</Button>
                      <Button size="sm" variant="ghost" className="text-destructive">Cancel</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="font-display">Edit Profile</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Name</Label><Input defaultValue={user.name} /></div>
                <div className="space-y-2"><Label>Specialization</Label><Input defaultValue="Cardiologist" /></div>
                <div className="space-y-2"><Label>Qualification</Label><Input defaultValue="MBBS, MD" /></div>
                <div className="space-y-2"><Label>Experience (years)</Label><Input type="number" defaultValue="12" /></div>
                <div className="space-y-2"><Label>Consultation Fee (₹)</Label><Input type="number" defaultValue="500" /></div>
                <div className="space-y-2"><Label>Location</Label><Input defaultValue="New York" /></div>
              </div>
              <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="font-display">Manage Availability</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Availability management will be fully functional once connected to Supabase. Currently showing placeholder UI.
              <div className="mt-4 space-y-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <div key={day} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-medium text-foreground">{day}</span>
                    <div className="flex gap-2 items-center">
                      <Input className="w-24" type="time" defaultValue="09:00" />
                      <span>to</span>
                      <Input className="w-24" type="time" defaultValue="17:00" />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4">Save Availability</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
