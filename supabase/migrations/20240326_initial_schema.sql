-- Create profiles table that extends the auth.users table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create land_listings table
CREATE TABLE IF NOT EXISTS land_listings (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    area_size DECIMAL NOT NULL,
    area_unit TEXT NOT NULL,
    coordinates POINT,
    images TEXT[],
    owner_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'under_auction', 'sold', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create auctions table
CREATE TABLE IF NOT EXISTS auctions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    land_id UUID REFERENCES land_listings(id) ON DELETE CASCADE,
    start_price DECIMAL NOT NULL,
    min_increment DECIMAL NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended', 'cancelled')),
    winner_id UUID REFERENCES profiles(id),
    final_price DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES profiles(id),
    amount DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER set_timestamp_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_land_listings
    BEFORE UPDATE ON land_listings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_auctions
    BEFORE UPDATE ON auctions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Create Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Land listings policies
CREATE POLICY "Land listings are viewable by everyone"
    ON land_listings FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own land listings"
    ON land_listings FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own land listings"
    ON land_listings FOR UPDATE
    USING (auth.uid() = owner_id);

-- Auctions policies
CREATE POLICY "Auctions are viewable by everyone"
    ON auctions FOR SELECT
    USING (true);

CREATE POLICY "Only land owners can create auctions"
    ON auctions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM land_listings
        WHERE land_listings.id = land_id
        AND land_listings.owner_id = auth.uid()
    ));

-- Bids policies
CREATE POLICY "Bids are viewable by everyone"
    ON bids FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can place bids"
    ON bids FOR INSERT
    WITH CHECK (auth.uid() = bidder_id); 