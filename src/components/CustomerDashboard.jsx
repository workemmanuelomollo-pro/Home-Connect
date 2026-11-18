import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ApplyModal from "./ApplyModal";
import { AlertCircle, CheckCircle, Clock, Star } from "lucide-react";
import { addReview, getStoredBookings, getStoredReviews } from "../lib/demoStore";

export default function CustomerDashboard() {
  const { user, applicationStatus, role } = useAuth();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  const bookings = user?.uid
    ? getStoredBookings().filter((booking) => booking.customerId === user.uid)
    : [];

  const reviews = user?.uid
    ? getStoredReviews()
        .filter((review) => review.customerId === user.uid)
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    : [];
  const completedBookings = bookings.filter((booking) => booking.status === "completed");
  const reviewableBookings = completedBookings.filter(
    (booking) => !reviews.some((review) => review.bookingId === booking.id),
  );

  const isProvider = role === "provider" || applicationStatus === "approved";

  const summary = {
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  const handleReviewSubmit = (event) => {
    event.preventDefault();
    const booking = reviewableBookings.find((item) => item.id === selectedBookingId);
    if (!booking || !feedback.trim()) {
      setReviewMessage("Choose a completed booking and enter your feedback.");
      return;
    }

    try {
      addReview({
        customerId: user.uid,
        customerName: user.displayName || user.name || "Customer",
        providerId: booking.providerId,
        providerName: booking.providerName,
        bookingId: booking.id,
        rating: Number(rating),
        comment: feedback.trim(),
      });
      setSelectedBookingId("");
      setFeedback("");
      setRating(5);
      setReviewMessage("Review submitted for admin moderation.");
    } catch (error) {
      console.error("Failed to submit customer review:", error);
      setReviewMessage(
        error instanceof Error ? error.message : "Could not submit the review. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Welcome, {user?.displayName || user?.name || "Customer"}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock className="text-brand-600" /> My Booking History
          </h2>
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-sm text-slate-500">You have no bookings yet.</p>
            ) : (
              bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between items-center gap-2">
                    <p className="font-medium text-slate-900">{booking.providerName}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">{booking.status}</span>
                  </div>
                  <p className="text-sm text-slate-600">{booking.service} • {booking.neighborhood}</p>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-slate-50 rounded-lg p-2"><div className="font-bold">{summary.pending}</div><div className="text-slate-500">Pending</div></div>
            <div className="bg-slate-50 rounded-lg p-2"><div className="font-bold">{summary.approved}</div><div className="text-slate-500">Accepted</div></div>
            <div className="bg-slate-50 rounded-lg p-2"><div className="font-bold">{summary.completed}</div><div className="text-slate-500">Done</div></div>
          </div>
        </div>

        <div className="bg-brand-50 p-6 rounded-xl border border-brand-200">
          <h2 className="font-semibold text-lg mb-2 text-brand-900">
            {isProvider ? "Provider status" : "Are you a handyman?"}
          </h2>

          {applicationStatus === "pending" ? (
            <div className="flex items-center gap-2 text-amber-600 font-medium text-sm mt-4">
              <AlertCircle size={18} /> Application Pending Admin Review
            </div>
          ) : applicationStatus === "approved" ? (
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm mt-4">
              <CheckCircle size={18} /> You are an approved provider! Check your dashboard.
            </div>
          ) : (
            <>
              <p className="text-sm text-brand-700 mb-4">
                Apply to become a verified provider and get clients directly via WhatsApp.
              </p>
              <button
                onClick={() => setIsApplyOpen(true)}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700"
              >
                Apply as a Provider
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><Star className="text-brand-600" /> My Reviews</h2>
        {reviewableBookings.length > 0 && (
          <form onSubmit={handleReviewSubmit} className="mb-6 space-y-3 rounded-lg bg-slate-50 p-4">
            <h3 className="font-medium text-slate-900">Review a completed job</h3>
            <label className="block text-sm font-medium text-slate-700">
              Completed booking
              <select
                required
                value={selectedBookingId}
                onChange={(event) => setSelectedBookingId(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white p-3"
              >
                <option value="" disabled>Select a completed booking</option>
                {reviewableBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.service} with {booking.providerName}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Rating
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white p-3"
              >
                {[5, 4, 3, 2, 1].map((score) => (
                  <option key={score} value={score}>{score} / 5</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Your feedback
              <textarea
                required
                minLength={3}
                maxLength={1000}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                rows="3"
                placeholder="How did the service go?"
                className="mt-1 block w-full resize-none rounded-lg border border-slate-200 p-3"
              />
            </label>
            <button
              type="submit"
              disabled={!selectedBookingId || !feedback.trim()}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              Submit review
            </button>
          </form>
        )}
        {reviewMessage && (
          <p role="status" className="mb-4 text-sm text-slate-600">{reviewMessage}</p>
        )}
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500">No reviews submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="border border-slate-200 rounded-lg p-3">
                <p className="font-medium text-slate-900">{review.providerName}</p>
                <p className="text-sm text-slate-600">{review.comment}</p>
                <p className="text-xs text-brand-700 mt-1">{review.rating}/5</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">Status: {review.status || "pending"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ApplyModal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} />
    </div>
  );
}
