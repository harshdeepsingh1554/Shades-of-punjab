"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    // 1. Sanitize Phone: Remove spaces, dashes, or brackets to prevent errors
    const cleanPhone = phone.replace(/\D/g, '');

    if (!fullName || !cleanPhone || !password) {
      alert("Please fill in all fields properly.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // ZERO-BUDGET TRICK:
    // We convert the phone number to a pseudo-email to use Supabase's free authentication
    const pseudoEmail = `${cleanPhone}@shades.local`;

    const { data, error } = await supabase.auth.signUp({ 
      email: pseudoEmail, 
      password,
      options: {
        data: {
          full_name: fullName, 
          phone_number: cleanPhone,
        }
      }
    });
    
    if (error) {
      alert("Signup Failed: " + error.message);
      setLoading(false);
    } else {
      // Check if Auto-Login worked (Requires 'Confirm Email' to be OFF in Supabase)
      if (data.session) {
        alert("Welcome to the Royal Family!");
        router.push("/profile"); 
      } else {
        alert("Account created! Please log in.");
        router.push("/login"); 
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-royal-pattern bg-royal-dark/95 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-royal-maroon rounded-full blur-[128px] opacity-30"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-royal-gold rounded-full blur-[128px] opacity-20"></div>

      {/* Signup Card */}
      <div className="bg-royal-cream p-10 rounded-lg shadow-2xl w-full max-w-md border-2 border-royal-gold relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-royal-gold uppercase tracking-[0.3em] text-xs font-bold mb-2">Join The Legacy</p>
          <h1 className="text-3xl font-heading font-bold text-royal-maroon">
            Create Account
          </h1>
          <div className="w-16 h-1 bg-royal-gold mx-auto mt-4" />
        </div>
        
        {/* Input Fields */}
        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-royal-dark mb-2 font-bold">Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Maharani Jindan" 
              className="w-full p-4 bg-transparent border border-royal-maroon/30 text-royal-dark focus:border-royal-gold focus:ring-1 focus:ring-royal-gold outline-none transition-all placeholder:text-gray-400 font-body"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-royal-dark mb-2 font-bold">Phone Number</label>
            <input 
              type="tel" 
              placeholder="e.g. 9876543210" 
              className="w-full p-4 bg-transparent border border-royal-maroon/30 text-royal-dark focus:border-royal-gold focus:ring-1 focus:ring-royal-gold outline-none transition-all placeholder:text-gray-400 font-body"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          {/* Password Input */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-royal-dark mb-2 font-bold">Password</label>
            <input 
              type="password" 
              placeholder="Min 6 characters" 
              className="w-full p-4 bg-transparent border border-royal-maroon/30 text-royal-dark focus:border-royal-gold focus:ring-1 focus:ring-royal-gold outline-none transition-all placeholder:text-gray-400 font-body"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleSignup}
          disabled={loading}
          className="w-full mt-8 bg-royal-maroon text-royal-gold py-4 font-heading font-bold uppercase tracking-widest hover:bg-royal-dark transition-all duration-300 border border-royal-gold disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
        </button>

        <p className="text-center text-xs text-gray-500 mt-6 tracking-wider">
          Already a member? <Link href="/login" className="text-royal-maroon font-bold underline hover:text-royal-gold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}