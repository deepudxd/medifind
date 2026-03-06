import { supabase } from './supabase';
import type { Doctor, Appointment, Review, Message, Profile, Conversation } from '@/types';

// ==========================================
// DOCTORS API
// ==========================================

export const registerDoctorDetails = async (doctorData: Omit<Doctor, 'id' | 'created_at' | 'verification_status' | 'rating' | 'review_count' | 'name' | 'email' | 'avatar_url' | 'phone' | 'bio'>) => {
    // Strip frontend-only properties that belong to the profile table, not the doctor table
    const dbPayload = {
        user_id: doctorData.user_id,
        specialization: doctorData.specialization,
        qualification: doctorData.qualification,
        experience: doctorData.experience,
        fees: doctorData.fees,
        location: doctorData.location,
        clinic_address: doctorData.clinic_address,
        license_number: doctorData.license_number,
        availability: doctorData.availability || [],
        verification_status: 'pending',
        rating: 0,
        review_count: 0
    };

    const { data, error } = await supabase
        .from('doctors')
        .insert([dbPayload])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getDoctorByUserId = async (userId: string): Promise<Doctor | null> => {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.warn('getDoctorByUserId error:', error.message);
        return null;
    }
    return data as Doctor;
};

export const getAllDoctors = async (): Promise<Doctor[]> => {
    const { data, error } = await supabase
        .from('doctors')
        .select(`
            *,
            profiles:user_id (name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((d: any) => ({
        ...d,
        name: d.profiles?.name || 'Unknown Doctor',
        email: d.profiles?.email,
        avatar: d.profiles?.avatar_url,
    })) as Doctor[];
};

export const updateDoctorVerification = async (id: string, status: 'pending' | 'verified' | 'rejected') => {
    const { error } = await supabase
        .from('doctors')
        .update({ verification_status: status })
        .eq('id', id);

    if (error) throw error;
};

export const getDoctors = async (filters?: {
    query?: string;
    location?: string;
    specialization?: string;
    maxFee?: number;
    minExperience?: number;
}): Promise<Doctor[]> => {
    let query = supabase
        .from('doctors')
        .select(`
      *,
      profiles:user_id (name, avatar_url)
    `)
        .eq('verification_status', 'verified');

    if (filters?.specialization && filters.specialization !== 'all') {
        query = query.eq('specialization', filters.specialization);
    }
    if (filters?.maxFee) {
        query = query.lte('fees', filters.maxFee);
    }
    if (filters?.minExperience) {
        query = query.gte('experience', filters.minExperience);
    }

    const { data, error } = await query;
    if (error) throw error;

    let doctors = data.map((d: any) => ({
        ...d,
        name: d.profiles?.name || 'Unknown Doctor',
        avatar: d.profiles?.avatar_url,
    })) as Doctor[];

    // Client-side text filtering for query/location due to complex ILIKE needs
    if (filters?.query) {
        const q = filters.query.toLowerCase();
        doctors = doctors.filter(d =>
            d.name.toLowerCase().includes(q) ||
            d.specialization.toLowerCase().includes(q)
        );
    }
    if (filters?.location) {
        const loc = filters.location.toLowerCase();
        doctors = doctors.filter(d => d.location.toLowerCase().includes(loc));
    }

    return doctors;
};

export const getDoctorById = async (id: string): Promise<Doctor | null> => {
    const { data, error } = await supabase
        .from('doctors')
        .select(`
      *,
      profiles:user_id (name, avatar_url)
    `)
        .eq('id', id)
        .single();

    if (error || !data) return null;

    return {
        ...data,
        name: data.profiles?.name || 'Unknown Doctor',
        avatar: data.profiles?.avatar_url,
    } as Doctor;
};

// ==========================================
// APPOINTMENTS API
// ==========================================

export const getAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      doctors:doctor_id (
        specialization,
        profiles:user_id (name)
      )
    `)
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

    if (error) throw error;

    return data.map((a: any) => ({
        ...a,
        doctor_name: a.doctors?.profiles?.name,
        doctor_specialization: a.doctors?.specialization,
    })) as Appointment[];
};

