import type { Doctor, Appointment, Review, Message, Conversation } from '@/types';

export const SPECIALIZATIONS = [
  'Cardiologist', 'Dentist', 'Dermatologist', 'ENT Specialist',
  'General Physician', 'Gynecologist', 'Neurologist', 'Ophthalmologist',
  'Orthopedic', 'Pediatrician', 'Psychiatrist', 'Urologist',
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1', user_id: '2', name: 'Dr. Sarah Smith', email: 'sarah@clinic.com',
    specialization: 'Cardiologist', qualification: 'MBBS, MD Cardiology, FACC',
    experience: 12, fees: 500, location: 'New York', clinic_address: '123 Heart Care Blvd, Manhattan, NY 10001',
    license_number: 'MED-12345', rating: 4.8, review_count: 124, verification_status: 'verified',
    bio: 'Dr. Smith is a board-certified cardiologist with 12 years of experience treating complex cardiovascular conditions. She completed her fellowship at Johns Hopkins Medical Center.',
    availability: [
      { day: 'Monday', start: '09:00', end: '17:00' },
      { day: 'Wednesday', start: '09:00', end: '17:00' },
      { day: 'Friday', start: '09:00', end: '13:00' },
    ],
  },
  {
    id: '2', user_id: '10', name: 'Dr. James Wilson', email: 'james@clinic.com',
    specialization: 'Dermatologist', qualification: 'MBBS, MD Dermatology',
    experience: 8, fees: 350, location: 'Los Angeles', clinic_address: '456 Skin Health Ave, Beverly Hills, CA 90210',
    license_number: 'MED-67890', rating: 4.5, review_count: 89, verification_status: 'verified',
    bio: 'Specializing in medical and cosmetic dermatology, Dr. Wilson is known for his patient-centered approach. He treats conditions from acne to skin cancer and offers advanced laser therapies.',
    availability: [
      { day: 'Tuesday', start: '10:00', end: '18:00' },
      { day: 'Thursday', start: '10:00', end: '18:00' },
      { day: 'Saturday', start: '09:00', end: '14:00' },
    ],
  },
  {
    id: '3', user_id: '11', name: 'Dr. Emily Chen', email: 'emily@clinic.com',
    specialization: 'Pediatrician', qualification: 'MBBS, DCH, MD Pediatrics',
    experience: 15, fees: 400, location: 'Chicago', clinic_address: '789 Kids Care Lane, Downtown, Chicago, IL 60601',
    license_number: 'MED-11111', rating: 4.9, review_count: 212, verification_status: 'verified',
    bio: 'Dr. Chen is a highly acclaimed pediatrician with 15 years specializing in child development and preventive care. She is passionate about making healthcare accessible and comfortable for young patients.',
    availability: [
      { day: 'Monday', start: '08:00', end: '16:00' },
      { day: 'Tuesday', start: '08:00', end: '16:00' },
      { day: 'Thursday', start: '08:00', end: '12:00' },
    ],
  },
  {
    id: '4', user_id: '12', name: 'Dr. Michael Brown', email: 'michael@clinic.com',
    specialization: 'Orthopedic', qualification: 'MBBS, MS Orthopedics, FRCS',
    experience: 20, fees: 600, location: 'New York', clinic_address: '321 Bone & Joint Center, Brooklyn, NY 11201',
    license_number: 'MED-22222', rating: 4.7, review_count: 178, verification_status: 'verified',
    bio: 'With 20 years of experience, Dr. Brown is one of the leading orthopedic surgeons in New York. He specializes in joint replacement, sports injuries, and minimally invasive surgery.',
    availability: [
      { day: 'Monday', start: '09:00', end: '15:00' },
      { day: 'Wednesday', start: '09:00', end: '15:00' },
      { day: 'Friday', start: '09:00', end: '15:00' },
    ],
  },
  {
    id: '5', user_id: '13', name: 'Dr. Lisa Park', email: 'lisa@clinic.com',
    specialization: 'General Physician', qualification: 'MBBS, MD',
    experience: 6, fees: 200, location: 'Los Angeles', clinic_address: '555 Wellness Rd, Santa Monica, CA 90401',
    license_number: 'MED-33333', rating: 4.3, review_count: 65, verification_status: 'verified',
    bio: 'Dr. Park provides comprehensive primary care for patients of all ages. She focuses on preventive medicine, chronic disease management, and holistic wellness.',
    availability: [
      { day: 'Monday', start: '09:00', end: '17:00' },
      { day: 'Tuesday', start: '09:00', end: '17:00' },
      { day: 'Wednesday', start: '09:00', end: '17:00' },
      { day: 'Thursday', start: '09:00', end: '17:00' },
      { day: 'Friday', start: '09:00', end: '17:00' },
    ],
  },
  {
    id: '6', user_id: '14', name: 'Dr. Raj Patel', email: 'raj@clinic.com',
    specialization: 'Neurologist', qualification: 'MBBS, DM Neurology',
    experience: 18, fees: 700, location: 'Chicago', clinic_address: '999 Brain Health Blvd, Lincoln Park, Chicago, IL 60614',
    license_number: 'MED-44444', rating: 4.6, review_count: 143, verification_status: 'pending',
    bio: 'Dr. Patel is a distinguished neurologist with 18 years of experience treating neurological disorders including epilepsy, stroke, multiple sclerosis, and Parkinson\'s disease.',
    availability: [
      { day: 'Tuesday', start: '10:00', end: '16:00' },
      { day: 'Thursday', start: '10:00', end: '16:00' },
    ],
  },
  {
    id: '7', user_id: '15', name: 'Dr. Maria Rodriguez', email: 'maria@clinic.com',
    specialization: 'Gynecologist', qualification: 'MBBS, MD Obstetrics & Gynecology',
    experience: 14, fees: 450, location: 'Houston', clinic_address: '222 Women\'s Health Center, Houston, TX 77001',
    license_number: 'MED-55555', rating: 4.9, review_count: 287, verification_status: 'verified',
    bio: 'Dr. Rodriguez is a compassionate gynecologist and obstetrician dedicated to women\'s health at every stage of life. She offers comprehensive prenatal care, minimally invasive surgeries, and menopause management.',
    availability: [
      { day: 'Monday', start: '08:00', end: '16:00' },
      { day: 'Wednesday', start: '08:00', end: '16:00' },
      { day: 'Friday', start: '08:00', end: '12:00' },
    ],
  },
  {
    id: '8', user_id: '16', name: 'Dr. David Kim', email: 'david@clinic.com',
    specialization: 'Psychiatrist', qualification: 'MBBS, MD Psychiatry',
    experience: 10, fees: 550, location: 'Seattle', clinic_address: '777 Mind Wellness Clinic, Capitol Hill, Seattle, WA 98102',
    license_number: 'MED-66666', rating: 4.7, review_count: 98, verification_status: 'verified',
    bio: 'Dr. Kim specializes in mood disorders, anxiety, ADHD, and trauma-related conditions. He uses evidence-based therapies combined with medication management to deliver holistic mental healthcare.',
    availability: [
      { day: 'Tuesday', start: '09:00', end: '17:00' },
      { day: 'Thursday', start: '09:00', end: '17:00' },
      { day: 'Saturday', start: '10:00', end: '14:00' },
    ],
  },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', patient_id: '1', doctor_id: '1', rating: 5, review: 'Dr. Smith is absolutely wonderful! She took the time to explain everything clearly and I felt very comfortable during my visit. Highly recommend!', patient_name: 'John P.', created_at: '2026-02-15' },
  { id: 'r2', patient_id: '4', doctor_id: '1', rating: 5, review: 'Exceptional care and professionalism. Dr. Smith diagnosed my condition quickly and her treatment plan worked perfectly.', patient_name: 'Alice B.', created_at: '2026-01-28' },
  { id: 'r3', patient_id: '5', doctor_id: '1', rating: 4, review: 'Very knowledgeable doctor. Wait time was a bit long but the consultation was worth it.', patient_name: 'Robert M.', created_at: '2026-01-10' },
  { id: 'r4', patient_id: '1', doctor_id: '2', rating: 4, review: 'Dr. Wilson is professional and skilled. The clinic is clean and the staff are friendly. My skin condition improved significantly.', patient_name: 'John P.', created_at: '2026-01-20' },
  { id: 'r5', patient_id: '6', doctor_id: '2', rating: 5, review: 'Amazing results! Dr. Wilson recommended the perfect treatment for my condition. Will definitely return.', patient_name: 'Sophie L.', created_at: '2025-12-30' },
  { id: 'r6', patient_id: '7', doctor_id: '3', rating: 5, review: 'Dr. Chen is incredible with children. My daughter was nervous but Dr. Chen put her at ease immediately. Best pediatrician in Chicago!', patient_name: 'Mark T.', created_at: '2026-02-01' },
  { id: 'r7', patient_id: '8', doctor_id: '3', rating: 5, review: 'We\'ve been bringing our kids to Dr. Chen for 5 years. She remembers everything about each patient and gives personalized care.', patient_name: 'Jennifer W.', created_at: '2026-01-15' },
  { id: 'r8', patient_id: '1', doctor_id: '4', rating: 5, review: 'Dr. Brown performed my knee replacement surgery and the results are outstanding. I\'m walking without pain for the first time in years!', patient_name: 'John P.', created_at: '2025-11-20' },
  { id: 'r9', patient_id: '9', doctor_id: '5', rating: 4, review: 'Dr. Park is friendly and thorough. She answered all my questions and made me feel at ease. Great primary care physician.', patient_name: 'Carol D.', created_at: '2026-02-10' },
  { id: 'r10', patient_id: '10', doctor_id: '7', rating: 5, review: 'Dr. Rodriguez delivered both my babies and was incredible throughout both pregnancies. I cannot recommend her highly enough.', patient_name: 'Emma S.', created_at: '2026-01-05' },
];

