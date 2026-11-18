import { categories, neighborhoods } from "../config/site";

export const STORAGE_KEYS = {
  users: "hsc_users",
  session: "hsc_session",
  bookings: "hsc_bookings",
  reviews: "hsc_reviews",
  reports: "hsc_reports",
  categories: "hsc_categories",
  neighborhoods: "hsc_neighborhoods",
};

export function readStorageJSON(key, fallback = []) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorageJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.error(`Failed to write local demo data for "${key}".`);
    return false;
  }
}

export function getStoredUsers() {
  return readStorageJSON(STORAGE_KEYS.users, []);
}

export function updateStoredUser(userId, updates) {
  const users = getStoredUsers();
  const userIndex = users.findIndex((user) => user.uid === userId);
  if (userIndex === -1) return false;

  users[userIndex] = { ...users[userIndex], ...updates };
  return writeStorageJSON(STORAGE_KEYS.users, users);
}

export function getStoredBookings() {
  return readStorageJSON(STORAGE_KEYS.bookings, []);
}

export function getStoredReviews() {
  return readStorageJSON(STORAGE_KEYS.reviews, []);
}

export function getStoredReports() {
  return readStorageJSON(STORAGE_KEYS.reports, []);
}

export function getManagedCategories() {
  const saved = readStorageJSON(STORAGE_KEYS.categories, null);
  return Array.isArray(saved) ? saved : categories;
}

export function saveManagedCategories(nextCategories) {
  return writeStorageJSON(STORAGE_KEYS.categories, nextCategories);
}

export function getManagedNeighborhoods() {
  const saved = readStorageJSON(STORAGE_KEYS.neighborhoods, null);
  return Array.isArray(saved) ? saved : neighborhoods;
}

export function saveManagedNeighborhoods(nextNeighborhoods) {
  return writeStorageJSON(STORAGE_KEYS.neighborhoods, nextNeighborhoods);
}

export function addBooking(booking) {
  const bookings = getStoredBookings();
  const nextBooking = {
    id: `booking-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    ...booking,
  };

  if (!writeStorageJSON(STORAGE_KEYS.bookings, [...bookings, nextBooking])) {
    throw new Error("Could not save this booking in the browser.");
  }
  return nextBooking;
}

export function setBookingStatus(bookingId, status) {
  const bookings = getStoredBookings();
  if (!bookings.some((booking) => booking.id === bookingId)) return false;

  const nextBookings = bookings.map((booking) =>
    booking.id === bookingId ? { ...booking, status } : booking,
  );

  if (!writeStorageJSON(STORAGE_KEYS.bookings, nextBookings)) {
    throw new Error("Could not save the booking update in the browser.");
  }
  return nextBookings;
}

export function addReview(review) {
  const reviews = getStoredReviews();
  if (
    review.bookingId &&
    reviews.some(
      (storedReview) =>
        storedReview.bookingId === review.bookingId &&
        storedReview.customerId === review.customerId,
    )
  ) {
    throw new Error("A review has already been submitted for this booking.");
  }

  const nextReview = {
    id: `review-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    ...review,
  };

  if (!writeStorageJSON(STORAGE_KEYS.reviews, [...reviews, nextReview])) {
    throw new Error("Could not save this review in the browser.");
  }
  return nextReview;
}

export function setReviewStatus(reviewId, status) {
  const reviews = getStoredReviews();
  const reviewIndex = reviews.findIndex((review) => review.id === reviewId);
  if (reviewIndex === -1) return false;

  reviews[reviewIndex] = { ...reviews[reviewIndex], status };
  return writeStorageJSON(STORAGE_KEYS.reviews, reviews);
}

export function addReport(report) {
  const reports = getStoredReports();
  const duplicate = reports.some(
    (storedReport) =>
      storedReport.bookingId === report.bookingId &&
      storedReport.customerId === report.customerId &&
      storedReport.status !== "resolved" &&
      storedReport.status !== "dismissed",
  );
  if (duplicate) {
    throw new Error("You already have an open report for this booking.");
  }

  const nextReport = {
    id: `report-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    ...report,
  };
  if (!writeStorageJSON(STORAGE_KEYS.reports, [...reports, nextReport])) {
    throw new Error("Could not save this report in the browser.");
  }
  return nextReport;
}

export function setReportStatus(reportId, status) {
  const reports = getStoredReports();
  const reportIndex = reports.findIndex((report) => report.id === reportId);
  if (reportIndex === -1) return false;

  reports[reportIndex] = { ...reports[reportIndex], status };
  return writeStorageJSON(STORAGE_KEYS.reports, reports);
}
