import { Star, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";

export default function ProviderCard({ provider, onBook }) {
  // If they have no photo, grab their initials (e.g., "John Mwangi" -> "JM")
  const initials = provider.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3">
      {/* Top Row: Avatar, Name, Rating */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with Fallback */}
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg">
            {provider.avatar ? (
              <img src={provider.avatar} alt={provider.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 leading-tight">{provider.name}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Star size={14} className="fill-amber-500" />
                {provider.reviews ? `${provider.rating} (${provider.reviews})` : "New provider"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Availability Badge */}
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${provider.available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {provider.available ? "Available Today" : "Unavailable"}
        </div>
      </div>

      {/* Location & Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
          <MapPin size={12} />
          {provider.neighborhood || "Service area not set"}
        </span>
        {provider.verified && (
          <span className="flex items-center gap-1 text-brand-700 bg-brand-50 px-2 py-1 rounded-md font-medium">
            <ShieldCheck size={12} />
            ID Verified
          </span>
        )}
        {provider.backgroundChecked && (
          <span className="flex items-center gap-1 text-brand-700 bg-brand-50 px-2 py-1 rounded-md font-medium">
            <CheckCircle2 size={12} />
            Background Checked
          </span>
        )}
      </div>

      {/* Services snippet */}
      <p className="text-sm text-slate-600 line-clamp-1">
        {provider.services.join(" • ")}
      </p>

      {provider.portfolio?.length > 0 && (
        <div className="grid grid-cols-3 gap-2" aria-label="Portfolio photographs">
          {provider.portfolio.slice(0, 3).map((photo) => (
            <img
              key={photo.id}
              src={photo.dataUrl}
              alt={`${provider.name} portfolio`}
              className="h-20 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {/* Bottom Row: Price & Book Button */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
        <div className="text-sm">
          {provider.rateFrom ? (
            <>
              <span className="text-slate-500 text-xs">From </span>
              <span className="font-semibold text-slate-900">KSh {provider.rateFrom}</span>
            </>
          ) : (
            <span className="text-xs text-slate-500">Contact for quote</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onBook(provider)}
          disabled={!provider.available}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {provider.available ? "Book via WhatsApp" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}