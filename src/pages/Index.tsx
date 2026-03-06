import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Heart, Calendar, Shield, Stethoscope, Eye, Brain, Bone, Baby, SmilePlus } from 'lucide-react';

const SPECIALIZATIONS = [
  { name: 'Cardiologist', icon: Heart },
  { name: 'Dermatologist', icon: SmilePlus },
  { name: 'Ophthalmologist', icon: Eye },
  { name: 'Neurologist', icon: Brain },
  { name: 'Orthopedic', icon: Bone },
  { name: 'Pediatrician', icon: Baby },
  { name: 'General Physician', icon: Stethoscope },
  { name: 'Dentist', icon: SmilePlus },
];

const STEPS = [
  { title: 'Search a Doctor', desc: 'Find specialists by name, specialization, or location.', icon: Search },
  { title: 'Book Appointment', desc: 'Get a token and visit the doctor on your chosen date.', icon: Calendar },
  { title: 'Get Consultation', desc: 'Visit the doctor and receive quality healthcare.', icon: Shield },
];

const Index = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('loc', location);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Find & Book the <span className="text-primary">Best Doctors</span> Near You
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Search trusted healthcare professionals, view their profiles, and book appointments — all in one place.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Specialization or doctor name"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="h-12 flex-1 bg-card"
              />
              <Input
                placeholder="City or location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="h-12 sm:w-48 bg-card"
              />
              <Button type="submit" size="lg" className="h-12 gap-2">
                <Search className="h-4 w-4" /> Search
              </Button>
            </form>
          </motion.div>
        </div>
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Specializations */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-display text-2xl font-bold text-center text-foreground">Browse by Specialization</h2>
          <p className="mt-2 text-center text-muted-foreground">Find the right specialist for your needs</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {SPECIALIZATIONS.map(s => (
              <motion.div key={s.name} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card
                  className="cursor-pointer text-center transition-colors hover:border-primary/40"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(s.name)}`)}
                >
                  <CardContent className="p-5 flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <s.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="font-display text-2xl font-bold text-center text-foreground">How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" fill="currentColor" />
            <span className="font-display font-semibold text-foreground">MediFind</span>
          </div>
          <p>&copy; {new Date().getFullYear()} MediFind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
