-- SmartEyes Database Seed Script
-- Run: docker exec -i smarteyes-postgres psql -U postgres -d smart_residential < backend/seed.sql

-- Create demo building
INSERT INTO buildings (id, name, code, address, city, location, contact_email, contact_phone, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'SmartEyes Demo Building',
  'DEMO',
  '1 Nguyễn Hữu Thọ, Quận 7, TP.HCM',
  'Hồ Chí Minh',
  '{"lat": 10.7321, "lng": 106.6992}',
  'admin@smarteyes-demo.vn',
  '0901234567',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (code) DO NOTHING
RETURNING id;

-- Temporary variable for building_id
DO $$
DECLARE
  building_uuid UUID;
BEGIN
  SELECT id INTO building_uuid FROM buildings WHERE code = 'DEMO' LIMIT 1;

  -- Super Admin (no building)
  INSERT INTO users (id, email, password, full_name, role, status, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'superadmin@smarteyes.vn',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password = 'Admin@123456' hashed
    'Super Administrator',
    'super_admin',
    'active',
    NOW(),
    NOW()
  ) ON CONFLICT (email) DO NOTHING;

  -- Admin (with building)
  INSERT INTO users (id, email, password, full_name, role, status, building_id, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'admin@smarteyes.vn',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password = 'Admin@123456' hashed
    'Building Admin',
    'admin',
    'active',
    building_uuid,
    NOW(),
    NOW()
  ) ON CONFLICT (email) DO NOTHING;

  -- Security Guard
  INSERT INTO users (id, email, password, full_name, role, status, building_id, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'security@smarteyes.vn',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password = 'Admin@123456' hashed
    'Security Guard',
    'security',
    'active',
    building_uuid,
    NOW(),
    NOW()
  ) ON CONFLICT (email) DO NOTHING;

  RAISE NOTICE 'Building ID used: %', building_uuid;
END $$;