// Shared appointment store - this simulates a database
let appointmentIdCounter = 10;
export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', patient_id: '1', doctor_id: '1', date: '2026-03-10', time_slot: '10:00', status: 'booked', created_at: '2026-03-01', patient_name: 'John Patient', patient_email: 'patient@demo.com', doctor_name: 'Dr. Sarah Smith', doctor_specialization: 'Cardiologist', queue_number: 3 },
  { id: '2', patient_id: '1', doctor_id: '3', date: '2026-02-20', time_slot: '14:00', status: 'completed', created_at: '2026-02-15', patient_name: 'John Patient', patient_email: 'patient@demo.com', doctor_name: 'Dr. Emily Chen', doctor_specialization: 'Pediatrician', queue_number: 5 },
  { id: '3', patient_id: '1', doctor_id: '2', date: '2026-02-10', time_slot: '11:00', status: 'cancelled', created_at: '2026-02-05', patient_name: 'John Patient', patient_email: 'patient@demo.com', doctor_name: 'Dr. James Wilson', doctor_specialization: 'Dermatologist', queue_number: 2 },
  { id: '4', patient_id: '4', doctor_id: '1', date: '2026-03-10', time_slot: '11:00', status: 'booked', created_at: '2026-03-02', patient_name: 'Alice Brown', patient_email: 'alice@example.com', doctor_name: 'Dr. Sarah Smith', doctor_specialization: 'Cardiologist', queue_number: 4 },
  { id: '5', patient_id: '5', doctor_id: '1', date: '2026-03-10', time_slot: '14:00', status: 'booked', created_at: '2026-03-03', patient_name: 'Robert Miller', patient_email: 'robert@example.com', doctor_name: 'Dr. Sarah Smith', doctor_specialization: 'Cardiologist', queue_number: 6 },
  { id: '6', patient_id: '6', doctor_id: '7', date: '2026-03-12', time_slot: '09:00', status: 'booked', created_at: '2026-03-04', patient_name: 'Sophie Lee', patient_email: 'sophie@example.com', doctor_name: 'Dr. Maria Rodriguez', doctor_specialization: 'Gynecologist', queue_number: 1 },
  { id: '7', patient_id: '7', doctor_id: '4', date: '2026-03-08', time_slot: '10:00', status: 'completed', created_at: '2026-03-01', patient_name: 'Mark Taylor', patient_email: 'mark@example.com', doctor_name: 'Dr. Michael Brown', doctor_specialization: 'Orthopedic', queue_number: 2 },
  { id: '8', patient_id: '8', doctor_id: '8', date: '2026-03-14', time_slot: '11:00', status: 'booked', created_at: '2026-03-05', patient_name: 'Jennifer White', patient_email: 'jennifer@example.com', doctor_name: 'Dr. David Kim', doctor_specialization: 'Psychiatrist', queue_number: 3 },
  { id: '9', patient_id: '9', doctor_id: '5', date: '2026-02-28', time_slot: '15:00', status: 'cancelled', created_at: '2026-02-20', patient_name: 'Carol Davis', patient_email: 'carol@example.com', doctor_name: 'Dr. Lisa Park', doctor_specialization: 'General Physician', queue_number: 7 },
];

