"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Package, Clock, CheckCircle, Truck, Gift, MessageSquare, LogOut, Loader2, Camera, Upload, IndianRupee, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Types
type Order = {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  admin_remarks: string;
  type: 'standard';
};

type CustomRequest = {
  id: number;
  reference_image_url: string;
  admin_price_quote: number | null;
  payment_proof_url: string | null;
  status: string;
  user_note: string;
  created_at: string;
  type: 'custom';
};

export default function ProfilePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUserEmail(user.email || "");
      fetchData(user.id);
    }
  };

  const fetchData = async (userId: string) => {
    setLoading(true);
    // 1. Fetch Normal Orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // 2. Fetch Custom Requests
    const { data: requestsData } = await supabase
      .from('custom_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersData) setOrders(ordersData.map(o => ({...o, type: 'standard'})));
    if (requestsData) setCustomRequests(requestsData.map(r => ({...r, type: 'custom'})));
    setLoading(false);
  };

  const handleDeleteRequest = async (id: number) => {
    if (!confirm("Are you sure you want to decline this quote and delete the request?")) return;
    
    const { error } = await supabase.from('custom_requests').delete().eq('id', id);
    if (error) {
        alert("Error deleting: " + error.message);
    } else {
        alert("Request removed.");
        checkUser(); // Refresh data
    }
  };

  const handleAddToCart = (req: CustomRequest) => {
      if (!req.admin_price_quote) return;
      
      const customItem = {
          id: 900000 + req.id, // Offset ID to avoid collision with standard products
          name: `Bespoke Design #${req.id}`,
          price: req.admin_price_quote,
          image_url: req.reference_image_url,
          quantity: 1,
          category: 'Custom Request' 
      };
      
      addToCart(customItem);
      
      // Remove from list immediately to show it has "moved"
      setCustomRequests(prev => prev.filter(r => r.id !== req.id));
      alert("Added to Cart! Proceed to checkout to finalize.");
  };

  const handlePaymentUpload = async (e: React.ChangeEvent<HTMLInputElement>, requestId: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingId(requestId);
    
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `custom_pay_${Date.now()}.${fileExt}`;

      // Upload to 'orders' bucket
      const { error: uploadError } = await supabase.storage.from('orders').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('orders').getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('custom_requests')
        .update({ 
          payment_proof_url: publicUrl,
          status: 'payment_uploaded'
        })
        .eq('id', requestId);

      if (dbError) throw dbError;
      alert("Payment proof uploaded! The Royal Court will verify shortly.");
      
      // Refresh Data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) fetchData(user.id);

    } catch (error: any) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Helper to get status Icon and Color
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified': case 'verified_processing': return { icon: <CheckCircle size={16} />, color: 'text-green-400 bg-green-900/30 border-green-500/50' };
      case 'packed': return { icon: <Gift size={16} />, color: 'text-purple-400 bg-purple-900/30 border-purple-500/50' };
      case 'shipped': return { icon: <Truck size={16} />, color: 'text-blue-400 bg-blue-900/30 border-blue-500/50' };
      case 'delivered': return { icon: <Package size={16} />, color: 'text-royal-gold bg-royal-gold/20 border-royal-gold' };
      case 'rejected': return { icon: <Clock size={16} />, color: 'text-red-400 bg-red-900/30 border-red-500/50' };
      case 'payment_uploaded': return { icon: <Clock size={16} />, color: 'text-blue-400 bg-blue-900/30 border-blue-500/50' };
      case 'quote_sent': return { icon: <MessageSquare size={16} />, color: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50' };
      default: return { icon: <Clock size={16} />, color: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50' };
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-royal-maroon bg-blend-multiply flex items-center justify-center text-royal-gold">
      <Loader2 className="animate-spin w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-royal-maroon bg-[url('/royal-pattern-dark.png')] bg-blend-multiply py-12 px-4 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-royal-gold rounded-full blur-[180px] opacity-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-[#1a1510] p-6 rounded-xl border border-royal-gold/20 shadow-xl">
          <div>
            <p className="text-royal-gold/60 uppercase tracking-[0.2em] text-xs font-bold mb-2">Authenticated Member</p>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-royal-cream">{userEmail}</h1>
          </div>
          <button onClick={handleLogout} className="mt-4 md:mt-0 flex items-center gap-2 text-red-400 border border-red-500/30 px-6 py-2 hover:bg-red-900/20 rounded-full text-xs uppercase tracking-widest">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* --- SECTION 1: CUSTOM REQUESTS --- */}
        {customRequests.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-heading text-royal-gold mb-6 flex items-center gap-3">
              <Camera className="text-royal-gold/70" /> Bespoke Requests
            </h2>
            <div className="grid gap-6">
              {customRequests.map((req) => {
                const statusStyle = getStatusStyle(req.status);
                return (
                  <div key={req.id} className="bg-[#1a1510] p-6 rounded-xl border border-royal-gold/30 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                    {/* Image */}
                    <div className="w-full md:w-32 aspect-square bg-black rounded-lg overflow-hidden border border-royal-gold/20">
                      <img src={req.reference_image_url} className="w-full h-full object-cover opacity-80" alt="Request" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-bold text-royal-cream text-lg">Custom Design #{req.id}</h3>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${statusStyle.color}`}>
                          {statusStyle.icon} {req.status.replace('_', ' ')}
                        </div>
                      </div>
                      <p className="text-royal-cream/60 text-sm mb-4">"{req.user_note}"</p>

                      {/* Action Area */}
                      <div className="bg-black/30 p-4 rounded border border-royal-gold/10">
                        {req.admin_price_quote ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="text-[10px] text-royal-gold uppercase tracking-widest">Royal Quote</p>
                              <p className="text-2xl font-bold text-green-400 flex items-center">
                                <IndianRupee size={20} />{req.admin_price_quote}
                              </p>
                            </div>

                            {/* Action Buttons: Add to Cart or Delete */}
                            <div className="flex items-center gap-3">
                               <button 
                                 onClick={() => handleAddToCart(req)}
                                 className="bg-amber-500 text-black hover:bg-amber-400 font-bold px-6 py-2 rounded shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 uppercase text-xs tracking-wider border border-amber-600"
                               >
                                 <ShoppingCart size={16} /> Add to Cart
                               </button>
                               
                               <button 
                                 onClick={() => handleDeleteRequest(req.id)}
                                 className="text-red-400 hover:text-red-300 border border-red-500/30 p-2 rounded hover:bg-red-900/20 transition"
                                 title="Decline Quote & Delete"
                               >
                                 <Trash2 size={18} />
                               </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-yellow-500 text-sm italic">Waiting for price quote from the Royal Court...</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- SECTION 2: ORDER HISTORY --- */}
        <h2 className="text-xl font-heading text-royal-gold mb-6 flex items-center gap-3">
          <Package className="text-royal-gold/70" /> Standard Orders
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1510] border border-royal-gold/20 rounded-xl shadow-lg">
            <p className="text-royal-cream/50 font-body">You have not placed any orders yet.</p>
            <button onClick={() => router.push('/shop')} className="mt-4 text-royal-gold font-bold hover:underline uppercase tracking-widest text-xs">Browse Collection</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              return (
                <div key={order.id} className="bg-[#1a1510] p-6 rounded-xl shadow-lg border border-royal-gold/20 hover:border-royal-gold/50 transition-all duration-300">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-heading text-xl font-bold text-royal-cream">Order #{order.id}</span>
                        <span className="text-[10px] text-royal-cream/40 font-mono border border-royal-gold/10 px-2 py-0.5 rounded">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-royal-cream/70 text-sm">Total Tribute: <span className="font-bold text-royal-gold">₹{order.total_amount}</span></p>
                      {order.admin_remarks && (
                        <div className="mt-4 bg-royal-gold/10 border-l-2 border-royal-gold p-3 rounded-r-md">
                          <p className="text-[10px] text-royal-gold uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                            <MessageSquare size={10} /> Royal Decree
                          </p>
                          <p className="text-royal-cream text-sm italic">"{order.admin_remarks}"</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${statusStyle.color}`}>
                        {statusStyle.icon} {order.status}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}