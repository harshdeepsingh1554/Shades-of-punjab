"use client";
import Link from "next/link";
import { ArrowRight, Star, Loader2, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Define Product Type
type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
};

export default function Home() {
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the 3 newest products
  useEffect(() => {
    async function fetchNewArrivals() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (!error && data) {
        setLatestProducts(data);
      }
      setLoading(false);
    }
    fetchNewArrivals();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-royal-pattern">
      
      {/* HERO SECTION: The Royal Entrance (Restored) */}
      <section className="relative h-[600px] flex items-center justify-center bg-royal-dark overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 opacity-90 bg-[url('https://xplbznfkpfxumynuoltl.supabase.co/storage/v1/object/public/banners/banner.png')] bg-cover bg-center" />
        
        {/* Gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-royal-maroon via-transparent to-black opacity-80" />

        <div className="relative z-10 text-center text-royal-cream px-4 max-w-4xl mx-auto">
          <p className="mt-50 text-royal-gold uppercase tracking-[0.5em] text-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Est. 2024 • The Heritage Brand
          </p>
          
          <Link 
            href="/shop" 
            className="group relative inline-flex items-center gap-3 px-10 py-4 border-2 border-royal-gold text-royal-gold font-heading uppercase tracking-widest text-sm hover:bg-royal-gold hover:text-royal-maroon transition-all duration-300"
          >
            Enter The Treasury
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* FEATURED COLLECTIONS: New Arrivals (Updated Design & Logic) */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <Star className="w-8 h-8 text-royal-gold mx-auto mb-4" />
          <h2 className="text-4xl font-heading text-royal-maroon mb-2">New Royal Arrivals</h2>
          <div className="h-1 w-20 bg-royal-gold mx-auto" />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-10 h-10 text-royal-maroon" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {latestProducts.map((product) => (
              <Link href="/shop" key={product.id} className="group relative block bg-[#1a1510] border-2 border-royal-gold/30 hover:border-royal-gold transition-all duration-500 rounded-sm overflow-hidden shadow-xl hover:shadow-royal-gold/20">
                
                {/* Image Area */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                  <img 
                    src={product.image_url || "/placeholder.jpg"} 
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-[1.5s] ease-in-out opacity-90 group-hover:opacity-100"
                  />
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510] via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
                  
                  {/* Quick Action Overlay */}
                  <div className="absolute bottom-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <div className="bg-royal-gold text-black p-3 rounded-full shadow-lg">
                      <ShoppingBag size={20} />
                    </div>
                  </div>
                </div>
                
                {/* Card Details */}
                <div className="p-6 text-center relative bg-[#1a1510]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-royal-gold text-[#1a1510] px-4 py-1 text-[10px] uppercase tracking-widest font-bold shadow-sm">
                    {product.category}
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-royal-cream mb-2 mt-4 truncate group-hover:text-royal-gold transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-royal-gold font-body font-bold text-lg">
                    ₹{product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* BRAND PROMISE (Restored) */}
      <section className="bg-royal-maroon text-royal-gold py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-heading mb-6">A Legacy of Quality</h3>
          <p className="font-body text-lg leading-relaxed text-royal-cream/90">
            "Every garment is stitched with the same precision and care that adorned the courts of the Maharajas. 
            We do not just sell clothes; we craft legacies."
          </p>
          <div className="mt-8 flex justify-center gap-2">
             <div className="w-2 h-2 rounded-full bg-royal-gold" />
             <div className="w-2 h-2 rounded-full bg-royal-gold" />
             <div className="w-2 h-2 rounded-full bg-royal-gold" />
          </div>
        </div>
      </section>

    </div>
  );
}