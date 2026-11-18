import { useState } from "react";
import { X } from "lucide-react";
import { urgencyOptions } from "../config/site";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { addBooking, getManagedNeighborhoods } from "../lib/demoStore";
import { useAuth } from "../context/AuthContext";

function BookingForm({ provider, onClose }) {
  const { user } = useAuth();
  const serviceAreas = getManagedNeighborhoods();
  const [service, setService] = useState(provider.services[0] || "");
  const [neighborhood, setNeighborhood] = useState(
    provider.neighborhood || serviceAreas[0] || "",
  );
  const [urgency, setUrgency] = useState("Today (High)");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { service, neighborhood, urgency, description };
    let booking;
    try {
      booking = addBooking({
        customerId: user?.uid || "guest-user",
        customerName: user?.name || "Guest Customer",
        providerId: provider.id,
        providerName: provider.name,
        providerPhone: provider.phone,
        service,
        neighborhood,
        urgency,
        description,
        status: "pending",
      });
    } catch (saveError) {
      console.error("Failed to save booking request:", saveError);
      setError("Could not save your booking request in this browser. Check storage and try again.");
      return;
    }

    const link = buildWhatsAppLink(provider, { ...formData, bookingId: booking.id });
    window.open(link, "_blank");
    onClose();
  };

  return (
    <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Book {provider.name}</h2>
          <p className="text-sm text-slate-500">Fill in the details to send a WhatsApp message.</p>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Service Needed</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {provider.services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estate / Neighborhood</label>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {serviceAreas.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {urgencyOptions.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. The kitchen sink pipe is burst and water is spilling."
            rows="3"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="mt-2 w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Send on WhatsApp
        </button>
      </form>
    </div>
  );
}

export default function BookingModal({ provider, isOpen, onClose }) {
  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <BookingForm key={`${provider.id}-${isOpen}`} provider={provider} onClose={onClose} />
    </div>
  );
}