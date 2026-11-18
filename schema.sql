-- ==========================================
-- HOME SERVICE CONNECT - POSTGRESQL SCHEMA
-- Phase 2: Production Database Architecture
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    account_status VARCHAR(50) DEFAULT 'active', -- active, suspended, deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICE CATEGORIES (e.g., Plumbing, Electrical)
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ESTATES (Locations)
CREATE TABLE estates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_name VARCHAR(150) NOT NULL,
    neighborhood VARCHAR(150),
    county VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROVIDER PROFILES
CREATE TABLE provider_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    description TEXT,
    experience_years INT CHECK (experience_years >= 0),
    starting_price DECIMAL(10, 2) CHECK (starting_price >= 0),
    availability VARCHAR(50) DEFAULT 'available', -- available, busy, offline
    approval_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROVIDER SERVICES (Many-to-Many)
CREATE TABLE provider_services (
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, service_id)
);

-- 6. PROVIDER AREAS (Many-to-Many)
CREATE TABLE provider_areas (
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    estate_id UUID REFERENCES estates(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, estate_id)
);

-- 7. BOOKINGS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    urgency VARCHAR(50) NOT NULL, -- Today (High), This week, Flexible
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BOOKING EVENTS (Audit Trail)
CREATE TABLE booking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. VERIFICATIONS (ID checks, background checks)
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    verification_type VARCHAR(100) NOT NULL, -- ID, Background Check
    status VARCHAR(50) DEFAULT 'pending', -- pending, verified, failed
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REPORTS (Admin moderation)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, investigating, resolved
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PROVIDER PORTFOLIOS
CREATE TABLE provider_portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL, -- e.g., "Kitchen sink repair"
    description TEXT,
    image_url_before VARCHAR(500), -- Stored in Supabase Storage
    image_url_after VARCHAR(500),  -- Stored in Supabase Storage
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PROVIDER AVAILABILITY (Advanced Calendar)
CREATE TABLE provider_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
