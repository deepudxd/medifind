import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDoctors } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import DoctorCard from '@/components/DoctorCard';
import { SPECIALIZATIONS } from '@/data/mockDoctors';
import { Search, Loader2 } from 'lucide-react';

const DoctorSearch = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('loc') || '');
  const [specFilter, setSpecFilter] = useState('all');
  const [maxFee, setMaxFee] = useState([1000]);
  const [minExperience, setMinExperience] = useState([0]);

  const { data: doctors = [], isLoading, error } = useQuery({
    queryKey: ['doctors', { specialization: specFilter, maxFee: maxFee[0], minExperience: minExperience[0], location, query }],
    queryFn: () => getDoctors({
      specialization: specFilter,
      maxFee: maxFee[0],
      minExperience: minExperience[0],
      location,
      query
    })
  });

  const results = doctors;

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold text-foreground">Find Doctors</h1>
      <p className="mt-1 text-muted-foreground">Search verified healthcare professionals</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters sidebar */}
        <div className="space-y-6 rounded-lg border bg-card p-5">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Doctor or specialization" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input placeholder="City" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Specialization</Label>
            <Select value={specFilter} onValueChange={setSpecFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Max Fee: ₹{maxFee[0]}</Label>
            <Slider min={50} max={1000} step={50} value={maxFee} onValueChange={setMaxFee} />
          </div>
          <div className="space-y-2">
            <Label>Min Experience: {minExperience[0]} yrs</Label>
            <Slider min={0} max={30} step={1} value={minExperience} onValueChange={setMinExperience} />
          </div>
        </div>

        {/* Results */}
        <div>
          {isLoading ? (
            <div className="flex justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
              Failed to load doctors. Please try again.
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">{results.length} doctor{results.length !== 1 ? 's' : ''} found</p>
              {results.length === 0 ? (
                <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
                  No doctors match your search criteria.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {results.map(d => <DoctorCard key={d.id} doctor={d} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSearch;
