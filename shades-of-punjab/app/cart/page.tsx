"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { Trash2, Upload, CheckCircle, Loader2, QrCode, ArrowLeft, Plus, Minus, CreditCard, MapPin, Home, Briefcase, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Address Type Definition
type Address = {
  id: number;
  label: string;
  house_no: string;
  landmark: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

export default function CartPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [userRemarks, setUserRemarks] = useState("");
  
  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    house_no: "",
    landmark: "",
    district: "",
    city: "",
    state: "",
    pincode: "",
    phone: ""
  });

  const router = useRouter();

  // Load Addresses on Mount
  useEffect(() => {
    const fetchAddresses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id);
        if (data) {
          setAddresses(data);
          // Auto-select first address if available
          if (data.length > 0) setSelectedAddressId(data[0].id);
        }
      }
    };
    fetchAddresses();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSaveAddress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login.");

    if (!newAddress.house_no || !newAddress.city || !newAddress.pincode || !newAddress.phone) {
      return alert("Please fill in required fields (House No, City, Pincode, Phone).");
    }

    const { data, error } = await supabase.from('addresses').insert([{
      user_id: user.id,
      ...newAddress
    }]).select();

    if (error) {
      alert("Error saving address: " + error.message);
    } else if (data) {
      setAddresses([...addresses, data[0]]);
      setSelectedAddressId(data[0].id);
      setShowAddressForm(false);
      // Reset form
      setNewAddress({ label: "Home", house_no: "", landmark: "", district: "", city: "", state: "", pincode: "", phone: "" });
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Delete this address?")) return;
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (!error) {
      setAddresses(prev => prev.filter(a => a.id !== id));
      if (selectedAddressId === id) setSelectedAddressId(null);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    if (!selectedAddressId) return alert("Please select a delivery address.");
    if (!paymentProof) return alert("Please upload a payment screenshot first.");

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login to place an order.");
        router.push("/login");
        return;
      }

      // Get full address object to save snapshot
      const addressSnapshot = addresses.find(a => a.id === selectedAddressId);

      const fileExt = paymentProof.name.split('.').pop();
      const fileName = `order_${Date.now()}_${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('orders').upload(filePath, paymentProof);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('orders').getPublicUrl(filePath);

      const { error: orderError } = await supabase.from('orders').insert([{
        user_id: user.id,
        total_amount: cartTotal,
        status: 'pending',
        payment_screenshot_url: publicUrl,
        user_remarks: userRemarks,
        customer_phone: addressSnapshot?.phone || "", // Use phone from address
        delivery_address: addressSnapshot // Save full address object
      }]);

      if (orderError) throw orderError;

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
      <div className="min-h-screen bg-royal-maroon bg-[url('/royal-pattern-dark.png')] bg-blend-multiply flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-royal-gold rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
        <h2 className="text-3xl md:text-4xl font-heading text-royal-gold mb-3 drop-shadow-md">Your Cart is Empty</h2>
        <p className="text-royal-cream/60 mb-8 font-body max-w-md">Go add some items to your collection.</p>
        <Link href="/shop" className="bg-gradient-to-r from-[#2a0a12] to-[#3d0a15] border border-[#c5a059] text-[#c5a059] px-10 py-4 font-heading uppercase tracking-[0.2em] text-xs hover:bg-[#c5a059] hover:text-[#2a0a12] transition-all duration-300 shadow-xl rounded-sm">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a0a12] to-[#0f0505] pb-20 pt-6 px-4 md:px-8 relative">
      
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#c5a059] rounded-full blur-[200px] opacity-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        
        {/* --- LEFT COLUMN: ITEMS & ADDRESS (Span 7) --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Cart Items */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
               <Link href="/shop" className="text-[#c5a059]/80 hover:text-[#c5a059] transition hover:-translate-x-1"><ArrowLeft size={24} /></Link>
               <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#fbf5e9] tracking-wide">Shopping Cart</h1>
            </div>
            
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 bg-[#1a0f0f]/80 backdrop-blur-sm border border-[#c5a059]/20 p-4 rounded-xl shadow-lg relative group">
                <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-lg overflow-hidden border border-[#c5a059]/10 bg-black">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-90" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-heading font-bold text-[#fbf5e9] text-sm md:text-base leading-tight mb-1">{item.name}</h3>
                    <p className="text-[#c5a059]/70 text-xs uppercase tracking-wider mb-2">₹{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0f0505] p-1 rounded-lg border border-[#c5a059]/20 w-fit">
                    <button onClick={() => decreaseQuantity(item.id)} className="w-6 h-6 rounded bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center hover:bg-[#c5a059] hover:text-[#0f0505] transition-colors"><Minus size={12} /></button>
                    <span className="text-[#fbf5e9] font-bold w-4 text-center text-xs">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="w-6 h-6 rounded bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center hover:bg-[#c5a059] hover:text-[#0f0505] transition-colors"><Plus size={12} /></button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="absolute top-2 right-2 text-red-500/50 hover:text-red-400 p-2"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          {/* --- ADDRESS SECTION --- */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-heading font-bold text-[#fbf5e9] flex items-center gap-2"><MapPin size={20} className="text-[#c5a059]" /> Delivery Address</h2>
              <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-xs font-bold text-[#c5a059] border border-[#c5a059] px-3 py-1.5 rounded hover:bg-[#c5a059] hover:text-black transition uppercase tracking-wider flex items-center gap-1">
                {showAddressForm ? <X size={14}/> : <Plus size={14}/>} {showAddressForm ? "Cancel" : "Add New"}
              </button>
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <div className="bg-[#1a0f0f] p-5 rounded-xl border border-[#c5a059]/30 mb-6 animate-in slide-in-from-top-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex gap-2 col-span-1 md:col-span-2">
                    {['Home', 'Office', 'Other'].map(lbl => (
                      <button 
                        key={lbl}
                        onClick={() => setNewAddress({...newAddress, label: lbl})}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded border ${newAddress.label === lbl ? 'bg-[#c5a059] text-black border-[#c5a059]' : 'text-[#c5a059] border-[#c5a059]/30'}`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                  <input placeholder="House No / Flat *" className="bg-black/40 border border-[#c5a059]/20 p-3 rounded text-sm text-[#fbf5e9] outline-none focus:border-[#c5a059]" value={newAddress.house_no} onChange={e => setNewAddress({...newAddress, house_no: e.target.value})} />
                  <input placeholder="Landmark / Area" className="bg-black/40 border border-[#c5a059]/20 p-3 rounded text-sm text-[#fbf5e9] outline-none focus:border-[#c5a059]" value={newAddress.landmark} onChange={e => setNewAddress({...newAddress, landmark: e.target.value})} />
                  <input placeholder="District" className="bg-black/40 border border-[#c5a059]/20 p-3 rounded text-sm text-[#fbf5e9] outline-none focus:border-[#c5a059]" value={newAddress.district} onChange={e => setNewAddress({...newAddress, district: e.target.value})} />
                  <input placeholder="City *" className="bg-black/40 border border-[#c5a059]/20 p-3 rounded text-sm text-[#fbf5e9] outline-none focus:border-[#c5a059]" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                  <input placeholder="State" className="bg-black/40 border border-[#c5a059]/20 p-3 rounded text-sm text-[#fbf5e9] outline-none focus:border-[#c5a059]" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                  <input placeholder="Pincode *" className="bg-black/40 border border-[#c5a059]/20 p-3 rounded text-sm text-[#fbf5e9] outline-none focus:border-[#c5a059]" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} />
                  <input placeholder="Phone Number *" className="bg-black/40 border border-[#c5a059]/20 p-3 rounded text-sm text-[#fbf5e9] outline-none focus:border-[#c5a059] col-span-1 md:col-span-2" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                </div>
                <button onClick={handleSaveAddress} className="w-full bg-[#c5a059] text-black font-bold py-3 rounded hover:bg-white transition uppercase tracking-widest text-xs">Save Address</button>
              </div>
            )}

            {/* Address List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div 
                  key={addr.id} 
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative flex flex-col gap-1
                    ${selectedAddressId === addr.id ? 'border-[#c5a059] bg-[#c5a059]/10' : 'border-[#c5a059]/10 bg-[#1a0f0f] hover:border-[#c5a059]/40'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1">
                      {addr.label === 'Home' ? <Home size={12}/> : addr.label === 'Office' ? <Briefcase size={12}/> : <MapPin size={12}/>} 
                      {addr.label}
                    </span>
                    {selectedAddressId === addr.id && <CheckCircle size={16} className="text-[#c5a059]" />}
                  </div>
                  <p className="text-[#fbf5e9] text-sm font-bold mt-1">{addr.house_no}, {addr.landmark}</p>
                  <p className="text-[#fbf5e9]/60 text-xs">{addr.city}, {addr.district} - {addr.pincode}</p>
                  <p className="text-[#fbf5e9]/60 text-xs">Ph: {addr.phone}</p>
                  
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }} className="absolute bottom-3 right-3 text-red-500/40 hover:text-red-500 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {addresses.length === 0 && !showAddressForm && (
                <p className="text-[#fbf5e9]/40 text-sm italic col-span-2 text-center py-4">No addresses saved. Please add one.</p>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: CHECKOUT (Span 5) --- */}
        <div className="lg:col-span-5 h-fit">
          <div className="bg-[#1a0f0f] border border-[#c5a059]/30 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden sticky top-6">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#2a0a12] via-[#c5a059] to-[#2a0a12]" />
            
            <h2 className="text-xl font-heading font-bold text-[#fbf5e9] mb-6 flex items-center gap-2">
              <CreditCard className="text-[#c5a059]" size={20}/> Payment
            </h2>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm text-[#fbf5e9]/60"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-[#fbf5e9]/60"><span>Shipping</span><span className="text-green-400 text-xs">FREE</span></div>
              <div className="w-full h-px bg-[#c5a059]/20 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-[#c5a059] uppercase tracking-widest text-xs font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-[#fbf5e9]">₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#0f0505] p-4 rounded-xl border border-[#c5a059]/20 text-center mb-6">
              <p className="text-[10px] text-[#c5a059] uppercase tracking-widest mb-3">Scan UPI to Pay</p>
              <div className="bg-white p-3 w-40 h-40 mx-auto rounded-lg shadow-inner flex items-center justify-center"><QrCode size={140} className="text-black" /></div>
              <p className="text-xs text-[#fbf5e9]/40 font-mono mt-3 bg-[#c5a059]/5 py-1 px-2 rounded inline-block">shadesofpunjab@upi</p>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-3">Payment Proof *</label>
              <div className="relative group cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"/>
                <div className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 transition-all duration-300 ${paymentProof ? 'border-green-500/50 bg-green-900/10' : 'border-[#c5a059]/30 bg-[#0f0505] group-hover:border-[#c5a059] group-hover:bg-[#c5a059]/5'}`}>
                  {paymentProof ? <><CheckCircle className="text-green-500" size={20} /><span className="text-sm text-green-400 font-bold truncate max-w-[200px]">{paymentProof.name}</span></> : <><Upload className="text-[#c5a059]" size={20} /><span className="text-sm text-[#c5a059]/80 uppercase tracking-wide text-[10px]">Upload Screenshot</span></>}
                </div>
              </div>
            </div>

            <button onClick={handleCheckout} disabled={loading} className="w-full bg-gradient-to-r from-[#c5a059] to-[#8c6d36] text-[#1a0f0f] py-4 rounded-lg font-heading font-bold uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:scale-[1.02] transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:scale-100">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle size={20} />} {loading ? "Verifying..." : "Confirm Order"}
            </button>
            <div className="flex justify-center mt-4"><span className="text-[10px] text-[#fbf5e9]/30 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} /> Secure Transaction</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}