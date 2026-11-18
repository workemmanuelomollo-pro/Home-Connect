import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";
import { getManagedCategories, getManagedNeighborhoods } from "../lib/demoStore";

export default function ApplyModal({ isOpen, onClose }) {
  const { user, updateUserProfile } = useAuth();
  const categories = getManagedCategories();
  const neighborhoods = getManagedNeighborhoods();
  const [service, setService] = useState(() => categories[0]?.id || "");
  const [area, setArea] = useState(() => neighborhoods[0] || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const saved = updateUserProfile("provider", {
        applicationStatus: "pending",
        providerData: {
          category: service,
          service: categories.find((category) => category.id === service)?.label || "",
          area,
          phone,
          name: user?.name || "Provider",
        },
      });

      if (!saved) {
        setError("Could not save your application. Check browser storage and try again.");
        return;
      }

      onClose();
    } catch (error) {
      console.error(error);
      setError("Could not submit your application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Apply as a Provider</h2>
          <button onClick={onClose} aria-label="Close application form">
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Service Category
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full border p-2 rounded-lg"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Primary Neighborhood
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full border p-2 rounded-lg"
            >
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="provider-phone" className="block text-sm font-medium mb-1">
              Phone / WhatsApp
            </label>
            <input
              id="provider-phone"
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full border p-2 rounded-lg"
              placeholder="+254 7XX XXX XXX"
            />
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