export const getAppointmentsByDoctor = async (doctorId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      profiles:patient_id (name)
    `)
        .eq('doctor_id', doctorId)
        .order('date', { ascending: true })
        .order('time_slot', { ascending: true });

    if (error) throw error;

    return data.map((a: any) => ({
        ...a,
        patient_name: a.profiles?.name,
    })) as Appointment[];
};

export const bookAppointment = async (appt: Omit<Appointment, 'id' | 'created_at' | 'queue_number'>) => {
    // Insert appointment — the DB trigger `trg_set_queue_number` auto-assigns queue_number
    const { data, error } = await supabase
        .from('appointments')
        .insert([{
            patient_id: appt.patient_id,
            doctor_id: appt.doctor_id,
            date: appt.date,
            time_slot: `token_${Date.now()}`,
            status: appt.status,
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateAppointmentStatus = async (id: string, status: 'cancelled' | 'completed') => {
    const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
};

export const getTokenCount = async (doctorId: string, date: string): Promise<number> => {
    const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .eq('status', 'booked');

    if (error) throw error;
    return count || 0;
};

export const updateDoctorActiveHours = async (doctorId: string, activeHours: { morning_start: string; morning_end: string; evening_start: string; evening_end: string }) => {
    const { data, error } = await supabase
        .from('doctors')
        .update({ availability: activeHours })
        .eq('id', doctorId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ==========================================
// REVIEWS API
// ==========================================

export const getReviewsByDoctor = async (doctorId: string): Promise<Review[]> => {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
      *,
      profiles:patient_id (name, avatar_url)
    `)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((r: any) => ({
        ...r,
        patient_name: r.profiles?.name || 'Anonymous',
        patient_avatar: r.profiles?.avatar_url,
    })) as Review[];
};

export const submitReview = async (review: { patient_id: string; doctor_id: string; rating: number; review: string }) => {
    const { data, error } = await supabase
        .from('reviews')
        .insert([review])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ==========================================
// MESSAGES API
// ==========================================

export const getMessagesForUser = async (userId: string): Promise<Conversation[]> => {
    const { data, error } = await supabase
        .from('messages')
        .select(`
            id,
            message,
            read,
            created_at,
            sender_id,
            receiver_id,
            sender:sender_id(id, name, role),
            receiver:receiver_id(id, name, role)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });

    if (error) throw error;

    const convMap = new Map<string, Conversation>();

    data.forEach((m: any) => {
        const isSender = m.sender_id === userId;
        const otherUser = isSender ? m.receiver : m.sender;
        if (!otherUser) return;
        const participantId = otherUser.id;

        if (!convMap.has(participantId)) {
            convMap.set(participantId, {
                id: `conv_${participantId}`,
                participant_id: participantId,
                participant_name: otherUser.name,
                participant_role: otherUser.role,
                last_message: m.message,
                last_timestamp: m.created_at,
                unread_count: 0,
                messages: []
            });
        }

        const conv = convMap.get(participantId)!;
        conv.messages.push({
            id: m.id,
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            sender_name: m.sender.name,
            message: m.message,
            timestamp: m.created_at,
            read: m.read
        });

        conv.last_message = m.message;
        conv.last_timestamp = m.created_at;
        if (!isSender && !m.read) {
            conv.unread_count += 1;
        }
    });

    return Array.from(convMap.values()).sort((a, b) =>
        new Date(b.last_timestamp).getTime() - new Date(a.last_timestamp).getTime()
    );
};

export const sendMessage = async (msg: { sender_id: string, receiver_id: string, message: string }) => {
    const { data, error } = await supabase
        .from('messages')
        .insert([msg])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const markMessagesAsRead = async (receiverId: string, senderId: string) => {
    const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', receiverId)
        .eq('sender_id', senderId)
        .eq('read', false);

    if (error) throw error;
};
