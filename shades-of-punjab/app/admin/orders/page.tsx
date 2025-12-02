"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ExternalLink, CheckCircle, Trash2, ArrowLeft, Phone, Send, Box, Truck, Package, IndianRupee, Loader2, Camera, AlertCircle } from "lucide-react";
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

  if (loading) return <div className="min-h-screen bg-[#0f0505] flex items-center justify-center text-[#c5a059]"><Loader2 className="animate-spin w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-[#0f0505] pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10 border-b border-[#c5a059]/30 pb-6">
           <Link href="/admin" className="text-[#c5a059] hover:text-white transition flex items-center gap-2">
             <ArrowLeft size={24} /> <span className="md:hidden text-sm font-bold uppercase tracking-widest">Back</span>
           </Link>
           <div>
             <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#c5a059] tracking-wide">Royal Orders</h1>
             <p className="text-xs text-white/50 mt-1">Manage standard orders and bespoke requests</p>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          
          {/* === LEFT COLUMN: STANDARD ORDERS === */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[#c5a059]/20 pb-3">
              <Package className="text-[#c5a059]" />
              <h2 className="text-xl font-heading text-white">Standard Orders</h2>
              <span className="bg-[#c5a059] text-black text-xs font-bold px-2 py-0.5 rounded-full">{orders.length}</span>
            </div>

            {orders.length === 0 && <p className="text-white/30 italic text-center py-10">No active orders.</p>}

            {orders.map((order) => (
              <div key={order.id} className="bg-[#1a1510] border border-[#c5a059]/30 rounded-xl overflow-hidden shadow-lg flex flex-col relative">
                
                {/* Top Status Bar */}
                <div className={`w-full py-2 px-4 text-center text-xs font-bold uppercase tracking-widest
                  ${order.status === 'delivered' ? 'bg-[#c5a059] text-black' : 'bg-[#2a1010] text-red-400 border-b border-red-900'}`}>
                  {order.status === 'delivered' ? '✅ Completed / Delivered' : `⚠️ Status: ${order.status}`}
                </div>
                
                <div className="p-5 flex flex-col gap-4">
                  {/* Order Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-lg">Order #{order.id}</p>
                      <p className="text-xs text-[#c5a059]/80 font-mono mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-[#c5a059] font-bold text-2xl">₹{order.total_amount}</p>
                  </div>

                  {/* Customer Info Box */}
                  <div className="bg-black/30 rounded-lg p-3 space-y-2 border border-[#c5a059]/10">
                     <div className="flex items-center gap-2 text-sm text-white/90">
                        <Phone size={14} className="text-[#c5a059]" /> 
                        {order.customer_phone || <span className="text-white/40 italic">No Phone</span>}
                     </div>
                     
                     <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
                        {order.payment_screenshot_url ? (
                           <div className="flex items-center gap-3">
                             <a href={order.payment_screenshot_url} target="_blank" className="bg-blue-900/30 text-blue-300 text-xs px-3 py-1.5 rounded border border-blue-500/30 flex items-center gap-1 hover:bg-blue-900/50">
                               <ExternalLink size={12} /> View Proof
                             </a>
                             <button onClick={() => deleteOrderProof(order.id, order.payment_screenshot_url)} className="text-xs text-red-400 hover:text-red-300 border-b border-red-900/50">
                               Delete Image
                             </button>
                           </div>
                        ) : <span className="text-xs text-red-500 italic bg-red-900/10 px-2 py-1 rounded">No Proof Uploaded</span>}
                     </div>

                     {order.user_remarks && (
                       <div className="pt-2 border-t border-white/5">
                         <p className="text-[10px] text-[#c5a059] uppercase tracking-wider mb-1">Customer Note:</p>
                         <p className="text-xs text-white/70 italic">"{order.user_remarks}"</p>
                       </div>
                     )}
                  </div>

                  {/* Action Grid - Mobile Friendly */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={() => updateOrderStatus(order.id, 'verified')} className="bg-green-900/40 text-green-400 border border-green-600/30 py-3 rounded-lg text-xs font-bold hover:bg-green-900/60 transition">VERIFY</button>
                    <button onClick={() => updateOrderStatus(order.id, 'packed')} className="bg-purple-900/40 text-purple-400 border border-purple-600/30 py-3 rounded-lg text-xs font-bold hover:bg-purple-900/60 transition">PACK</button>
                    <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="bg-blue-900/40 text-blue-400 border border-blue-600/30 py-3 rounded-lg text-xs font-bold hover:bg-blue-900/60 transition">SHIP</button>
                    <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-[#c5a059] text-black border border-[#c5a059] py-3 rounded-lg text-xs font-bold hover:bg-white transition">DELIVER</button>
                  </div>

                  {/* Messaging Accordion */}
                  <div className="mt-2">
                    <button onClick={() => setEditingId(editingId === order.id ? null : order.id)} className="w-full text-center text-xs text-[#c5a059] border border-[#c5a059]/30 rounded py-2 hover:bg-[#c5a059]/10 transition">
                      {editingId === order.id ? "Close Message Box" : "Send Message / Reject Order"}
                    </button>
                    
                    {editingId === order.id && (
                      <div className="mt-3 bg-black/40 p-3 rounded-lg animate-in fade-in slide-in-from-top-2 border border-white/10">
                        <input 
                          type="text" 
                          placeholder="Type message for customer..." 
                          className="w-full bg-[#1a1510] border border-white/20 text-white text-sm p-3 rounded mb-3 outline-none focus:border-[#c5a059]"
                          value={adminNote} 
                          onChange={(e) => setAdminNote(e.target.value)} 
                        />
                        <div className="flex gap-2">
                           <button onClick={() => updateOrderStatus(order.id, order.status)} className="flex-1 bg-white text-black py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-200">
                             <Send size={14} /> Send Note
                           </button>
                           <button onClick={() => updateOrderStatus(order.id, 'rejected')} className="flex-1 bg-red-600 text-white py-2 rounded text-xs font-bold hover:bg-red-700">
                             REJECT ORDER
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* === RIGHT COLUMN: CUSTOM REQUESTS === */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[#c5a059]/20 pb-3">
              <Camera className="text-[#c5a059]" />
              <h2 className="text-xl font-heading text-white">Custom Requests</h2>
              <span className="bg-[#c5a059] text-black text-xs font-bold px-2 py-0.5 rounded-full">{customRequests.length}</span>
            </div>

            {customRequests.length === 0 && <p className="text-white/30 italic text-center py-10">No bespoke requests.</p>}

            {customRequests.map((req) => (
              <div key={req.id} className="bg-[#1a1510] border border-[#c5a059]/30 rounded-xl overflow-hidden shadow-lg p-5 flex flex-col gap-4">
                
                {/* Header with Status */}
                <div className="flex justify-between items-start border-b border-white/5 pb-3">
                  <p className="font-bold text-white text-sm">Request #{req.id}</p>
                  <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold border
                    ${req.status === 'converted_to_order' 
                      ? 'text-green-400 border-green-500/30 bg-green-900/10' 
                      : 'text-[#c5a059] border-[#c5a059]/20 bg-[#c5a059]/5'
                    }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Image Preview */}
                  <div className="w-full sm:w-32 aspect-square bg-black rounded-lg border border-[#c5a059]/20 overflow-hidden relative group">
                    <img src={req.reference_image_url} className="w-full h-full object-cover" />
                    <a href={req.reference_image_url} target="_blank" className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-300">
                      <ExternalLink size={24} />
                      <span className="text-xs font-bold mt-1">OPEN</span>
                    </a>
                  </div>

                  {/* Details & Actions */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#c5a059] uppercase tracking-widest mb-1">Customer Vision:</p>
                      <p className="text-sm text-white/80 italic mb-4 bg-black/20 p-2 rounded border border-white/5">"{req.user_note || 'No notes'}"</p>
                    </div>

                    {/* Pricing Action */}
                    <div className="mt-2">
                      {!req.admin_price_quote ? (
                        // STEP 1: ADMIN SENDS QUOTE
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center bg-black border border-[#c5a059]/50 rounded px-3 py-1">
                            <IndianRupee size={14} className="text-[#c5a059]" />
                            <input 
                              type="number" 
                              placeholder="Enter Quote Amount" 
                              className="bg-transparent border-none outline-none text-white text-sm p-2 w-full placeholder:text-white/30"
                              onChange={(e) => setPriceInputs({...priceInputs, [req.id]: e.target.value})}
                            />
                          </div>
                          <button 
                            onClick={() => sendQuote(req.id)} 
                            className="bg-[#c5a059] text-black text-xs font-bold py-3 rounded hover:bg-white transition uppercase tracking-widest w-full"
                          >
                            Send Quote
                          </button>
                        </div>
                      ) : (
                        // STEP 2: VERIFY PAYMENT
                        <div className="bg-[#c5a059]/5 border border-[#c5a059]/20 rounded p-3">
                          <p className="text-sm font-bold text-[#c5a059] flex items-center gap-1 mb-3">
                            Price Quoted: <span className="text-white">₹{req.admin_price_quote}</span>
                          </p>
                          
                          {req.payment_proof_url && req.status !== 'verified_processing' && req.status !== 'converted_to_order' ? (
                            <div className="space-y-2">
                               <div className="flex justify-between items-center bg-green-900/20 p-2 rounded border border-green-500/20">
                                 <span className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-1"><AlertCircle size={10}/> Payment Received</span>
                                 <a href={req.payment_proof_url} target="_blank" className="text-xs text-blue-300 underline font-bold">Check Proof</a>
                               </div>
                               <button onClick={() => verifyCustomPayment(req.id)} className="w-full bg-green-600 hover:bg-green-500 text-white text-xs py-3 rounded font-bold transition uppercase tracking-wide">
                                 Verify Payment
                               </button>
                            </div>
                          ) : req.status === 'verified_processing' ? (
                            <p className="text-xs text-green-400 font-bold flex items-center gap-2 bg-green-900/10 p-2 rounded"><CheckCircle size={14}/> Paid & Verified</p>
                          ) : req.status === 'converted_to_order' ? (
                            <p className="text-xs text-blue-300 font-bold flex items-center gap-2 bg-blue-900/10 p-2 rounded"><Package size={14}/> Moved to Orders</p>
                          ) : (
                            <p className="text-[10px] text-white/40 italic flex items-center gap-2"><Loader2 size={10} className="animate-spin"/> Waiting for payment...</p>
                          )}
                        </div>
                      )}
                    </div>
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