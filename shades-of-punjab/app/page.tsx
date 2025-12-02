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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2a0a12] to-[#0f0505]">
      
      {/* HERO SECTION */}
      {/* Updated height: h-[60vh] for mobile, h-[85vh] for desktop */}
      <section className="relative h-[60vh] md:h-[85vh] min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image with better mobile tint */}
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://xplbznfkpfxumynuoltl.supabase.co/storage/v1/object/public/banners/banner.png')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-black/60 md:bg-black/40" /> {/* Darker overlay on mobile for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a0a12] via-transparent to-black/80" />
        </div>

        <div className="relative z-10 top-24 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center h-full pt-10">
          <p className="text-[#c5a059] uppercase tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Est. 2024 • Legacy of Punjab
          </p>
          
          {/* <h1 className="text-4xl md:text-7xl lg:text-8xl font-heading font-bold text-[#fbf5e9] mb-6 md:mb-8 tracking-wide drop-shadow-2xl">
            SHADES OF <span className="text-[#c5a059]">PUNJAB</span>
          </h1> */}

          <Link 
            href="/shop" 
            className="group relative inline-flex items-center gap-3 px-8 py-3 md:px-12 md:py-4 border-2 border-[#c5a059] text-[#c5a059] font-heading uppercase tracking-widest text-xs md:text-sm hover:bg-[#c5a059] hover:text-[#2a0a12] transition-all duration-300 bg-black/30 backdrop-blur-sm shadow-lg"
          >
            To The Collections
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* FEATURED COLLECTIONS */}
      <section className="py-16 md:py-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <Star className="w-6 h-6 md:w-8 md:h-8 text-[#c5a059] mx-auto mb-4" fill="currentColor" />
          <h2 className="text-3xl md:text-4xl font-heading text-[#fbf5e9] mb-2">New Royal Arrivals</h2>
          <div className="h-1 w-16 md:w-20 bg-[#c5a059] mx-auto" />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-[#c5a059]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {latestProducts.map((product) => (
              <Link href="/shop" key={product.id} className="group block bg-[#1a0f0f] border border-[#c5a059]/30 rounded-lg overflow-hidden shadow-lg hover:shadow-[#c5a059]/10 transition-all duration-300">
                
                {/* Image Area */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                  <img 
                    src={product.image_url || "/placeholder.jpg"} 
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-in-out opacity-90 group-hover:opacity-100"
                  />
                  {/* Mobile-friendly gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0f] to-transparent opacity-60" />
                  
                  <div className="absolute bottom-3 right-3 bg-[#c5a059] text-[#1a0f0f] p-2.5 rounded-full shadow-lg">
                    <ShoppingBag size={20} />
                  </div>
                </div>
                
                {/* Card Details */}
                <div className="p-5 text-center relative">
                  <div className="inline-block bg-[#2a0a12] border border-[#c5a059]/30 px-3 py-1 text-[10px] uppercase tracking-widest text-[#c5a059] mb-3 rounded">
                    {product.category}
                  </div>
                  
                  <h3 className="text-lg font-heading font-bold text-[#fbf5e9] mb-2 truncate px-2">
                    {product.name}
                  </h3>
                  <p className="text-[#c5a059] font-body font-bold text-lg">
                    ₹{product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* BRAND PROMISE */}
      <section className="bg-[#1a0f0f] text-[#c5a059] py-16 px-6 text-center border-t border-[#c5a059]/10">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-heading mb-6">Shades Of Punjab</h3>
          <p className="font-body text-base md:text-lg leading-relaxed text-[#fbf5e9]/80 italic">
            Website design by Harsh Deep Singh
          </p>
          <div className="mt-8 flex justify-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
             <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
             <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
          </div>
        </div>
      </section>

    </div>
  );
}