-- Create bikes table
CREATE TABLE bikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Scooter', 'Adventure', 'SuperSport', 'Nakedbike')),
    license_category TEXT NOT NULL CHECK (license_category IN ('A', 'A2', 'B')),
    engine TEXT NOT NULL,
    power TEXT NOT NULL,
    description TEXT,
    deposit INTEGER NOT NULL,
    rental_fee INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bike_id UUID REFERENCES bikes(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Constraint: 1 bike per person per day (simplified as 1 reservation per email per day per bike)
    UNIQUE(email, reservation_date, bike_id)
);

-- Enable RLS
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policies for bikes
-- Public can READ bikes
CREATE POLICY "Public can read bikes" ON bikes
    FOR SELECT USING (true);

-- Authenticated admins can do everything on bikes
CREATE POLICY "Admins can manage bikes" ON bikes
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' LIKE '%@nina-x.cz') -- Example admin check
    WITH CHECK (auth.jwt() ->> 'email' LIKE '%@nina-x.cz');

-- Policies for reservations
-- Public can INSERT reservations
CREATE POLICY "Public can insert reservations" ON reservations
    FOR INSERT WITH CHECK (true);

-- Authenticated admins can READ and DELETE reservations
CREATE POLICY "Admins can manage reservations" ON reservations
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' LIKE '%@nina-x.cz')
    WITH CHECK (auth.jwt() ->> 'email' LIKE '%@nina-x.cz');
