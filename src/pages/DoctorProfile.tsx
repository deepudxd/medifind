import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Star, MapPin, Clock, IndianRupee, GraduationCap, CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDoctorById, bookAppointment, getReviewsByDoctor, getTokenCount } from '@/lib/api';
import ReviewSection from '@/components/ReviewSection';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';


const DoctorProfile = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const showBooking = searchParams.get('book') === 'true';
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  useRealtimeUpdates(['reviews', 'appointments']);

  const [bookingOpen, setBookingOpen] = useState(showBooking);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [booked, setBooked] = useState(false);
  const [assignedToken, setAssignedToken] = useState<number>();

  const { data: doctor, isLoading, error } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => getDoctorById(id!),
    enabled: !!id,
  });

  const { data: tokenCount = 0 } = useQuery({
    queryKey: ['token-count', id, selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''],
    queryFn: () => getTokenCount(id!, format(selectedDate!, 'yyyy-MM-dd')),
    enabled: !!id && !!selectedDate,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getReviewsByDoctor(id!),
    enabled: !!id,
  });

  const bookMutation = useMutation({
    mutationFn: bookAppointment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['token-count', id] });
      setBooked(true);
      setAssignedToken(data.queue_number);
      toast.success(`Token #${data.queue_number} assigned with ${doctor?.name} on ${format(selectedDate!, 'PPP')}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to book appointment');
    }
  });

  if (isLoading) return <div className="container py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error || !doctor) return <div className="container py-16 text-center text-muted-foreground">Doctor not found.</div>;

  const handleBook = () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to book an appointment');
      return;
    }
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (user.role !== 'patient') {
      toast.error('Only patients can book appointments');
      return;
    }

    bookMutation.mutate({
      patient_id: user.id,
      doctor_id: doctor.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: 'token',
      status: 'booked'
    });
  };

  return (
    <div className="container py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Profile */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-display text-3xl font-bold">
                  {doctor.name.split(' ').slice(1).map(n => n[0]).join('')}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">{doctor.name}</h1>
                  <p className="text-primary font-medium">{doctor.specialization}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-4 w-4 text-warning" fill="currentColor" /> {doctor.rating} rating</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {doctor.experience} years exp.</span>
                    <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" /> ₹{doctor.fees} / visit</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {doctor.location}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">About</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2"><GraduationCap className="mt-0.5 h-4 w-4 text-primary" /> <div><p className="font-medium">Qualification</p><p className="text-muted-foreground">{doctor.qualification}</p></div></div>
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> <div><p className="font-medium">Clinic Address</p><p className="text-muted-foreground">{doctor.clinic_address}</p></div></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Active Hours</CardTitle></CardHeader>
            <CardContent>
              {doctor.availability && typeof doctor.availability === 'object' && !Array.isArray(doctor.availability) ? (
                <div className="space-y-2 text-sm">
                  {(doctor.availability as any).morning_start && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Morning</Badge>
                      <span>{(doctor.availability as any).morning_start} – {(doctor.availability as any).morning_end}</span>
                    </div>
                  )}
                  {(doctor.availability as any).evening_start && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Evening</Badge>
                      <span>{(doctor.availability as any).evening_start} – {(doctor.availability as any).evening_end}</span>
                    </div>
                  )}
                </div>
              ) : Array.isArray(doctor.availability) && doctor.availability.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {doctor.availability.map((a: any) => (
                    <Badge key={a.day} variant="secondary">{a.day}: {a.start}–{a.end}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active hours set yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Patient Reviews</CardTitle></CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <ReviewSection doctorId={doctor.id} rating={doctor.rating} reviewCount={doctor.review_count} reviews={reviews} />
            </CardContent>
          </Card>
        </div>

        {/* Booking sidebar */}
        <div className="space-y-4">
          {!bookingOpen && !booked && (
            <Button className="w-full" size="lg" onClick={() => setBookingOpen(true)}>Book Appointment</Button>
          )}

          {booked ? (
            <Card className="border-success/40 bg-success/5">
              <CardContent className="p-6 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-success" />
                <h3 className="mt-3 font-display font-semibold text-foreground">Token Assigned!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Token #{assignedToken} on {format(selectedDate!, 'PPP')}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => { setBooked(false); setBookingOpen(false); setSelectedDate(undefined); setAssignedToken(undefined); }}>
                  Book Another
                </Button>
              </CardContent>
            </Card>
          ) : bookingOpen && (
            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Select Date</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={date => date < new Date()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>

                {selectedDate && (
                  <p className="text-sm text-muted-foreground">You will be Token #{tokenCount + 1} for {format(selectedDate, 'PPP')}</p>
                )}

                <Button className="w-full" disabled={!selectedDate || bookMutation.isPending} onClick={handleBook}>
                  {bookMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Get Token
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5 text-sm">
              <p className="font-medium text-foreground">Consultation Fee</p>
              <p className="mt-1 text-2xl font-display font-bold text-primary">₹{doctor.fees}</p>
              <p className="mt-1 text-muted-foreground">Per visit</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
