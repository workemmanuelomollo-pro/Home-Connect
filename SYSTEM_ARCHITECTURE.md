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
