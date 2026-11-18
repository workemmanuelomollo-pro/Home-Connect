# System Architecture & User Journeys

This document outlines the core user flows and the architectural decisions behind the Home Service Connect platform.

## 📱 The WhatsApp Integration Decision
While Home Service Connect acts as the primary directory and database, WhatsApp remains the primary communication channel (as it is the most used messaging app in Kenya).

**The Booking Flow:**
1. Customer submits a booking form on Home Service Connect.
2. **Home Connect saves the request in the database (status: `pending`).**
3. The system generates a unique booking reference.
4. The customer is redirected to WhatsApp with a pre-filled message containing the booking details and reference.
5. The provider responds on WhatsApp.
6. The provider or administrator logs into the Home Connect dashboard to update the booking status (`accepted`, `completed`, etc.).

**Crucial Rule:** Opening WhatsApp does *not* automatically mark a booking as accepted. The database state is only changed manually by the provider via the dashboard, ensuring accurate tracking and accountability.

---

## 🗺️ User Journeys

### 1. Customer Journey
1. Visit Home Connect.
2. Select their estate or neighborhood.
3. Choose a service category (e.g., Plumbing, Cleaning).
4. View matching service providers.
5. Open a provider's profile (viewing ratings, portfolio, and verification badges).
6. Submit a booking request.
7. Provider receives the request (via WhatsApp + Dashboard).
8. Provider accepts or responds.
9. Job is completed.
10. Customer leaves a review on the platform.

### 2. Service Provider Journey
1. Register as a user, then apply as a provider.
2. Complete professional profile (bio, experience, starting price).
3. Select trades and operating areas (Estates).
4. Submit verification information (ID / Background check).
5. Administrator reviews application.
6. Approved profile becomes discoverable on the public marketplace.
7. Receive and respond to booking requests.
8. Update job progress (Pending -> Accepted -> Completed) via the Provider Dashboard.

### 3. Administrator Journey
1. Sign in to the protected Admin dashboard (requires secure role).
2. Review pending provider applications.
3. Check submitted verification evidence.
4. Approve, reject, or request additional information from providers.
5. Monitor booking requests and customer complaints/reports.
6. Manage categories, locations (estates), and user accounts (suspend/reactivate).

---

## Booking Status Lifecycle

To maintain data integrity and clear communication, a booking follows a strict state machine. A booking cannot skip steps, and statuses can only be updated by authorized users (the assigned Provider or an Administrator).

### The States
1. **Pending:** The customer has submitted a request via the platform, but no action has been taken yet.
2. **Contact Initiated:** The customer has clicked the WhatsApp button, and the initial conversation has started.
3. **Accepted:** The provider has reviewed the request and formally confirmed they will take the job.
4. **In Progress:** The provider has started the work.
5. **Completed:** The provider has finished the job. (This unlocks the customer's ability to leave a review).
6. **Cancelled:** The customer or provider cancelled the job before completion.

*(Future states to be added: **Declined** by provider, or **Expired** if the customer doesn't respond for 48 hours.)*

### Audit Trail & Security Rules
- **Authorized Updates Only:** Customers cannot mark their own job as "Completed". Providers cannot mark a job as "Cancelled" after it is "In Progress" without an Admin override.
- **Immutable History:** Every time a status changes, the system must record it in the `booking_events` table. This creates an audit trail (who changed it, from what status, to what status, and at what time). If a dispute arises, the Admin can review the exact timeline of events.

---

## Provider Availability & Portfolio

To provide a premium experience, providers are not limited to a simple "Online/Offline" toggle. They require a flexible calendar system and a visual portfolio to win trust.

### 1. Availability Calendar
- **Current MVP:** Providers can toggle a simple "Available for Work" status on their dashboard.
- **Phase 2 (Production):** Providers will have a dynamic calendar. They can mark themselves as:
  - `Available Now` (Instant booking)
  - `Unavailable` (On holiday or fully booked)
  - `Scheduled Availability` (e.g., "Available Mondays and Wednesdays from 8 AM to 5 PM").
- **Customer View:** Customers will only see providers who are available based on the requested urgency (e.g., a "Today (High)" urgency will hide providers marked unavailable).

### 2. Professional Portfolio
- **Current MVP:** The Provider Dashboard contains a placeholder for portfolio images.
- **Phase 2 (Production):**
  - **Visual Proof:** Fundis can upload "Before and After" photos of completed jobs.
  - **Qualifications:** Providers can upload certificates (e.g., NITA certifications for electricians).
  - **Storage Strategy:** To keep the database fast, image files will not be stored in PostgreSQL. Instead, they will be stored in **Supabase Storage** (or AWS S3), and only the secure URLs/paths will be saved in the database.
  - **Public Profile:** Customers can view this portfolio before deciding to book.
