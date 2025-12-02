"use client";
import Link from "next/link";
import { ShoppingBag, User, Menu, Camera } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const { cart } = useCart();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. Check if the current user is an Admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // REPLACE with your actual Admin IDs
      const ALLOWED_ADMINS = [
        "7903379968@shades.local", 
        "9988776655@shades.local", 
        "9123456789@shades.local", 
        "8899776655@shades.local"
      ];

      if (user && user.email && ALLOWED_ADMINS.includes(user.email)) {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  // 2. Scroll Effect Logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-500 ease-in-out border-b ${
        isScrolled 
          ? "bg-royal-maroon/80 backdrop-blur-md border-royal-gold/50 shadow-2xl" 
          : "bg-royal-maroon border-royal-gold/20 shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl font-heading font-bold text-royal-gold tracking-widest hover:text-white transition-colors">
            SHADES OF PUNJAB
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/shop" className="text-royal-cream hover:text-royal-gold transition font-body tracking-wider uppercase text-sm">
              The Collection
            </Link>
            <Link href="/custom-request" className="flex items-center gap-1 text-royal-cream hover:text-royal-gold transition font-body tracking-wider uppercase text-sm">
              <Camera size={16} className="text-royal-gold" /> Custom Order
            </Link>
            
            {/* Admin Link - Only visible if isAdmin is true */}
            {isAdmin && (
              <Link href="/admin" className="text-royal-gold text-xs font-bold border border-royal-gold px-3 py-1 uppercase tracking-widest hover:bg-royal-gold hover:text-royal-maroon transition">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6 text-royal-gold">
            <Link href="/cart" className="relative hover:text-white transition">
              <ShoppingBag size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-royal-gold text-royal-maroon text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            
            <Link href="/profile" className="hover:text-white transition">
              <User size={24} />
            </Link>

            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="md:hidden text-royal-gold">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-royal-maroon/95 backdrop-blur-xl border-t border-royal-gold/20 p-4 space-y-4 absolute w-full left-0 shadow-xl">
          <Link href="/shop" className="block text-royal-cream uppercase tracking-widest text-sm" onClick={() => setIsMobileOpen(false)}>The Collection</Link>
          <Link href="/custom-request" className="block text-royal-cream uppercase tracking-widest text-sm" onClick={() => setIsMobileOpen(false)}>Custom Order</Link>
          {isAdmin && (
            <Link href="/admin" className="block text-royal-gold uppercase tracking-widest text-sm" onClick={() => setIsMobileOpen(false)}>
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}