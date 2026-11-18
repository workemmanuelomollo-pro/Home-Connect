import { useState } from "react";
import { CalendarClock, Star } from "lucide-react";
import { getStoredBookings, getStoredReviews } from "../lib/demoStore";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ProviderDashboard() {
  const { user, updateUserProfile } = useAuth();
  const [viewVersion, setViewVersion] = useState(0);
  const [portfolioMessage, setPortfolioMessage] = useState("");
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);

  const providerData = user?.providerData || {};
  const isAvailable = providerData.available !== false;
  const portfolio = Array.isArray(providerData.portfolio)
    ? providerData.portfolio
    : [];

  const bookings = !user?.uid && !user?.name
    ? []
    : getStoredBookings().filter(
        (booking) => booking.providerId === user?.uid || booking.providerName === user?.name,
      );

  const reviews = !user?.name
    ? []
    : getStoredReviews()
        .filter((review) => review.providerName === user.name && review.status === "approved")
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const handleAvailabilityChange = () => {
    const saved = updateUserProfile("provider", {
      providerData: { ...providerData, available: !isAvailable },
    });

    setPortfolioMessage(
      saved
        ? `Availability set to ${!isAvailable ? "available" : "unavailable"}.`
        : "Could not save your availability. Check browser storage and try again.",
    );
  };

  const handlePortfolioUpload = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.portfolioFile.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPortfolioMessage("Choose an image file.");
      return;
    }

    if (file.size > 500 * 1024) {
      setPortfolioMessage("Each portfolio image must be 500 KB or smaller.");
      return;
    }

    if (portfolio.length >= 4) {
      setPortfolioMessage("You can save up to 4 portfolio images in this demo.");
      return;
    }

    setIsAddingPhoto(true);
    setPortfolioMessage("");

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("The selected image could not be read."));
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const nextPortfolio = [
        ...portfolio,
        {
          id: `photo-${Date.now()}`,
          name: file.name,
          dataUrl,
        },
      ];
      const saved = updateUserProfile("provider", {
        providerData: { ...providerData, portfolio: nextPortfolio },
      });

      if (!saved) {
        setPortfolioMessage("Could not save this image. Check browser storage and try again.");
        return;
      }

      form.reset();
      setPortfolioMessage("Portfolio image saved in this browser.");
    } catch (error) {
      console.error("Failed to add portfolio image:", error);
      setPortfolioMessage("Could not read this image. Choose a different file and try again.");
    } finally {
      setIsAddingPhoto(false);
    }
  };

  const handlePortfolioRemove = (photoId) => {
    const saved = updateUserProfile("provider", {
      providerData: {
        ...providerData,
        portfolio: portfolio.filter((photo) => photo.id !== photoId),
      },
    });

    setPortfolioMessage(
      saved
        ? "Portfolio image removed."
        : "Could not remove this image. Check browser storage and try again.",
    );
  };

  const handleStatusUpdate = (bookingId, status) => {
    const stored = getStoredBookings();
    const updated = stored.map((booking) =>
      booking.id === bookingId ? { ...booking, status } : booking,
    );
    window.localStorage.setItem("hsc_bookings", JSON.stringify(updated));
    setViewVersion((current) => current + 1);
  };

  return (
    <div className="space-y-6" data-version={viewVersion}>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Provider dashboard</h1>
        <p className="text-sm text-slate-600">Manage your jobs, track completions, and gather customer feedback.</p>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-lg text-slate-900">Availability</h2>
          <p className="text-sm text-slate-600">
            {isAvailable ? "Customers can see that you are available for work." : "You are hidden from new work requests."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isAvailable}
          onClick={handleAvailabilityChange}
          className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${isAvailable ? "bg-green-600 hover:bg-green-700" : "bg-slate-500 hover:bg-slate-600"}`}
        >
          {isAvailable ? "Available for Work" : "Unavailable"}
        </button>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="text-brand-600" />
            <h2 className="font-semibold text-lg text-slate-900">Incoming jobs</h2>
          </div>
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-sm text-slate-500">No job requests yet.</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between gap-3 items-start">
                    <div>
                      <p className="font-semibold text-slate-900">{booking.customerName || "Customer"}</p>
                      <p className="text-xs text-slate-500">{booking.service} • {booking.neighborhood}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[booking.status] || "bg-slate-100 text-slate-700"}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{booking.description || "No extra notes provided."}</p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(booking.id, "approved")}
                      className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(booking.id, "completed")}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Mark complete
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(booking.id, "rejected")}
                      className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="text-brand-600" />
            <h2 className="font-semibold text-lg text-brand-900">Review summary</h2>
          </div>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-bold text-brand-900">{averageRating || "0.0"}</span>
            <span className="text-sm text-brand-700">avg. rating</span>
          </div>
          <div className="space-y-2">
            {reviews.length === 0 ? (
              <p className="text-sm text-brand-700">No reviews yet. Complete jobs to build trust.</p>
            ) : (
              reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-white border border-brand-100 rounded-lg p-3">
                  <p className="font-medium text-slate-900">{review.customerName}</p>
                  <p className="text-sm text-slate-600">{review.comment}</p>
                  <p className="text-xs text-brand-700 mt-1">{review.rating}/5</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Portfolio photographs</h2>
        <p className="mb-4 text-sm text-slate-600">
          Add up to 4 images, each 500 KB or smaller. Images stay in this browser demo.
        </p>
        <form onSubmit={handlePortfolioUpload} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            name="portfolioFile"
            accept="image/*"
            aria-label="Choose a portfolio image"
            disabled={isAddingPhoto || portfolio.length >= 4}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700"
          />
          <button
            type="submit"
            disabled={isAddingPhoto || portfolio.length >= 4}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {isAddingPhoto ? "Saving..." : "Add photo"}
          </button>
        </form>
        {portfolioMessage && (
          <p role="status" className="mb-4 text-sm text-slate-600">{portfolioMessage}</p>
        )}
        {portfolio.length === 0 ? (
          <p className="text-sm text-slate-500">No portfolio images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {portfolio.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-lg border border-slate-200">
                <img src={photo.dataUrl} alt={photo.name} className="h-32 w-full object-cover" />
                <figcaption className="flex items-center justify-between gap-2 p-2">
                  <span className="truncate text-xs text-slate-600">{photo.name}</span>
                  <button
                    type="button"
                    onClick={() => handlePortfolioRemove(photo.id)}
                    className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                    aria-label={`Remove ${photo.name}`}
                  >
                    Remove
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
