import { useCallback, useEffect, useState } from "react";
import { CheckCircle, ShieldAlert, Star, XCircle } from "lucide-react";
import { getStoredReviews, setReviewStatus } from "../lib/demoStore";

function readUsers() {
  try {
    const stored = window.localStorage.getItem("hsc_users");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function loadPendingApplications() {
  return readUsers().filter((user) => user.applicationStatus === "pending");
}

async function loadPendingReviews() {
  return getStoredReviews().filter((review) => review.status === "pending");
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [updatingReviewId, setUpdatingReviewId] = useState(null);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      const [pendingApplications, pendingReviews] = await Promise.all([
        loadPendingApplications(),
        loadPendingReviews(),
      ]);
      setApplications(pendingApplications);
      setReviews(pendingReviews);
    } catch (fetchError) {
      console.error("Failed to fetch provider applications:", fetchError);
      setError("Could not load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([loadPendingApplications(), loadPendingReviews()])
      .then(([loadedApplications, loadedReviews]) => {
        if (active) {
          setApplications(loadedApplications);
          setReviews(loadedReviews);
        }
      })
      .catch((fetchError) => {
        console.error("Failed to fetch provider applications:", fetchError);
        if (active) setError("Could not load applications. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const retryApplications = () => {
    setLoading(true);
    setError("");
    fetchApplications();
  };

  const updateApplication = async (userId, updates) => {
    setUpdatingUserId(userId);
    setError("");

    try {
      const users = readUsers();
      const targetUserIndex = users.findIndex((user) => user.uid === userId);

      if (targetUserIndex === -1) {
        throw new Error("Application not found.");
      }

      users[targetUserIndex] = {
        ...users[targetUserIndex],
        ...updates,
      };

      window.localStorage.setItem("hsc_users", JSON.stringify(users));
      await fetchApplications();
    } catch (updateError) {
      console.error("Failed to update provider application:", updateError);
      setError("Could not update this application. Please try again.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const updateReview = async (reviewId, status) => {
    setUpdatingReviewId(reviewId);
    setError("");

    try {
      if (!setReviewStatus(reviewId, status)) {
        throw new Error("Review could not be saved.");
      }
      setReviews(await loadPendingReviews());
    } catch (reviewError) {
      console.error("Failed to moderate review:", reviewError);
      setError("Could not update this review. Please try again.");
    } finally {
      setUpdatingReviewId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <ShieldAlert className="text-red-600" /> Administrator Panel
      </h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
          Pending Provider Approvals
        </div>
        <div className="divide-y divide-slate-100">
          {error && (
            <div role="alert" className="p-4 text-center text-red-600">
              {error}
              <button
                type="button"
                onClick={retryApplications}
                className="ml-2 underline"
              >
                Retry
              </button>
            </div>
          )}
          {loading ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              No pending applications right now.
            </div>
          ) : (
            applications.map((application) => (
              <div
                key={application.uid}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {application.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {application.providerData?.service} • {application.providerData?.area}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateApplication(application.uid, {
                        role: "provider",
                        applicationStatus: "approved",
                      })
                    }
                    disabled={updatingUserId !== null}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                    title="Approve"
                    aria-label={`Approve ${application.name || "application"}`}
                  >
                    <CheckCircle />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateApplication(application.uid, {
                        applicationStatus: "rejected",
                      })
                    }
                    disabled={updatingUserId !== null}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Reject"
                    aria-label={`Reject ${application.name || "application"}`}
                  >
                    <XCircle />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-4 font-semibold text-slate-700">
          <Star size={18} /> Pending Review Moderation
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : reviews.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No pending reviews right now.</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-slate-900">
                    {review.providerName} · {review.rating}/5
                  </p>
                  <p className="text-sm text-slate-600">{review.comment}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    By {review.customerName} · Booking {review.bookingId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateReview(review.id, "approved")}
                    disabled={updatingReviewId !== null}
                    className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                    aria-label={`Approve review by ${review.customerName || "customer"}`}
                    title="Approve review"
                  >
                    <CheckCircle />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateReview(review.id, "rejected")}
                    disabled={updatingReviewId !== null}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    aria-label={`Reject review by ${review.customerName || "customer"}`}
                    title="Reject review"
                  >
                    <XCircle />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