export function addAppointment(appt: Omit<Appointment, 'id' | 'created_at'>) {
  const newAppt: Appointment = {
    ...appt,
    id: String(++appointmentIdCounter),
    created_at: new Date().toISOString().split('T')[0],
    queue_number: MOCK_APPOINTMENTS.filter(a => a.doctor_id === appt.doctor_id && a.date === appt.date && a.status === 'booked').length + 1,
  };
  MOCK_APPOINTMENTS.push(newAppt);
  return newAppt;
}

export function cancelAppointment(id: string) {
  const idx = MOCK_APPOINTMENTS.findIndex(a => a.id === id);
  if (idx >= 0) MOCK_APPOINTMENTS[idx].status = 'cancelled';
}

export function completeAppointment(id: string) {
  const idx = MOCK_APPOINTMENTS.findIndex(a => a.id === id);
  if (idx >= 0) MOCK_APPOINTMENTS[idx].status = 'completed';
}

export const MOCK_CONVERSATIONS: Record<string, Conversation[]> = {
  // Patient's conversations
  '1': [
    {
      id: 'conv1',
      participant_id: '2',
      participant_name: 'Dr. Sarah Smith',
      participant_role: 'doctor',
      last_message: 'Please remember to take your medication 30 minutes before meals.',
      last_timestamp: '2026-03-05T08:30:00',
      unread_count: 1,
      messages: [
        { id: 'm1', sender_id: '1', receiver_id: '2', sender_name: 'John Patient', message: 'Hello Dr. Smith, I wanted to ask about my test results.', timestamp: '2026-03-04T10:00:00', read: true },
        { id: 'm2', sender_id: '2', receiver_id: '1', sender_name: 'Dr. Sarah Smith', message: 'Your test results look good. Your cholesterol levels have improved significantly. Keep up the good work!', timestamp: '2026-03-04T10:30:00', read: true },
        { id: 'm3', sender_id: '1', receiver_id: '2', sender_name: 'John Patient', message: 'That\'s great news! Should I continue with my current medication?', timestamp: '2026-03-04T11:00:00', read: true },
        { id: 'm4', sender_id: '2', receiver_id: '1', sender_name: 'Dr. Sarah Smith', message: 'Please remember to take your medication 30 minutes before meals.', timestamp: '2026-03-05T08:30:00', read: false },
      ],
    },
    {
      id: 'conv2',
      participant_id: '11',
      participant_name: 'Dr. Emily Chen',
      participant_role: 'doctor',
      last_message: 'Sure, we can schedule a follow-up next week.',
      last_timestamp: '2026-02-22T14:00:00',
      unread_count: 0,
      messages: [
        { id: 'm5', sender_id: '1', receiver_id: '11', sender_name: 'John Patient', message: 'Dr. Chen, can we schedule a follow-up for my daughter?', timestamp: '2026-02-22T13:00:00', read: true },
        { id: 'm6', sender_id: '11', receiver_id: '1', sender_name: 'Dr. Emily Chen', message: 'Sure, we can schedule a follow-up next week.', timestamp: '2026-02-22T14:00:00', read: true },
      ],
    },
  ],
};
