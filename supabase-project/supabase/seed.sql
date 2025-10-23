-- Seed data for webshops-specs project
-- This file will be executed after migrations when running `supabase db reset`

-- Insert sample data
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@webshops.com', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'user@webshops.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample products table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample products
INSERT INTO public.products (name, description, price, category, image_url) VALUES
  ('iPhone 15 Pro', 'Latest iPhone with advanced features', 999.99, 'Electronics', 'https://example.com/iphone15.jpg'),
  ('MacBook Air M3', '13-inch laptop with M3 chip', 1299.99, 'Electronics', 'https://example.com/macbook.jpg'),
  ('Nike Air Max', 'Comfortable running shoes', 129.99, 'Footwear', 'https://example.com/nike.jpg'),
  ('Samsung Galaxy Watch', 'Smart watch with health monitoring', 399.99, 'Electronics', 'https://example.com/watch.jpg')
ON CONFLICT DO NOTHING;

-- Create sample orders table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample orders
INSERT INTO public.orders (user_id, total_amount, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 1299.99, 'completed'),
  ('550e8400-e29b-41d4-a716-446655440002', 529.98, 'pending')
ON CONFLICT DO NOTHING;

-- Create sample order items table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample order items
INSERT INTO public.order_items (order_id, product_id, quantity, price) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.products WHERE name = 'MacBook Air M3' LIMIT 1), 1, 1299.99),
  ('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.products WHERE name = 'Nike Air Max' LIMIT 1), 2, 129.99),
  ('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.products WHERE name = 'Samsung Galaxy Watch' LIMIT 1), 1, 399.99)
ON CONFLICT DO NOTHING;
