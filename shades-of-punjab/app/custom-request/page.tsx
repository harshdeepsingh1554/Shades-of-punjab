"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, Loader2, Camera, ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomRequest() {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();

  // Check Authentication on Load
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login to submit a royal request.");
        router.push("/login");
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async () => {
    if (!image) return alert("Please upload a screenshot of the design.");
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // 1. Upload Image to 'orders' Bucket
      const fileExt = image.name.split('.').pop();
      const fileName = `request_${Date.now()}_${user.id}.${fileExt}`;
      const filePath = `${fileName}`; // Keep it root or use folder structure

      const { error: uploadError } = await supabase.storage
        .from('orders')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('orders')
        .getPublicUrl(filePath);

      // 3. Save Request to DB
      const { error: dbError } = await supabase
        .from('custom_requests')
        .insert([{ 
          user_id: user.id,
          reference_image_url: publicUrl, 
          user_note: note,
          status: 'pending_quote' // Initial status
        }]);

      if (dbError) throw dbError;

      alert("Request sent to the Royal Court! Check your profile for the price quote.");
      router.push("/profile"); // User goes to profile to wait for Admin response

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-royal-maroon bg-[url('/royal-pattern-dark.png')] bg-blend-multiply flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-royal-gold rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-royal-maroon rounded-full blur-[150px] opacity-30 pointer-events-none"></div>

      <div className="max-w-xl w-full bg-[#1a1510] p-8 rounded-2xl shadow-2xl border-2 border-royal-gold relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-royal-gold/30 pb-4">
           <Link href="/" className="text-royal-gold/70 hover:text-royal-gold transition hover:scale-110"><ArrowLeft size={24} /></Link>
           <div>
             <p className="text-royal-gold text-[10px] uppercase tracking-[0.2em] font-bold">Bespoke Service</p>
             <h1 className="text-2xl font-heading font-bold text-royal-cream">Custom Order Request</h1>
           </div>
        </div>

        <div className="space-y-6">
          
          {/* Note Input */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-royal-gold/70 mb-2 font-bold ml-1">Your Vision</label>
            <div className="border border-royal-gold/30 rounded-lg p-3 bg-black/20 focus-within:border-royal-gold transition-colors">
              <textarea 
                className="w-full bg-transparent outline-none font-body text-royal-cream placeholder:text-royal-gold/30 resize-none h-24"
                placeholder="Describe the fabric, color, size, or any specific details..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-royal-gold/70 mb-2 font-bold ml-1">Reference Image (Instagram/Pinterest)</label>
            <div className="border-2 border-dashed border-royal-gold/40 rounded-xl p-8 text-center hover:bg-royal-gold/5 hover:border-royal-gold transition-all duration-300 cursor-pointer relative group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={loading}
              />
              {image ? (
                <div className="flex flex-col items-center">
                  <div className="w-full h-48 bg-black rounded-lg overflow-hidden mb-2 border border-royal-gold/20">
                    <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover opacity-80" />
                  </div>
                  <span className="text-royal-gold text-xs font-bold truncate max-w-full">{image.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-royal-gold/60 group-hover:text-royal-gold transition-colors">
                  <Camera className="w-10 h-10 mb-3" />
                  <span className="text-xs uppercase tracking-widest font-bold">Tap to Upload Screenshot</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-royal-maroon to-[#3d0a15] text-royal-gold py-4 font-heading font-bold uppercase tracking-[0.2em] hover:from-royal-gold hover:to-[#8c6d36] hover:text-[#1a1510] transition-all duration-500 rounded-lg shadow-lg border border-royal-gold/50 flex justify-center items-center gap-2 disabled:opacity-70 mt-4 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Send Request to Admin"} <Send size={16} />
            </span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-royal-gold/40 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
          </button>

          <p className="text-[10px] text-royal-gold/40 text-center mt-4 uppercase tracking-widest">
            We will review and provide a price quote shortly.
          </p>

        </div>
      </div>
    </div>
  );
}