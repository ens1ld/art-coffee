-- Sample products data with categories matching UI constants (lowercase)
-- Run this script in Supabase SQL Editor to populate your products table

-- Check if we have any existing products
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    -- Insert coffee products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Espresso', 'Our signature espresso shot, rich and bold', 2.50, 'coffee', '/images/espresso.png', false, false),
      ('Cappuccino', 'Espresso with steamed milk and velvety foam', 3.80, 'coffee', '/images/cappuccino.png', true, false),
      ('Latte', 'Espresso with steamed milk and a light layer of foam', 4.20, 'coffee', '/images/latte.png', false, false),
      ('Americano', 'Espresso diluted with hot water for a milder coffee', 3.50, 'coffee', '/images/americano.png', false, false),
      ('Mocha', 'Espresso with chocolate and steamed milk', 4.50, 'coffee', '/images/mocha.png', false, false);

    -- Insert tea products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Earl Grey', 'Classic black tea with bergamot', 2.80, 'tea', '/images/earl-grey.jpg', false, false),
      ('Green Tea', 'Delicate green tea with light floral notes', 2.80, 'tea', '/images/green-tea.jpg', false, false),
      ('Chai Latte', 'Spiced tea with steamed milk', 3.50, 'tea', '/images/chai-latte.jpg', true, false);

    -- Insert pastries products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Croissant', 'Buttery, flaky pastry', 2.50, 'pastries', '/images/croissant.jpg', false, false),
      ('Pain au Chocolat', 'Chocolate-filled pastry', 3.20, 'pastries', '/images/pain-au-chocolat.jpg', false, false),
      ('Almond Croissant', 'Croissant filled with almond cream', 3.50, 'pastries', '/images/almond-croissant.jpg', false, false);

    -- Insert breakfast products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Avocado Toast', 'Smashed avocado on toasted sourdough bread', 8.50, 'breakfast', '/images/avocado-toast.jpg', true, false),
      ('Granola Bowl', 'Yogurt with house-made granola and fresh fruits', 7.50, 'breakfast', '/images/granola-bowl.jpg', false, false),
      ('Breakfast Sandwich', 'Egg, cheese, and bacon on a brioche bun', 6.50, 'breakfast', '/images/breakfast-sandwich.jpg', false, false);

    -- Insert lunch products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Caprese Sandwich', 'Fresh mozzarella, tomato, and basil on ciabatta', 9.50, 'lunch', '/images/caprese-sandwich.jpg', false, false),
      ('Caesar Salad', 'Romaine lettuce with parmesan, croutons and Caesar dressing', 8.50, 'lunch', '/images/caesar-salad.jpg', false, false),
      ('Quinoa Bowl', 'Quinoa with roasted vegetables and tahini dressing', 10.50, 'lunch', '/images/quinoa-bowl.jpg', true, false);

    -- Insert desserts products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Chocolate Cake', 'Rich chocolate cake with ganache frosting', 5.50, 'desserts', '/images/chocolate-cake.jpg', false, false),
      ('Cheesecake', 'Creamy cheesecake with berry compote', 6.00, 'desserts', '/images/cheesecake.jpg', false, false),
      ('Tiramisu', 'Classic Italian dessert with coffee and mascarpone', 5.50, 'desserts', '/images/tiramisu.jpg', true, false);
      
    RAISE NOTICE 'Sample products have been added successfully!';
  ELSE
    RAISE NOTICE 'Products table already has data. No sample products were added.';
  END IF;
END $$; 