import { useState, useMemo } from "react";
import { providers } from "./data/providers";
import ProviderCard from "./components/ProviderCard";
import FilterBar from "./components/FilterBar";
import EmptyState from "./components/EmptyState";
import BookingModal from "./components/BookingModal";
import StickyBar from "./components/StickyBar";
import Onboarding from "./components/Onboarding";
import { site } from "./config/site";
import { ShieldCheck, Clock, MapPin } from "lucide-react";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [neighborhood, setNeighborhood] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (neighborhood !== "all" && p.neighborhood !== neighborhood) return false;
      if (search) {
        const text = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(text);
        const matchesService = p.services.some(s => s.toLowerCase().includes(text));
        if (!matchesName && !matchesService) return false;
      }
      return true;
    });
  }, [search, category, neighborhood]);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("all");
    setNeighborhood("all");
  };

  if (showOnboarding) {
    return <Onboarding onExplore={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-brand-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-brand-50 border-b border-brand-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt={site.name} className="h-12 w-auto object-contain" />
          </div>
          {/* Client/Provider Switch */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="text-sm font-semibold text-brand-700 hover:text-brand-600 border border-brand-200 bg-white/70 px-3 py-1.5 rounded-full"
          >
            Join as a Pro
          </button>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <div className="relative bg-[#163f3f] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop" 
            alt="Handyman working" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#163f3f] via-[#163f3f]/90 to-transparent"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 max-w-xl leading-tight">
            Verified home pros, <br/> right in your estate.
          </h2>
          <p className="text-lg text-slate-300 max-w-xl mb-8">
            Skip the guesswork. Book trusted plumbers, electricians, and cleaners via WhatsApp in under 3 taps.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-brand-200"/> ID Verified</span>
            <span className="flex items-center gap-2"><Clock size={18} className="text-brand-200"/> Fast Response</span>
            <span className="flex items-center gap-2"><MapPin size={18} className="text-brand-200"/> Estate Filtering</span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        {/* Filters floating over hero */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-8">
          <FilterBar 
            search={search} setSearch={setSearch}
            category={category} setCategory={setCategory}
            neighborhood={neighborhood} setNeighborhood={setNeighborhood}
          />
        </div>

        {/* Provider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <ProviderCard 
                key={provider.id} 
                provider={provider} 
                onBook={(p) => {
                  setSelectedProvider(p);
                  setIsModalOpen(true);
                }} 
              />
            ))
          ) : (
            <EmptyState onClear={handleClearFilters} />
          )}
        </div>
      </main>
      
      <BookingModal 
        provider={selectedProvider} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <StickyBar />
    </div>
  );
}