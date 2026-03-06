import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CheckCircle, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Doctor } from '@/types';
import { addAppointment, MOCK_APPOINTMENTS } from '@/data/mockDoctors';

interface AppointmentBookingProps {
    doctor: Doctor;
    onBooked?: () => void;
}

const ALL_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

const AppointmentBooking = ({ doctor, onBooked }: AppointmentBookingProps) => {
    const { user, isAuthenticated } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedSlot, setSelectedSlot] = useState<string>();
    const [booked, setBooked] = useState(false);
    const [queueNum, setQueueNum] = useState<number>();

    // Compute which slots are already taken for the selected date + doctor
    const takenSlots = selectedDate
        ? MOCK_APPOINTMENTS
            .filter(a =>
                a.doctor_id === doctor.id &&
                a.date === format(selectedDate, 'yyyy-MM-dd') &&
                a.status === 'booked'
            )
            .map(a => a.time_slot)
        : [];

    const handleBook = () => {
        if (!isAuthenticated || !user) {
            toast.error('Please login to book an appointment');
            return;
        }
        if (!selectedDate || !selectedSlot) {
            toast.error('Please select a date and time slot');
            return;
        }
        const appt = addAppointment({
            patient_id: user.id,
            doctor_id: doctor.id,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time_slot: selectedSlot,
            status: 'booked',
            patient_name: user.name,
            patient_email: user.email,
            doctor_name: doctor.name,
            doctor_specialization: doctor.specialization,
        });
        setQueueNum(appt.queue_number);
        setBooked(true);
        toast.success(`Appointment confirmed! Queue #${appt.queue_number}`);
        onBooked?.();
    };

    const handleReset = () => {
        setBooked(false);
        setSelectedDate(undefined);
        setSelectedSlot(undefined);
        setQueueNum(undefined);
    };

    if (booked) {
        return (
            <Card className="border-success/40 bg-success/5">
                <CardContent className="p-6 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-success" />
                    <h3 className="mt-3 font-display font-semibold text-foreground">Appointment Booked!</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {format(selectedDate!, 'PPP')} at {selectedSlot}
                    </p>
                    {queueNum && (
                        <Badge className="mt-2 bg-primary text-primary-foreground">
                            Queue Number: #{queueNum}
                        </Badge>
                    )}
                    <Button variant="outline" className="mt-4 w-full" onClick={handleReset}>
                        Book Another Appointment
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-display text-lg">Select Date &amp; Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={date => {
                                setSelectedDate(date);
                                setSelectedSlot(undefined);
                            }}
                            disabled={date => date < new Date() || date > addDays(new Date(), 60)}
                            className="p-3 pointer-events-auto"
                        />
                    </PopoverContent>
                </Popover>

                {/* Time slots */}
                {selectedDate && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-foreground">Available Slots</p>
                        <div className="grid grid-cols-3 gap-2">
                            {ALL_SLOTS.map(slot => {
                                const taken = takenSlots.includes(slot);
                                return (
                                    <Button
                                        key={slot}
                                        size="sm"
                                        variant={selectedSlot === slot ? 'default' : taken ? 'ghost' : 'outline'}
                                        className={cn(taken && 'opacity-40 cursor-not-allowed line-through')}
                                        disabled={taken}
                                        onClick={() => setSelectedSlot(slot)}
                                    >
                                        {slot}
                                    </Button>
                                );
                            })}
                        </div>

                        {takenSlots.length > 0 && (
                            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {takenSlots.length} slot{takenSlots.length !== 1 ? 's' : ''} already booked
                            </p>
                        )}
                    </div>
                )}

                <Button
                    className="w-full"
                    disabled={!selectedDate || !selectedSlot}
                    onClick={handleBook}
                >
                    Confirm Booking
                </Button>
            </CardContent>
        </Card>
    );
};

export default AppointmentBooking;
