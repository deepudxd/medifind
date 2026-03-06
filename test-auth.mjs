import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
    const { data: { session }, error: signinError } = await supabase.auth.signInWithPassword({
        email: 'deepakdev342008@gmail.com',
        password: 'password123'
    });

    if (signinError) {
        console.error("Sign in failed:", signinError.message);
        return;
    }

    if (session?.user) {
        console.log("Logged in:", session.user.email);
        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (error) console.error("Profile fetch error:", error);
        else console.log("Profile data:", profile);
    }
}

testAuth();
