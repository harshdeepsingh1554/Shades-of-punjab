"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { Trash2, Upload, CheckCircle, Loader2, QrCode, ArrowLeft, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [userRemarks, setUserRemarks] = useState("");
  const router = useRouter();

  // 1. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  // 2. The Checkout Logic (Upload -> Save Order)
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    if (!paymentProof) return alert("Please upload a payment screenshot first.");

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login to place an order.");
        router.push("/login");
        return;
      }

      // Extract Phone from pseudo-email
      const phone = user.email?.split('@')[0] || "Unknown";

      // Step A: Upload Image to 'orders' Bucket
      const fileExt = paymentProof.name.split('.').pop();
      const fileName = `order_${Date.now()}_${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('orders')
        .upload(filePath, paymentProof);

      if (uploadError) throw uploadError;

      // Step B: Get the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('orders')
        .getPublicUrl(filePath);

      // Step C: Create Order in Database
      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_amount: cartTotal,
          status: 'pending',
          payment_screenshot_url: publicUrl,
          user_remarks: userRemarks,
          customer_phone: phone,
        }]);

      if (orderError) throw orderError;

      // Step D: Cleanup
      clearCart();
      alert("Order placed successfully! We will verify your payment shortly.");
      router.push('/profile'); 

    } catch (error: any) {
      alert("Checkout failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-royal-maroon bg-[url('/royal-pattern-dark.png')] bg-blend-multiply flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-royal-gold rounded-full blur-[180px] opacity-20 pointer-events-none"></div>
        
        <h2 className="text-3xl font-heading text-royal-gold mb-2 drop-shadow-md">Your Treasury is Empty</h2>
        <p className="text-royal-cream/60 mb-8 font-body">Go add some royal attire to your collection.</p>
        <Link href="/shop" className="bg-gradient-to-r from-royal-maroon to-[#3d0a15] border border-royal-gold/50 text-royal-gold px-8 py-3 font-heading uppercase tracking-widest text-xs hover:from-royal-gold hover:to-[#8c6d36] hover:text-[#1a1510] transition-all duration-300 shadow-lg">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-royal-maroon bg-[url('/royal-pattern-dark.png')] bg-blend-multiply py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-royal-gold rounded-full blur-[180px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-royal-maroon rounded-full blur-[180px] opacity-20 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        
        {/* LEFT SIDE: Cart Items */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
             <Link href="/shop" className="text-royal-gold/70 hover:text-royal-gold transition hover:scale-110"><ArrowLeft size={24} /></Link>
             <h1 className="text-3xl font-heading font-bold text-royal-gold tracking-wide drop-shadow-md">Royal Cart</h1>
          </div>
          
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-[#1a1510] border border-royal-gold/30 p-4 rounded-xl shadow-lg relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-royal-gold/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
              
              <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-lg border border-royal-gold/20" />
              
              <div className="flex-1">
                <h3 className="font-heading font-bold text-royal-cream text-lg mb-1">{item.name}</h3>
                <p className="text-royal-gold/60 text-xs uppercase tracking-wider mb-3">Unit Price: ₹{item.price}</p>
                
                {/* Quantity Controls: Increase / Decrease */}
                <div className="flex items-center gap-3 bg-black/30 w-fit p-1 rounded-full border border-royal-gold/20">
                  <button 
                    onClick={() => decreaseQuantity(item.id)}
                    className="w-8 h-8 rounded-full bg-royal-maroon/50 text-royal-gold flex items-center justify-center hover:bg-royal-gold hover:text-black transition-colors"
                    title="Decrease Quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-royal-cream font-bold w-6 text-center text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-8 h-8 rounded-full bg-royal-maroon/50 text-royal-gold flex items-center justify-center hover:bg-royal-gold hover:text-black transition-colors"
                    title="Increase Quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="text-right flex flex-col justify-between h-24">
                <p className="font-bold text-royal-gold text-lg">₹{item.price * item.quantity}</p>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-400 text-xs flex items-center gap-1 ml-auto uppercase tracking-wider transition-colors hover:bg-red-900/20 px-2 py-1 rounded"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
          
          {/* User Remarks */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-royal-gold/70 mb-2 font-bold ml-1">Royal Instructions</label>
            <textarea
              placeholder="Special instructions for the royal tailors? (Optional)"
              className="w-full p-4 border border-royal-gold/30 rounded-xl mt-1 focus:border-royal-gold outline-none bg-[#1a1510] font-body placeholder:text-royal-gold/30 text-royal-cream transition-all"
              rows={3}
              value={userRemarks}
              onChange={(e) => setUserRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT SIDE: Payment & Checkout */}
        <div className="bg-[#1a1510] p-8 rounded-xl h-fit border-2 border-royal-gold/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-royal-gold to-transparent" />
          
          <h2 className="text-2xl font-heading font-bold text-royal-gold mb-6 border-b border-royal-gold/20 pb-4 tracking-wider">Checkout</h2>
          
          <div className="flex justify-between mb-4 text-lg font-body text-royal-cream/80">
            <span>Subtotal</span>
            <span className="font-bold text-royal-gold">₹{cartTotal}</span>
          </div>
          <div className="flex justify-between mb-8 text-xl font-heading font-bold text-royal-cream border-t border-royal-gold/20 pt-4">
            <span>Total Tribute</span>
            <span className="text-royal-gold">₹{cartTotal}</span>
          </div>

          <div className="bg-black/40 p-6 rounded-xl border border-dashed border-royal-gold/40 text-center mb-8 relative group hover:border-royal-gold transition-colors">
            <div className="bg-white p-2 w-48 h-48 mx-auto mb-4 flex items-center justify-center rounded-lg shadow-inner">
               <QrCode size={160} className="text-black" />
            </div>
            <p className="text-sm font-bold text-royal-gold uppercase tracking-widest mb-1">Scan to Pay</p>
            <p className="text-xs text-gray-400 font-mono">UPI: shadesofpunjab@upi</p>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-royal-gold uppercase tracking-widest mb-3">Attach Payment Proof <span className="text-red-500">*</span></label>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-full file:border-0
                  file:text-xs file:font-bold file:uppercase file:tracking-widest
                  file:bg-royal-gold file:text-[#1a1510]
                  hover:file:bg-royal-cream
                  cursor-pointer
                  border border-royal-gold/30 rounded-lg p-1 bg-black/20"
              />
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-gradient-to-r from-royal-maroon to-[#3d0a15] border border-royal-gold/50 text-royal-gold py-4 rounded-lg font-heading font-bold uppercase tracking-[0.2em] hover:from-royal-gold hover:to-[#8c6d36] hover:text-[#1a1510] transition-all duration-500 flex justify-center items-center gap-2 disabled:opacity-70 shadow-lg group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle size={20} />}
              {loading ? "Verifying..." : "Confirm Order"}
            </span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-royal-gold/40 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
          </button>
          
          <p className="text-[10px] text-royal-gold/40 text-center mt-6 uppercase tracking-[0.2em]">
            Secure Royal Transaction
          </p>
        </div>
      </div>
    </div>
  );
}