import { useEffect, useMemo, useRef, useState } from "react";
import { providers } from "./data/providers";
import ProviderCard from "./components/ProviderCard";
import FilterBar from "./components/FilterBar";
import EmptyState from "./components/EmptyState";
import BookingModal from "./components/BookingModal";
import StickyBar from "./components/StickyBar";
import Onboarding from "./components/Onboarding";
import CustomerDashboard from "./components/CustomerDashboard";
import ProviderDashboard from "./components/ProviderDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { site } from "./config/site";
import { ShieldCheck, Clock, MapPin } from "lucide-react";
import { getManagedCategories, getStoredReviews, getStoredUsers } from "./lib/demoStore";

function MarketplaceView({ user, onOpenOnboarding, onOpenDashboard, onLogout }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [neighborhood, setNeighborhood] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const marketplaceProviders = useMemo(() => {
    const categories = getManagedCategories();
    const approvedReviews = getStoredReviews().filter((review) => review.status === "approved");
    const profiles = getStoredUsers().filter(
      (account) =>
        account.applicationStatus === "approved" &&
        account.accountStatus !== "suspended",
    );
    const localProviders = profiles.map((account) => {
      const profile = account.providerData || {};
      const service = profile.service || "";
      const category =
        categories.find((item) => item.id === profile.category) ||
        categories.find((item) => item.label.toLowerCase() === service.toLowerCase()) ||
        categories.find((item) => item.id === service.toLowerCase());
      const name = profile.legalName || profile.name || account.name || "Provider";
      const reviews = approvedReviews.filter(
        (review) => review.providerId === account.uid || review.providerName === name,
      );
      const rating = reviews.length
        ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length
        : 0;

      return {
        id: account.uid,
        name,
        category: category?.id || "handyman",
        neighborhood: profile.area || "",
        services: Array.isArray(profile.services) && profile.services.length
          ? profile.services
          : service
            ? [service]
            : [],
        rating: Number(rating.toFixed(1)),
        reviews: reviews.length,
        verified: profile.verificationStatus === "verified",
        backgroundChecked: profile.backgroundChecked === true,
        available: profile.available !== false,
        rateFrom: Number(profile.rateFrom) || null,
        phone: profile.phone || "",
        avatar: profile.avatar || null,
        portfolio: Array.isArray(profile.portfolio) ? profile.portfolio : [],
      };
    });
    const customNames = new Set(localProviders.map((provider) => provider.name.toLowerCase()));
    return [
      ...providers.filter((provider) => !customNames.has(provider.name.toLowerCase())),
      ...localProviders,
    ];
  }, []);

  const filteredProviders = useMemo(() => {
    return marketplaceProviders.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (neighborhood !== "all" && p.neighborhood !== neighborhood) return false;
      if (search) {
        const text = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(text);
        const matchesService = p.services.some((s) => s.toLowerCase().includes(text));
        if (!matchesName && !matchesService) return false;
      }
      return true;
    });
  }, [marketplaceProviders, search, category, neighborhood]);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("all");
    setNeighborhood("all");
  };

  return (
    <div className="min-h-screen bg-brand-50 pb-20 font-sans">
      <header className="bg-brand-50 border-b border-brand-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt={site.name} className="h-12 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="text-sm font-semibold text-brand-700 hover:text-brand-600 border border-brand-200 bg-white/70 px-3 py-1.5 rounded-full"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="text-sm font-semibold text-brand-700 hover:text-brand-600 border border-brand-200 bg-white/70 px-3 py-1.5 rounded-full"
              >
                Join / Sign in
              </button>
            )}
          </div>
        </div>
      </header>

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
            Verified home pros, <br /> right in your estate.
          </h2>
          <p className="text-lg text-slate-300 max-w-xl mb-8">
            Skip the guesswork. Book trusted plumbers, electricians, and cleaners via WhatsApp in under 3 taps.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-brand-200" /> ID Verified</span>
            <span className="flex items-center gap-2"><Clock size={18} className="text-brand-200" /> Fast Response</span>
            <span className="flex items-center gap-2"><MapPin size={18} className="text-brand-200" /> Estate Filtering</span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-8">
          <FilterBar
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            neighborhood={neighborhood}
            setNeighborhood={setNeighborhood}
          />
        </div>

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

function AppContent() {
  const { user, role, applicationStatus, authLoading, authError, logout } = useAuth();
  const [screen, setScreen] = useState("onboarding");
  const initializedAuth = useRef(false);

  useEffect(() => {
    if (!authLoading && !initializedAuth.current) {
      initializedAuth.current = true;
      setScreen(user ? "dashboard" : "onboarding");
    }
  }, [authLoading, user]);

  if (authLoading) {
    return <div className="p-8 text-center text-slate-600">Loading account...</div>;
  }

  if (authError) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
        <p role="alert">{authError}</p>
        <button type="button" onClick={logout} className="mt-3 font-semibold underline">
          Sign out and try again
        </button>
      </div>
    );
  }

  if (screen === "onboarding") {
    return <Onboarding onExplore={(destination = "marketplace") => setScreen(destination)} />;
  }

  if (!user) {
    return (
      <MarketplaceView
        onOpenOnboarding={() => setScreen("onboarding")}
        onLogout={logout}
      />
    );
  }

  const isAdmin =
    user?.email?.trim().toLowerCase() === "admin@billion.com" || role === "admin";
  const isApprovedProvider =
    applicationStatus === "approved" || user.applicationStatus === "approved";

  if (screen === "marketplace" && !isAdmin) {
    return (
      <MarketplaceView
        user={user}
        onOpenDashboard={() => setScreen("dashboard")}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600">
            Signed in as {user.displayName || user.name}
          </p>
          <div className="flex gap-2">
            {!isAdmin && (
              <button
                type="button"
                onClick={() => setScreen("marketplace")}
                className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                Browse services
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
        {isAdmin ? (
          <AdminDashboard />
        ) : isApprovedProvider ? (
          <ProviderDashboard />
        ) : (
          <CustomerDashboard />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}