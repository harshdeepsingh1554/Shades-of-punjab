"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    
    // 1. Clean the phone number (remove spaces/dashes)
    const cleanPhone = phone.replace(/\D/g, '');
    const pseudoEmail = `${cleanPhone}@shades.local`;

    const { error } = await supabase.auth.signInWithPassword({ 
      email: pseudoEmail, 
      password 
    });
    
    if (error) {
      alert("Login Failed: " + error.message);
      setLoading(false);
    } else {
      // 2. ADMIN REDIRECT LOGIC
      // List your admin numbers here (Must match the ones in your Admin pages)
      const ALLOWED_ADMINS = [
        "7903379968@shades.local", 
        "9988776655@shades.local", 
        "9123456789@shades.local", 
        "8899776655@shades.local"
      ];

      if (ALLOWED_ADMINS.includes(pseudoEmail)) {
        router.push("/admin"); // Redirect Admins to Dashboard
      } else {
        router.push("/profile"); // Redirect Customers to Profile
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-royal-pattern bg-royal-dark/95 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-royal-maroon rounded-full blur-[128px] opacity-30"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-royal-gold rounded-full blur-[128px] opacity-20"></div>

      {/* Login Card */}
      <div className="bg-royal-cream p-10 rounded-lg shadow-2xl w-full max-w-md border-2 border-royal-gold relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-royal-gold uppercase tracking-[0.3em] text-xs font-bold mb-2">Welcome Back</p>
          <h1 className="text-3xl font-heading font-bold text-royal-maroon">
            Member Login
          </h1>
          <div className="w-16 h-1 bg-royal-gold mx-auto mt-4" />
        </div>
        
        {/* Input Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-royal-dark mb-2 font-bold">Phone Number</label>
            <input 
              type="tel" 
              placeholder="e.g. 9876543210" 
              className="w-full p-4 bg-transparent border border-royal-maroon/30 text-royal-dark focus:border-royal-gold focus:ring-1 focus:ring-royal-gold outline-none transition-all placeholder:text-gray-400 font-body"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-royal-dark mb-2 font-bold">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 bg-transparent border border-royal-maroon/30 text-royal-dark focus:border-royal-gold focus:ring-1 focus:ring-royal-gold outline-none transition-all placeholder:text-gray-400 font-body"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-8 bg-royal-maroon text-royal-gold py-4 font-heading font-bold uppercase tracking-widest hover:bg-royal-dark transition-all duration-300 border border-royal-gold disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
        </button>

        <p className="text-center text-xs text-gray-500 mt-6 tracking-wider">
          New to Shades of Punjab? <Link href="/signup" className="text-royal-maroon font-bold underline hover:text-royal-gold">Create Account</Link>
        </p>
      </div>
    </div>
  );
}