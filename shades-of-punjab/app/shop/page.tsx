"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { Loader2, Crown, ShoppingCart } from "lucide-react";

// Define Product Type
type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  stock: number; // Added stock to check availability
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase.from("products").select("*");
      if (!error && data) setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-royal-dark text-royal-gold">
      <Loader2 className="animate-spin w-12 h-12 mb-4" />
      <p className="font-heading tracking-[0.3em] uppercase text-sm">Opening Treasury...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-royal-maroon bg-[url('/royal-pattern-dark.png')] bg-blend-multiply relative overflow-hidden">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-royal-gold rounded-full blur-[180px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-royal-maroon rounded-full blur-[180px] opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        
        {/* Page Header */}
        <div className="text-center mb-20 relative">
          <div className="flex justify-center mb-4">
             <Crown size={48} className="text-royal-gold drop-shadow-lg" />
          </div>
          <span className="text-royal-gold/80 text-xs tracking-[0.4em] font-bold uppercase block mb-2">The Royal Collection</span>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-royal-cream tracking-wide drop-shadow-md">
            Shades of Punjab
          </h1>
          {/* Decorative divider line */}
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-royal-gold to-transparent mx-auto mt-6" />
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-[#1a1510] border border-royal-gold/30 p-4 rounded-xl shadow-lg hover:shadow-royal-gold/20 hover:border-royal-gold transition-all duration-500 flex flex-col">
              
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-black mb-6 border border-royal-gold/10 group-hover:border-royal-gold/30 transition-colors">
                <img 
                  src={product.image_url || "/placeholder.jpg"} 
                  alt={product.name} 
                  className={`w-full h-full object-cover transform group-hover:scale-110 transition duration-1000 ease-in-out ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`}
                />
                
                {/* Out of Stock Overlay */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-800/90 text-white border border-red-500 px-4 py-2 font-heading tracking-widest uppercase text-sm">
                      Sold Out
                    </span>
                  </div>
                )}

                {/* Hover Overlay */}
                {product.stock > 0 && (
                   <div className="absolute inset-0 bg-gradient-to-t from-royal-maroon/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
              </div>

              {/* Details Section */}
              <div className="text-center flex-1 flex flex-col">
                <p className="text-[10px] text-royal-gold/70 uppercase tracking-[0.2em] mb-2">{product.category}</p>
                <h3 className="text-xl font-heading font-bold text-royal-cream mb-2 truncate px-2 group-hover:text-royal-gold transition-colors">{product.name}</h3>
                <p className="text-lg text-royal-gold font-bold mb-6">₹{product.price.toLocaleString()}</p>
                
                {/* Royal Button */}
                <button 
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`mt-auto w-full py-4 font-heading uppercase tracking-[0.2em] text-xs font-bold transition-all duration-500 flex items-center justify-center gap-2 border
                    ${product.stock === 0 
                      ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-royal-maroon to-[#3d0a15] border-royal-gold/50 text-royal-gold hover:from-royal-gold hover:to-[#8c6d36] hover:text-[#1a1510] hover:border-royal-gold'
                    }`}
                >
                  {product.stock === 0 ? "Unavailable" : (
                    <>
                      Add to Cart <ShoppingCart size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}