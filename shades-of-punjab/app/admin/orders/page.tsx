"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ExternalLink, CheckCircle, Trash2, ArrowLeft, Phone, Send, Box, Truck, Package, IndianRupee, Loader2, Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Unified Types
type Order = {
  id: number;
  total_amount: number;
  status: string;
  payment_screenshot_url: string;
  user_remarks: string;
  admin_remarks: string;
  created_at: string;
  customer_phone?: string;
  type: 'standard';
};

type CustomRequest = {
  id: number;
  user_id: string;
  reference_image_url: string;
  user_note: string;
  admin_price_quote: number | null;
  payment_proof_url: string | null;
  status: string;
  created_at: string;
  admin_remarks?: string;
  type: 'custom';
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [priceInputs, setPriceInputs] = useState<{[key: number]: string}>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // LIST OF ALLOWED ADMINS
      const ALLOWED_ADMINS = [
        "7903379968@shades.local", 
        "9988776655@shades.local", 
        "9123456789@shades.local", 
        "8899776655@shades.local"
      ];

      if (!user || !user.email || !ALLOWED_ADMINS.includes(user.email)) {
        alert("Restricted Area: Royal Court Members Only.");
        router.push("/");
        return;
      }
      
      await fetchAllData();
      setLoading(false);
    };
    init();
  }, [router]);

  const fetchAllData = async () => {
    // Fetch Standard Orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Fetch Custom Requests
    const { data: requestsData } = await supabase
      .from('custom_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (ordersData) setOrders(ordersData.map(o => ({...o, type: 'standard'})));
    if (requestsData) setCustomRequests(requestsData.map(r => ({...r, type: 'custom'})));
  };

  // --- Handlers for Standard Orders ---
  const updateOrderStatus = async (id: number, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (adminNote && editingId === id) updates.admin_remarks = adminNote;
    
    await supabase.from('orders').update(updates).eq('id', id);
    alert(`Order #${id} marked as ${newStatus}`);
    setEditingId(null); setAdminNote(""); fetchAllData();
  };

  const deleteOrderProof = async (orderId: number, url: string) => {
    if (!confirm("Delete payment proof?")) return;
    try {
        const path = url.split('/').pop(); 
        if (path) await supabase.storage.from('orders').remove([path]);
        await supabase.from('orders').update({ payment_screenshot_url: null }).eq('id', orderId);
        fetchAllData();
    } catch (e: any) {
        alert("Error: " + e.message);
    }
  };

  // --- Handlers for Custom Requests ---
  const sendQuote = async (id: number) => {
    const price = priceInputs[id];
    if (!price) return alert("Enter price");
    
    const { error } = await supabase
      .from('custom_requests')
      .update({ 
        admin_price_quote: parseFloat(price), 
        status: 'quote_sent' 
      })
      .eq('id', id);

    if (!error) {
      alert("Quote sent!");
      fetchAllData();
    }
  };

  const verifyCustomPayment = async (id: number) => {
    await supabase.from('custom_requests').update({ status: 'verified_processing' }).eq('id', id);
    alert("Custom order verified!");
    fetchAllData();
  };

  if (loading) return <div className="min-h-screen bg-royal-maroon bg-blend-multiply flex items-center justify-center text-royal-gold"><Loader2 className="animate-spin w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-royal-maroon bg-[url('/royal-pattern-dark.png')] bg-blend-multiply p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8 border-b border-royal-gold/30 pb-4">
           <Link href="/admin"><ArrowLeft className="text-royal-gold hover:scale-110 transition" /></Link>
           <h1 className="text-3xl font-heading font-bold text-royal-gold tracking-wide">Royal Orders & Bespoke</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: STANDARD ORDERS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-royal-gold/10 pb-2 mb-4">
              <Package className="text-royal-gold" />
              <h2 className="text-xl font-heading text-royal-gold">Standard Orders</h2>
            </div>

            {orders.length === 0 && <p className="text-royal-gold/40 italic">No active orders.</p>}

            {orders.map((order) => (
              <div key={order.id} className="bg-[#1a1510] border border-royal-gold/30 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${order.status === 'verified' ? 'bg-green-500' : order.status === 'shipped' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                
                <div className="flex justify-between items-start mb-2 pl-3">
                  <div>
                    <p className="font-bold text-royal-cream text-lg">Order #{order.id}</p>
                    <p className="text-xs text-royal-gold/60 font-mono">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-royal-gold font-bold text-xl">₹{order.total_amount}</p>
                </div>

                <div className="pl-3 mb-4 space-y-3">
                   <div className="flex items-center gap-2 text-sm text-royal-cream/80 bg-black/20 p-2 rounded">
                      <Phone size={14} className="text-royal-gold" /> 
                      {order.customer_phone || <span className="text-gray-500 italic">No Phone</span>}
                   </div>
                   
                   {order.payment_screenshot_url ? (
                     <div className="flex items-center gap-4">
                       <a href={order.payment_screenshot_url} target="_blank" className="text-xs text-blue-400 underline flex items-center gap-1">
                         <ExternalLink size={12} /> View Payment
                       </a>
                       <button onClick={() => deleteOrderProof(order.id, order.payment_screenshot_url)} className="text-[10px] text-red-400 hover:text-red-300">
                         Delete Image
                       </button>
                     </div>
                   ) : <span className="text-xs text-red-500 italic">Payment Proof Missing/Deleted</span>}

                   {order.user_remarks && (
                     <p className="text-xs text-royal-cream/60 italic border-l-2 border-royal-gold/20 pl-2">"{order.user_remarks}"</p>
                   )}
                </div>

                {/* Status Actions */}
                <div className="pl-3 grid grid-cols-2 gap-2">
                  <button onClick={() => updateOrderStatus(order.id, 'verified')} className="bg-green-900/30 text-green-400 border border-green-500/30 px-2 py-1.5 rounded text-xs hover:bg-green-900/50">Verify</button>
                  <button onClick={() => updateOrderStatus(order.id, 'packed')} className="bg-purple-900/30 text-purple-400 border border-purple-500/30 px-2 py-1.5 rounded text-xs hover:bg-purple-900/50">Pack</button>
                  <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="bg-blue-900/30 text-blue-400 border border-blue-500/30 px-2 py-1.5 rounded text-xs hover:bg-blue-900/50">Ship</button>
                  <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 px-2 py-1.5 rounded text-xs hover:bg-yellow-900/50">Deliver</button>
                </div>

                {/* Messaging */}
                <div className="pl-3 mt-3 pt-3 border-t border-royal-gold/10">
                  <button onClick={() => setEditingId(editingId === order.id ? null : order.id)} className="text-xs text-royal-gold underline hover:text-white mb-2 block">
                    {editingId === order.id ? "Cancel" : "Send Message / Reject"}
                  </button>
                  
                  {editingId === order.id && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <input 
                        type="text" 
                        placeholder="Message..." 
                        className="w-full bg-black/50 border border-royal-gold/30 text-royal-cream text-xs p-2 rounded mb-2 outline-none focus:border-royal-gold"
                        value={adminNote} 
                        onChange={(e) => setAdminNote(e.target.value)} 
                      />
                      <div className="flex gap-2">
                         <button onClick={() => updateOrderStatus(order.id, order.status)} className="flex-1 bg-royal-gold text-black text-xs py-1 rounded font-bold hover:bg-white flex items-center justify-center gap-1">
                           <Send size={10} /> Send
                         </button>
                         <button onClick={() => updateOrderStatus(order.id, 'rejected')} className="flex-1 bg-red-900/50 text-red-400 border border-red-500/30 text-xs py-1 rounded hover:bg-red-900">
                           Reject
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: CUSTOM REQUESTS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-royal-gold/10 pb-2 mb-4">
              <Camera className="text-royal-gold" />
              <h2 className="text-xl font-heading text-royal-gold">Custom Requests</h2>
            </div>

            {customRequests.length === 0 && <p className="text-royal-gold/40 italic">No bespoke requests.</p>}

            {customRequests.map((req) => (
              <div key={req.id} className="bg-[#1a1510] border border-royal-gold/30 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row gap-4">
                
                {/* Image Preview */}
                <div className="w-full sm:w-32 aspect-square bg-black rounded border border-royal-gold/20 flex-shrink-0 overflow-hidden relative group">
                  <img src={req.reference_image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                  <a href={req.reference_image_url} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition text-royal-gold">
                    <ExternalLink size={20} />
                  </a>
                </div>

                {/* Details & Actions */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-royal-cream text-sm">Request #{req.id}</p>
                      <span className="text-[10px] text-royal-gold uppercase border border-royal-gold/20 px-1.5 py-0.5 rounded bg-royal-gold/5">
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-royal-cream/60 italic my-2 bg-black/20 p-2 rounded">"{req.user_note || 'No notes'}"</p>
                  </div>

                  {/* Pricing Action */}
                  <div className="mt-2 pt-2 border-t border-royal-gold/10">
                    {!req.admin_price_quote ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-black/40 border border-royal-gold/30 rounded px-2 w-32">
                          <IndianRupee size={12} className="text-royal-gold/50" />
                          <input 
                            type="number" 
                            placeholder="Price" 
                            className="bg-transparent border-none outline-none text-royal-cream text-xs p-1.5 w-full"
                            onChange={(e) => setPriceInputs({...priceInputs, [req.id]: e.target.value})}
                          />
                        </div>
                        <button onClick={() => sendQuote(req.id)} className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded hover:shadow-lg hover:shadow-royal-gold/20 hover:scale-105 transition-all duration-300 uppercase tracking-wider ">
                          Send Quote
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-royal-gold flex items-center gap-1">
                          Quote Sent: <IndianRupee size={14}/> {req.admin_price_quote}
                        </p>
                        
                        {req.payment_proof_url && req.status !== 'verified_processing' ? (
                          <div className="mt-2 bg-green-900/10 p-2 rounded border border-green-500/20">
                             <div className="flex justify-between items-center mb-2">
                               <span className="text-[10px] text-green-400 font-bold uppercase">Payment Uploaded</span>
                               <a href={req.payment_proof_url} target="_blank" className="text-xs text-blue-400 underline">View</a>
                             </div>
                             <button onClick={() => verifyCustomPayment(req.id)} className="w-full bg-green-600 hover:bg-green-500 text-white text-xs py-1.5 rounded font-bold transition">
                               Verify & Process
                             </button>
                          </div>
                        ) : req.status === 'verified_processing' ? (
                          <p className="text-xs text-green-500 mt-1 font-bold flex items-center gap-1"><CheckCircle size={12}/> Paid & Verified</p>
                        ) : (
                          <p className="text-[10px] text-yellow-500 mt-1 italic">Waiting for customer payment...</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}