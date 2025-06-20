WITH inserted_profile AS (
  -- Insert a dummy profile
  INSERT INTO profiles (
    id,
    full_name,
    phone_number,
    created_at,
    updated_at
  ) VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'Test User',
    '+90 555 555 5555',
    NOW(),
    NOW()
  ) RETURNING id
),
inserted_land AS (
  -- Insert a dummy land listing
  INSERT INTO land_listings (
    id,
    title,
    description,
    location,
    area_size,
    area_unit,
    images,
    owner_id,
    status,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'Güzel Manzaralı Arsa',
    'Deniz manzaralı, imar izni olan, yatırımlık arsa. Elektrik ve su altyapısı mevcut.',
    'İzmir, Çeşme',
    1000,
    'm²',
    ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef'],
    (SELECT id FROM inserted_profile),
    'under_auction',
    NOW(),
    NOW()
  ) RETURNING id
)
-- Insert a dummy auction for the land listing
INSERT INTO auctions (
  id,
  land_id,
  start_price,
  min_increment,
  start_time,
  end_time,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM inserted_land),
  1000000,
  50000,
  NOW(),
  NOW() + INTERVAL '7 days',
  'active',
  NOW(),
  NOW()
); 