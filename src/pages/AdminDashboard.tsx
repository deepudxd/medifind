import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, UserCheck, Calendar, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllDoctors, updateDoctorVerification } from '@/lib/api';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  useRealtimeUpdates(['doctors', 'appointments']);

  if (!user || user.role !== 'admin') return <Navigate to="/login" />;

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['admin', 'doctors'],
    queryFn: getAllDoctors,
    enabled: !!user && user.role === 'admin'
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'pending' | 'verified' | 'rejected' }) => updateDoctorVerification(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
      toast.success('Doctor status updated');
    },
    onError: () => toast.error('Failed to update doctor status')
  });

  const pending = doctors.filter(d => d.verification_status === 'pending');
  const verified = doctors.filter(d => d.verification_status === 'verified');

  const handleVerify = (id: string) => updateStatus.mutate({ id, status: 'verified' });
  const handleReject = (id: string) => updateStatus.mutate({ id, status: 'rejected' });

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
      <p className="text-sm text-muted-foreground">System overview and management</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Users className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">150</p><p className="text-sm text-muted-foreground">Total Users</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10"><UserCheck className="h-6 w-6 text-success" /></div><div><p className="text-2xl font-bold">{verified.length}</p><p className="text-sm text-muted-foreground">Verified Doctors</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10"><Clock className="h-6 w-6 text-warning" /></div><div><p className="text-2xl font-bold">{pending.length}</p><p className="text-sm text-muted-foreground">Pending Approvals</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10"><Calendar className="h-6 w-6 text-accent" /></div><div><p className="text-2xl font-bold">320</p><p className="text-sm text-muted-foreground">Total Appointments</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="pending" className="mt-8">
        <TabsList>
          <TabsTrigger value="pending">Pending Approvals ({pending.length})</TabsTrigger>
          <TabsTrigger value="doctors">All Doctors</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="font-display">Pending Doctor Approvals</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending approvals.</p>
              ) : (
                <div className="space-y-3">
                  {pending.map(d => (
                    <div key={d.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">{d.name}</p>
                        <p className="text-sm text-muted-foreground">{d.specialization} · License: {d.license_number} · {d.experience} yrs exp.</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleVerify(d.id)} className="gap-1"><CheckCircle className="h-4 w-4" /> Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(d.id)} className="gap-1"><XCircle className="h-4 w-4" /> Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="font-display">All Doctors</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>{d.specialization}</TableCell>
                        <TableCell>{d.location}</TableCell>
                        <TableCell>
                          <Badge variant={d.verification_status === 'verified' ? 'default' : 'outline'}
                            className={d.verification_status === 'verified' ? 'bg-success' : d.verification_status === 'pending' ? 'border-warning text-warning' : 'border-destructive text-destructive'}>
                            {d.verification_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{d.rating}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="font-display">Appointment Records</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Appointment records will be available once connected to Supabase.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
