import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, IndianRupee } from 'lucide-react';
import type { Doctor } from '@/types';

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const nextAvailable = doctor.availability[0];

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-bold text-xl">
            {doctor.name.split(' ').slice(1).map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground truncate">{doctor.name}</h3>
            <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
            <p className="text-xs text-muted-foreground">{doctor.qualification}</p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" fill="currentColor" /> {doctor.rating}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {doctor.experience} yrs</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {doctor.location}</span>
              <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> ₹{doctor.fees}</span>
            </div>

            {nextAvailable && (
              <Badge variant="secondary" className="mt-2 text-xs">
                Next: {nextAvailable.day} {nextAvailable.start}–{nextAvailable.end}
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to={`/doctor/${doctor.id}`}>View Profile</Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link to={`/doctor/${doctor.id}?book=true`}>Book Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
