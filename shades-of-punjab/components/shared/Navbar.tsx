"use client";
import Link from "next/link";
import { ShoppingBag, User, Menu, Camera, X } from "lucide-react";
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
        "6205218556@shades.local", 
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
      className={`sticky top-0 z-[100] transition-all duration-500 ease-in-out border-b ${
        isScrolled 
          ? "bg-[#0f0505]/95 backdrop-blur-md border-[#c5a059]/50 shadow-2xl" 
          : "bg-[#0f0505] border-[#c5a059]/20 shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20 items-center">
          
          {/* Logo */}
          <Link href="/" className="text-xl md:text-3xl font-heading font-bold text-[#c5a059] tracking-widest hover:text-white transition-colors truncate">
            SHADES OF PUNJAB
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/shop" className="text-[#fbf5e9] hover:text-[#c5a059] transition font-body tracking-wider uppercase text-sm">
              The Collection
            </Link>
            <Link href="/custom-request" className="flex items-center gap-1 text-[#fbf5e9] hover:text-[#c5a059] transition font-body tracking-wider uppercase text-sm">
              <Camera size={16} className="text-[#c5a059]" /> Custom Order
            </Link>
            
            {/* Admin Link - Only visible if isAdmin is true */}
            {isAdmin && (
              <Link href="/admin/orders" className="text-[#c5a059] text-xs font-bold border border-[#c5a059] px-3 py-1 uppercase tracking-widest hover:bg-[#c5a059] hover:text-[#0f0505] transition">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 md:space-x-6 text-[#c5a059]">
            <Link href="/cart" className="relative hover:text-white transition">
              <ShoppingBag size={22} className="md:w-6 md:h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#c5a059] text-[#0f0505] text-[10px] font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            
            <Link href="/profile" className="hover:text-white transition">
              <User size={22} className="md:w-6 md:h-6" />
            </Link>

            {/* Mobile Menu Button - Toggles between Menu and X icon */}
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="md:hidden text-[#c5a059] hover:text-white transition p-1">
              {isMobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileOpen && (
        <div className="md:hidden bg-[#0f0505] border-t border-[#c5a059]/20 fixed w-full left-0 top-[64px] h-[calc(100vh-64px)] z-50 p-6 flex flex-col gap-6 overflow-y-auto shadow-2xl animate-in slide-in-from-top-5 duration-300">
          <Link href="/shop" className="text-[#fbf5e9] text-lg uppercase tracking-widest font-bold border-b border-[#c5a059]/10 pb-4 hover:text-[#c5a059] transition" onClick={() => setIsMobileOpen(false)}>
            The Collection
          </Link>
          <Link href="/custom-request" className="text-[#fbf5e9] text-lg uppercase tracking-widest font-bold border-b border-[#c5a059]/10 pb-4 hover:text-[#c5a059] transition flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
            <Camera size={20} className="text-[#c5a059]" /> Custom Order
          </Link>
          
          {isAdmin && (
            <Link href="/admin/orders" className="text-[#c5a059] text-lg uppercase tracking-widest font-bold border border-[#c5a059] p-3 text-center rounded hover:bg-[#c5a059] hover:text-[#0f0505] transition" onClick={() => setIsMobileOpen(false)}>
              Admin Panel
            </Link>
          )}

          {/* Added Cart/Profile Links to Menu for easier access */}
           <div className="mt-auto border-t border-[#c5a059]/20 pt-6 flex justify-around">
             <Link href="/cart" onClick={() => setIsMobileOpen(false)} className="flex flex-col items-center gap-1 text-[#fbf5e9] hover:text-[#c5a059]">
               <ShoppingBag size={24} /> <span className="text-xs uppercase tracking-widest">Cart ({cart.length})</span>
             </Link>
             <Link href="/profile" onClick={() => setIsMobileOpen(false)} className="flex flex-col items-center gap-1 text-[#fbf5e9] hover:text-[#c5a059]">
               <User size={24} /> <span className="text-xs uppercase tracking-widest">Profile</span>
             </Link>
           </div>
        </div>
      )}
    </nav>
  );
}