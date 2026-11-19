import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle,
  Eye,
  FileText,
  Search,
  ShieldAlert,
  Star,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { collection, doc, getDocs, query, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  getStoredBookings,
  getStoredReviews,
  getStoredUsers,
  setReviewStatus,
  updateStoredUser,
} from "../lib/demoStore";

function mergeRecords(localRecords, remoteRecords, getId) {
  const records = new Map();
  localRecords.forEach((record) => {
    const id = getId(record);
    if (id) records.set(id, record);
  });
  remoteRecords.forEach((record) => {
    const id = getId(record);
    if (id) records.set(id, { ...records.get(id), ...record });
  });
  return [...records.values()];
}

function normalizeSearch(value) {
  return String(value || "").trim().toLowerCase();
}

async function loadAdminData() {
  const [userSnapshot, bookingSnapshot] = await Promise.all([
    getDocs(query(collection(db, "users"))),
    getDocs(query(collection(db, "bookings"))),
  ]);
  const remoteUsers = userSnapshot.docs.map((userDocument) => ({
    ...userDocument.data(),
    id: userDocument.id,
    uid: userDocument.id,
  }));
  const remoteBookings = bookingSnapshot.docs.map((bookingDocument) => ({
    ...bookingDocument.data(),
    id: bookingDocument.id,
  }));

  return {
    users: mergeRecords(getStoredUsers(), remoteUsers, (user) => user.uid || user.id),
    bookings: mergeRecords(
      getStoredBookings(),
      remoteBookings,
      (booking) => booking.id,
    ),
    reviews: getStoredReviews().filter((review) => review.status === "pending"),
  };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applications");
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [updatingReviewId, setUpdatingReviewId] = useState(null);
  const [error, setError] = useState("");

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await loadAdminData();
      setUsers(data.users);
      setBookings(data.bookings);
      setReviews(data.reviews);
    } catch (fetchError) {
      console.error("Failed to fetch admin data:", fetchError);
      setError("Could not load admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadAdminData()
      .then((data) => {
        if (active) {
          setUsers(data.users);
          setBookings(data.bookings);
          setReviews(data.reviews);
        }
      })
      .catch((fetchError) => {
        console.error("Failed to fetch admin data:", fetchError);
        if (active) setError("Could not load admin data. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const pendingApplications = useMemo(
    () => users.filter((user) => user.applicationStatus === "pending"),
    [users],
  );
  const filteredUsers = useMemo(() => {
    const searchTerm = normalizeSearch(search);
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        normalizeSearch(user.name).includes(searchTerm) ||
        normalizeSearch(user.email).includes(searchTerm),
    );
  }, [search, users]);

  const updateUser = async (userId, updates) => {
    setUpdatingUserId(userId);
    setError("");

    try {
      await updateDoc(doc(db, "users", userId), updates);
      updateStoredUser(userId, updates);
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          (user.uid || user.id) === userId ? { ...user, ...updates } : user,
        ),
      );
      setSelectedUser((currentUser) =>
        currentUser && (currentUser.uid || currentUser.id) === userId
          ? { ...currentUser, ...updates }
          : currentUser,
      );
      return true;
    } catch (updateError) {
      console.error("Failed to update user:", updateError);
      setError("Could not update this account. Please try again.");
      return false;
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleApprove = async (userId) => {
    if (
      await updateUser(userId, {
        role: "provider",
        applicationStatus: "approved",
      })
    ) {
      setSelectedUser(null);
    }
  };

  const handleReject = async (userId) => {
    if (await updateUser(userId, { applicationStatus: "rejected" })) {
      setSelectedUser(null);
    }
  };

  const handleSuspend = (userId) => {
    updateUser(userId, { accountStatus: "suspended" });
  };

  const handleReviewUpdate = async (reviewId, status) => {
    setUpdatingReviewId(reviewId);
    setError("");

    try {
      if (!setReviewStatus(reviewId, status)) {
        throw new Error("Review could not be saved.");
      }
      setReviews(getStoredReviews().filter((review) => review.status === "pending"));
    } catch (reviewError) {
      console.error("Failed to moderate review:", reviewError);
      setError("Could not update this review. Please try again.");
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const tabs = [
    { id: "applications", label: `Pending Applications (${pendingApplications.length})`, Icon: FileText },
    { id: "users", label: `All Users (${users.length})`, Icon: Users },
    { id: "bookings", label: `Monitor Bookings (${bookings.length})`, Icon: Briefcase },
    { id: "reviews", label: `Pending Reviews (${reviews.length})`, Icon: Star },
  ];

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900">
        <ShieldAlert className="text-red-600" /> Administrator Control Center
      </h1>

      <div className="mb-6 flex gap-4 overflow-x-auto border-b border-slate-200">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap pb-2 font-semibold ${
              activeTab === id
                ? "border-b-2 border-brand-600 text-brand-700"
                : "text-slate-500"
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
          <button type="button" onClick={fetchAdminData} className="ml-2 font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading admin data...</p>
      ) : (
        <>
          {activeTab === "applications" && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <h2 className="border-b border-slate-200 bg-slate-50 p-4 font-semibold text-slate-700">
                Pending Provider Approvals
              </h2>
              <div className="divide-y divide-slate-100">
                {pendingApplications.length === 0 ? (
                  <p className="p-8 text-center text-slate-500">
                    No pending applications right now.
                  </p>
                ) : (
                  pendingApplications.map((application) => (
                    <div
                      key={application.uid || application.id}
                      className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="flex items-center gap-2 font-semibold text-slate-900">
                          <User size={16} /> {application.name || "Unnamed user"}
                        </p>
                        <p className="text-sm text-slate-500">{application.email}</p>
                        <p className="mt-1 text-xs font-medium text-brand-600">
                          Requested: {application.providerData?.service || "Service not specified"}
                          {application.providerData?.area
                            ? ` in ${application.providerData.area}`
                            : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(application)}
                        className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-200"
                      >
                        <Eye size={16} /> Inspect Profile
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === "users" && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4">
                <h2 className="font-semibold text-slate-700">Platform Directory</h2>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    placeholder="Search users..."
                    aria-label="Search users"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="rounded-lg border border-slate-300 py-1.5 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="max-h-[500px] divide-y divide-slate-100 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="p-8 text-center text-slate-500">No users found.</p>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.uid || user.id}
                      className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {user.name || "Unnamed user"}
                          <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs capitalize text-slate-600">
                            {user.role || "customer"}
                          </span>
                          {user.accountStatus === "suspended" && (
                            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                              Suspended
                            </span>
                          )}
                        </p>
                        <p className="truncate text-sm text-slate-500">{user.email}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="text-sm font-semibold text-brand-600 hover:underline"
                        >
                          View Profile
                        </button>
                        {user.accountStatus !== "suspended" && user.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() => handleSuspend(user.uid || user.id)}
                            disabled={updatingUserId !== null}
                            className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === "bookings" && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <h2 className="border-b border-slate-200 bg-slate-50 p-4 font-semibold text-slate-700">
                All Platform Bookings
              </h2>
              <div className="max-h-[500px] divide-y divide-slate-100 overflow-y-auto">
                {bookings.length === 0 ? (
                  <p className="p-8 text-center text-slate-500">No bookings recorded yet.</p>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="p-4">
                      <p className="font-semibold text-slate-900">
                        {booking.service || "Home service"} - {booking.customerName || "Customer"} booked{" "}
                        {booking.providerName || "Provider"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Status:{" "}
                        <span className="font-bold capitalize text-brand-600">
                          {booking.status || "pending"}
                        </span>
                        {booking.urgency ? ` · Urgency: ${booking.urgency}` : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === "reviews" && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <h2 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-4 font-semibold text-slate-700">
                <Star size={18} /> Pending Review Moderation
              </h2>
              <div className="divide-y divide-slate-100">
                {reviews.length === 0 ? (
                  <p className="p-8 text-center text-slate-500">No pending reviews right now.</p>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
                    >
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
                          onClick={() => handleReviewUpdate(review.id, "approved")}
                          disabled={updatingReviewId !== null}
                          className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                          aria-label={`Approve review by ${review.customerName || "customer"}`}
                          title="Approve review"
                        >
                          <CheckCircle />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewUpdate(review.id, "rejected")}
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
            </section>
          )}
        </>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-profile-title"
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-5">
              <h2 id="admin-user-profile-title" className="text-xl font-bold text-slate-800">
                Verification Profile
              </h2>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-500 hover:text-red-500"
                aria-label="Close profile"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
                  {selectedUser.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {selectedUser.name || "Unnamed user"}
                  </p>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
                    {selectedUser.role || "customer"}
                  </p>
                </div>
              </div>

              {selectedUser.providerData && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-2 text-sm font-bold text-slate-700">
                    Professional Details
                  </h3>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Service:</span>{" "}
                    {selectedUser.providerData.service || "N/A"}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Area:</span>{" "}
                    {selectedUser.providerData.area || "N/A"}
                  </p>
                </div>
              )}
            </div>

            {selectedUser.applicationStatus === "pending" && (
              <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-4">
                <button
                  type="button"
                  onClick={() => handleReject(selectedUser.uid || selectedUser.id)}
                  disabled={updatingUserId !== null}
                  className="flex-1 rounded-xl border border-red-200 bg-white py-3 font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedUser.uid || selectedUser.id)}
                  disabled={updatingUserId !== null}
                  className="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Approve Provider
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
