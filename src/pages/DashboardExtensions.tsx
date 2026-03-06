import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Search, Clock, MessageCircle, Star } from 'lucide-react';

import MessagingPanel from '@/components/MessagingPanel';
import QueueDisplay from '@/components/QueueDisplay';
import ReviewSection from '@/components/ReviewSection';
import { toast } from 'sonner';
import type { Appointment } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointmentsByPatient, getAppointmentsByDoctor, updateAppointmentStatus, getMessagesForUser, getDoctorByUserId, updateDoctorActiveHours, getReviewsByDoctor } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

const statusColor = (s: string) => {
    switch (s) {
        case 'booked': return 'bg-primary/10 text-primary';
        case 'completed': return 'bg-success/10 text-success';
        case 'cancelled': return 'bg-destructive/10 text-destructive';
        default: return '';
    }
};

// ─── Patient Dashboard ───────────────────────────────────────────────────────

const PatientDashboardFull = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    useRealtimeUpdates(['appointments', 'reviews']);

    if (!user) return <Navigate to="/login" />;

    const { data: appointments = [], isLoading } = useQuery({
        queryKey: ['appointments', 'patient', user.id],
        queryFn: () => getAppointmentsByPatient(user.id),
        enabled: !!user.id,
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string, status: 'cancelled' | 'completed' }) => updateAppointmentStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments', 'patient', user.id] });
            toast.success('Appointment status updated');
        },
        onError: () => toast.error('Failed to update appointment')
    });

    const handleCancel = (id: string) => updateStatus.mutate({ id, status: 'cancelled' });

    const upcoming = appointments.filter(a => a.status === 'booked');
    const past = appointments.filter(a => a.status !== 'booked');

    const { data: conversations = [] } = useQuery({
        queryKey: ['messages', user.id],
        queryFn: () => getMessagesForUser(user.id),
        enabled: !!user.id,
        refetchInterval: 5000
    });

    return (
        <div className="container py-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
                    <p className="text-sm text-muted-foreground">Manage your health journey</p>
                </div>
                <Button asChild>
                    <Link to="/search"><Search className="mr-2 h-4 w-4" />Find Doctors</Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card><CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Calendar className="h-6 w-6 text-primary" /></div>
                    <div><p className="text-2xl font-bold text-foreground">{upcoming.length}</p><p className="text-sm text-muted-foreground">Upcoming</p></div>
                </CardContent></Card>
                <Card><CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10"><Clock className="h-6 w-6 text-success" /></div>
                    <div><p className="text-2xl font-bold text-foreground">{past.filter(a => a.status === 'completed').length}</p><p className="text-sm text-muted-foreground">Completed</p></div>
                </CardContent></Card>
                <Card><CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10"><MessageCircle className="h-6 w-6 text-accent" /></div>
                    <div><p className="text-2xl font-bold text-foreground">{conversations.reduce((s, c) => s + c.unread_count, 0)}</p><p className="text-sm text-muted-foreground">Unread Messages</p></div>
                </CardContent></Card>
            </div>

            <Tabs defaultValue="appointments" className="mt-8">
                <TabsList>
                    <TabsTrigger value="appointments"><Calendar className="mr-2 h-4 w-4" />Appointments</TabsTrigger>
                    <TabsTrigger value="messages"><MessageCircle className="mr-2 h-4 w-4" />Messages</TabsTrigger>
                    <TabsTrigger value="reviews"><Star className="mr-2 h-4 w-4" />Reviews</TabsTrigger>
                </TabsList>

                {/* Appointments tab */}
                <TabsContent value="appointments" className="mt-4 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <>
                            {upcoming.length > 0 && upcoming[0].queue_number && (
                                <QueueDisplay
                                    queueNumber={upcoming[0].queue_number}
                                    totalInQueue={upcoming.length} // Approximation for now
                                />
                            )}

                            <Card>
                                <CardHeader><CardTitle className="font-display">Upcoming Appointments</CardTitle></CardHeader>
                                <CardContent>
                                    {upcoming.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No upcoming appointments. <Link to="/search" className="text-primary hover:underline">Find a doctor</Link>
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {upcoming.map(a => (
                                                <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                                                    <div>
                                                        <p className="font-medium text-foreground">{a.doctor_name}</p>
                                                        <p className="text-sm text-muted-foreground">{a.doctor_specialization} · {a.date} · Token #{a.queue_number}</p>
                                                        {a.queue_number && <p className="text-xs text-primary mt-0.5">Queue #{a.queue_number}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={statusColor(a.status)}>{a.status}</Badge>
                                                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleCancel(a.id)}>Cancel</Button>
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
                                    {past.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No past appointments.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {past.map(a => (
                                                <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                                                    <div>
                                                        <p className="font-medium text-foreground">{a.doctor_name}</p>
                                                        <p className="text-sm text-muted-foreground">{a.doctor_specialization} · {a.date} · Token #{a.queue_number}</p>
                                                    </div>
                                                    <Badge className={statusColor(a.status)}>{a.status}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>

                {/* Messages tab */}
                <TabsContent value="messages" className="mt-4">
                    <MessagingPanel currentUserId={user.id} currentUserName={user.name} conversations={conversations} />
                </TabsContent>

                {/* Reviews tab */}
                <TabsContent value="reviews" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle className="font-display">Doctors You've Visited</CardTitle></CardHeader>
                        <CardContent>
                            {past.filter(a => a.status === 'completed').length === 0 ? (
                                <p className="text-sm text-muted-foreground">Complete an appointment to leave a review.</p>
                            ) : (
                                <div className="space-y-4">
                                    {past.filter(a => a.status === 'completed').map(a => {
                                        return (
                                            <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                                                <div>
                                                    <p className="font-medium text-foreground">{a.doctor_name}</p>
                                                    <p className="text-sm text-muted-foreground">{a.doctor_specialization} · {a.date}</p>
                                                </div>
                                                <Button asChild size="sm" variant="outline">
                                                    <Link to={`/doctor/${a.doctor_id}`}>View Profile</Link>
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

// ─── Active Hours Card ──────────────────────────────────────────────────────

const ActiveHoursCard = ({ doctorId, currentHours }: { doctorId?: string; currentHours?: any }) => {
    const queryClient = useQueryClient();
    const [morningStart, setMorningStart] = useState(currentHours?.morning_start || '09:00');
    const [morningEnd, setMorningEnd] = useState(currentHours?.morning_end || '13:00');
    const [eveningStart, setEveningStart] = useState(currentHours?.evening_start || '16:00');
    const [eveningEnd, setEveningEnd] = useState(currentHours?.evening_end || '20:00');

    const saveMutation = useMutation({
        mutationFn: () => updateDoctorActiveHours(doctorId!, {
            morning_start: morningStart,
            morning_end: morningEnd,
            evening_start: eveningStart,
            evening_end: eveningEnd
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-record'] });
            toast.success('Active hours updated!');
        },
        onError: () => toast.error('Failed to update active hours')
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-display">Set Your Active Consultation Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Morning Session</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Start Time</Label>
                            <Input type="time" value={morningStart} onChange={e => setMorningStart(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>End Time</Label>
                            <Input type="time" value={morningEnd} onChange={e => setMorningEnd(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Evening Session</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Start Time</Label>
                            <Input type="time" value={eveningStart} onChange={e => setEveningStart(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>End Time</Label>
                            <Input type="time" value={eveningEnd} onChange={e => setEveningEnd(e.target.value)} />
                        </div>
                    </div>
                </div>
                <Button className="w-full" disabled={!doctorId || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                    {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Active Hours
                </Button>
            </CardContent>
        </Card>
    );
};

// ─── Doctor Dashboard Full ───────────────────────────────────────────────────

const DoctorDashboardFull = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    useRealtimeUpdates(['appointments', 'reviews', 'doctors']);

    if (!user) return <Navigate to="/login" />;

    // First, resolve the actual doctor record ID from the user's profile ID
    const { data: doctorRecord, isLoading: isDoctorLoading } = useQuery({
        queryKey: ['doctor-record', user.id],
        queryFn: () => getDoctorByUserId(user.id),
        enabled: !!user.id,
    });

    const doctorId = doctorRecord?.id; // This is doctors.id, NOT profiles.id

    const { data: appointments = [], isLoading } = useQuery({
        queryKey: ['appointments', 'doctor', doctorId],
        queryFn: () => getAppointmentsByDoctor(doctorId!),
        enabled: !!doctorId,
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string, status: 'cancelled' | 'completed' }) => updateAppointmentStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments', 'doctor', doctorId] });
            toast.success('Appointment updated');
        },
        onError: () => toast.error('Failed to update appointment')
    });


    const { data: conversations = [] } = useQuery({
        queryKey: ['messages', doctorId],
        queryFn: () => getMessagesForUser(doctorId!),
        enabled: !!doctorId,
        refetchInterval: 5000
    });

    const { data: reviews = [] } = useQuery({
        queryKey: ['reviews', doctorId],
        queryFn: () => getReviewsByDoctor(doctorId!),
        enabled: !!doctorId,
    });

    const handleComplete = (id: string) => updateStatus.mutate({ id, status: 'completed' });
    const handleCancel = (id: string) => updateStatus.mutate({ id, status: 'cancelled' });

    if (isDoctorLoading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8" />
            <span className="ml-2">Loading doctor profile...</span>
        </div>
    );

    const booked = appointments.filter(a => a.status === 'booked');
    const completed = appointments.filter(a => a.status === 'completed');
    const isPending = doctorRecord?.verification_status === 'pending';

    return (
        <div className="container py-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">Doctor Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Manage your profile and appointments</p>
                </div>
                <Badge variant={isPending ? 'outline' : 'default'} className={isPending ? 'border-warning text-warning' : 'bg-success text-success-foreground'}>
                    {doctorRecord?.verification_status || 'pending'}
                </Badge>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card><CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Calendar className="h-6 w-6 text-primary" /></div>
                    <div><p className="text-2xl font-bold">{booked.length}</p><p className="text-sm text-muted-foreground">Booked</p></div>
                </CardContent></Card>
                <Card><CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10"><Clock className="h-6 w-6 text-success" /></div>
                    <div><p className="text-2xl font-bold">{completed.length}</p><p className="text-sm text-muted-foreground">Completed</p></div>
                </CardContent></Card>
                <Card><CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10"><Star className="h-6 w-6 text-accent" /></div>
                    <div><p className="text-2xl font-bold">{doctorRecord?.rating?.toFixed(1) || '0.0'}</p><p className="text-sm text-muted-foreground">Avg Rating</p></div>
                </CardContent></Card>
            </div>

            <Tabs defaultValue="appointments" className="mt-8">
                <TabsList>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="active-hours">Active Hours</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="appointments" className="mt-4 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <>
                            <Card>
                                <CardHeader><CardTitle className="font-display">Today's Queue</CardTitle></CardHeader>
                                <CardContent>
                                    {booked.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Queue #</TableHead>
                                                    <TableHead>Patient</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Token</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {booked.map(a => (
                                                    <TableRow key={a.id}>
                                                        <TableCell><Badge variant="outline">#{a.queue_number}</Badge></TableCell>
                                                        <TableCell className="font-medium">{a.patient_name}</TableCell>
                                                        <TableCell>{a.date}</TableCell>
                                                        <TableCell>Token #{a.queue_number}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button size="sm" variant="outline" onClick={() => handleComplete(a.id)}>Complete</Button>
                                                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleCancel(a.id)}>Cancel</Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>

                            {completed.length > 0 && (
                                <Card>
                                    <CardHeader><CardTitle className="font-display">Completed Appointments</CardTitle></CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Patient</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Token</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {completed.map(a => (
                                                    <TableRow key={a.id}>
                                                        <TableCell className="font-medium">{a.patient_name}</TableCell>
                                                        <TableCell>{a.date}</TableCell>
                                                        <TableCell>Token #{a.queue_number}</TableCell>
                                                        <TableCell><Badge className="bg-success/10 text-success">Completed</Badge></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="active-hours" className="mt-4">
                    <ActiveHoursCard doctorId={doctorId} currentHours={doctorRecord?.availability} />
                </TabsContent>

                <TabsContent value="messages" className="mt-4">
                    <MessagingPanel currentUserId={user.id} currentUserName={user.name} conversations={conversations} />
                </TabsContent>

                <TabsContent value="reviews" className="mt-4">
                    <ReviewSection
                        doctorId={doctorId || ''}
                        rating={doctorRecord?.rating || 0}
                        reviewCount={doctorRecord?.review_count || reviews.length}
                        reviews={reviews}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export { PatientDashboardFull, DoctorDashboardFull };
