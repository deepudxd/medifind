import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { Calendar, Search, Clock } from 'lucide-react';
import type { Appointment } from '@/types';

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', patient_id: '1', doctor_id: '1', date: '2026-03-10', time_slot: '10:00', status: 'booked', created_at: '2026-03-05', doctor_name: 'Dr. Sarah Smith', doctor_specialization: 'Cardiologist' },
  { id: '2', patient_id: '1', doctor_id: '3', date: '2026-02-20', time_slot: '14:00', status: 'completed', created_at: '2026-02-15', doctor_name: 'Dr. Emily Chen', doctor_specialization: 'Pediatrician' },
  { id: '3', patient_id: '1', doctor_id: '2', date: '2026-02-10', time_slot: '11:00', status: 'cancelled', created_at: '2026-02-05', doctor_name: 'Dr. James Wilson', doctor_specialization: 'Dermatologist' },
];

const statusColor = (s: string) => {
  switch (s) {
    case 'booked': return 'bg-primary/10 text-primary';
    case 'completed': return 'bg-success/10 text-success';
    case 'cancelled': return 'bg-destructive/10 text-destructive';
    default: return '';
  }
};

const PatientDashboard = () => {
  const { user } = useAuth();
  if (!user || user.role !== 'patient') return <Navigate to="/login" />;

  const upcoming = MOCK_APPOINTMENTS.filter(a => a.status === 'booked');
  const past = MOCK_APPOINTMENTS.filter(a => a.status !== 'booked');

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
          <p className="text-sm text-muted-foreground">Manage your appointments and find doctors</p>
        </div>
        <Button asChild><Link to="/search"><Search className="mr-2 h-4 w-4" /> Find Doctors</Link></Button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Calendar className="h-6 w-6 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{upcoming.length}</p><p className="text-sm text-muted-foreground">Upcoming</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10"><Clock className="h-6 w-6 text-success" /></div>
            <div><p className="text-2xl font-bold text-foreground">{past.filter(a => a.status === 'completed').length}</p><p className="text-sm text-muted-foreground">Completed</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10"><Calendar className="h-6 w-6 text-destructive" /></div>
            <div><p className="text-2xl font-bold text-foreground">{past.filter(a => a.status === 'cancelled').length}</p><p className="text-sm text-muted-foreground">Cancelled</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader><CardTitle className="font-display">Upcoming Appointments</CardTitle></CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming appointments. <Link to="/search" className="text-primary hover:underline">Find a doctor</Link></p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium text-foreground">{a.doctor_name}</p>
                      <p className="text-sm text-muted-foreground">{a.doctor_specialization} · {a.date} · Token #{a.queue_number || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor(a.status)}>{a.status}</Badge>
                      <Button size="sm" variant="outline">Cancel</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display">Past Appointments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {past.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-foreground">{a.doctor_name}</p>
                    <p className="text-sm text-muted-foreground">{a.doctor_specialization} · {a.date} · Token #{a.queue_number || 'N/A'}</p>
                  </div>
                  <Badge className={statusColor(a.status)}>{a.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
