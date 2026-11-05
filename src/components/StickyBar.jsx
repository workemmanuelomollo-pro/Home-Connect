import { Phone, MessageCircle } from "lucide-react";

export default function StickyBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 pb-safe z-40 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <a 
        href="tel:+254700000000" 
        className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:bg-slate-200 transition-colors"
      >
        <Phone size={18} />
        Call Support
      </a>
      <a 
        href="https://wa.me/254700000000?text=Hi%20Home%20Service%20Connect,%20I%20need%20help%20finding%20a%20pro." 
        target="_blank" 
        rel="noreferrer"
        className="flex-1 bg-[#25D366] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#1DA851] transition-colors"
      >
        <MessageCircle size={18} />
        Chat with Us
      </a>
    </div>
  );
}