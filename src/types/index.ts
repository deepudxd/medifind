export type UserRole = 'patient' | 'doctor' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type AppointmentStatus = 'booked' | 'cancelled' | 'completed';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
}

export interface TimeSlot {
  day: string;
  start: string;
  end: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  experience: number;
  fees: number;
  location: string;
  clinic_address: string;
  license_number: string;
  availability: TimeSlot[];
  verification_status: VerificationStatus;
  rating: number;
  review_count: number;
  avatar_url?: string;
  phone?: string;
  bio?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time_slot: string;
  status: AppointmentStatus;
  created_at: string;
  patient_name?: string;
  patient_email?: string;
  doctor_name?: string;
  doctor_specialization?: string;
  queue_number?: number;
  notes?: string;
}

export interface Review {
  id: string;
  patient_id: string;
  doctor_id: string;
  rating: number;
  review: string;
  patient_name: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_role: UserRole;
  last_message: string;
  last_timestamp: string;
  unread_count: number;
  messages: Message[];
}

export interface Specialization {
  name: string;
  icon: string;
  count: number;
}
