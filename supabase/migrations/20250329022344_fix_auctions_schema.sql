-- migration:20250329022344

-- Check if auctions table exists, if not create it from scratch with all required fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auctions') THEN
        CREATE TABLE public.auctions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            starting_price NUMERIC(10, 2) DEFAULT 0,
            start_date TIMESTAMPTZ,
            end_date TIMESTAMPTZ,
            location TEXT,
            status TEXT DEFAULT 'upcoming'::text CHECK (status IN ('upcoming', 'active', 'ended', 'cancelled')),
            created_by UUID REFERENCES auth.users(id),
            images TEXT[] DEFAULT '{}'::TEXT[],
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- Add indexes for better performance
        CREATE INDEX auctions_status_idx ON public.auctions(status);
        CREATE INDEX auctions_created_by_idx ON public.auctions(created_by);
    ELSE
        -- If table exists, make sure all needed columns exist
        -- Add title column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'title'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN title TEXT NOT NULL DEFAULT 'No Title';
        END IF;

        -- Add other columns if they don't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'description'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN description TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'starting_price'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN starting_price NUMERIC(10, 2) DEFAULT 0;
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'start_date'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN start_date TIMESTAMPTZ;
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'end_date'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN end_date TIMESTAMPTZ;
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'location'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN location TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'status'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN status TEXT DEFAULT 'upcoming'::text;
            -- Add check constraint for status values
            ALTER TABLE public.auctions ADD CONSTRAINT auctions_status_check CHECK (status IN ('upcoming', 'active', 'ended', 'cancelled'));
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'created_by'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN created_by UUID REFERENCES auth.users(id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'images'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN images TEXT[] DEFAULT '{}'::TEXT[];
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'created_at'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE public.auctions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
        END IF;

        -- Make sure starting_price is the correct type
        ALTER TABLE public.auctions ALTER COLUMN starting_price TYPE NUMERIC(10, 2);

        -- Add constraint for non-negative starting_price if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM pg_constraint WHERE conname = 'starting_price_non_negative'
        ) THEN
            ALTER TABLE public.auctions ADD CONSTRAINT starting_price_non_negative CHECK (starting_price >= 0);
        END IF;

        -- Add indexes if they don't exist
        IF NOT EXISTS (
            SELECT FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'auctions' AND indexname = 'auctions_status_idx'
        ) THEN
            CREATE INDEX auctions_status_idx ON public.auctions(status);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'auctions' AND indexname = 'auctions_created_by_idx'
        ) THEN
            CREATE INDEX auctions_created_by_idx ON public.auctions(created_by);
        END IF;
    END IF;
END
$$;
