-- This script ensures all required products exist in the database
-- Any existing products are kept intact, while new ones are added to fill out all categories

-- Create temporary table with all required products
CREATE TEMP TABLE required_products (
  name TEXT PRIMARY KEY,
  description TEXT,
  price DECIMAL(10, 2),
  category TEXT,
  image_url TEXT,
  is_new BOOLEAN,
  is_out_of_stock BOOLEAN
);

-- Insert a comprehensive set of products into the temp table
-- COFFEE CATEGORY
INSERT INTO required_products VALUES
  ('Espresso', 'Our signature espresso shot, rich and bold', 2.50, 'coffee', '/images/espresso.png', false, false),
  ('Cappuccino', 'Espresso with steamed milk and velvety foam', 3.80, 'coffee', '/images/cappuccino.png', true, false),
  ('Latte', 'Espresso with steamed milk and a light layer of foam', 4.20, 'coffee', '/images/latte.png', false, false),
  ('Americano', 'Espresso diluted with hot water for a milder coffee', 3.50, 'coffee', '/images/americano.png', false, false),
  ('Mocha', 'Espresso with chocolate and steamed milk', 4.50, 'coffee', '/images/mocha.png', false, false),
  ('Flat White', 'Espresso with microfoam steamed milk', 4.00, 'coffee', '/images/flat-white.png', false, false),
  ('Macchiato', 'Espresso with a small amount of foamed milk', 3.00, 'coffee', '/images/macchiato.png', false, false),
  ('Cold Brew', 'Coffee brewed with cold water for 12+ hours', 4.50, 'coffee', '/images/cold-brew.png', true, false);

-- TEA CATEGORY
INSERT INTO required_products VALUES
  ('Earl Grey', 'Classic black tea with bergamot', 2.80, 'tea', '/images/earl-grey.jpg', false, false),
  ('Green Tea', 'Delicate green tea with light floral notes', 2.80, 'tea', '/images/green-tea.jpg', false, false),
  ('Chai Latte', 'Spiced tea with steamed milk', 3.50, 'tea', '/images/chai-latte.jpg', true, false),
  ('Chamomile', 'Soothing herbal tea with honey', 2.80, 'tea', '/images/chamomile.jpg', false, false),
  ('Mint Tea', 'Refreshing peppermint tea', 2.80, 'tea', '/images/mint-tea.jpg', false, false),
  ('English Breakfast', 'Robust black tea blend', 2.80, 'tea', '/images/english-breakfast.jpg', false, false),
  ('Rooibos', 'Caffeine-free herbal tea from South Africa', 3.00, 'tea', '/images/rooibos.jpg', false, false),
  ('Matcha Latte', 'Japanese green tea powder with steamed milk', 4.50, 'tea', '/images/matcha-latte.jpg', true, false);

-- PASTRIES CATEGORY
INSERT INTO required_products VALUES
  ('Croissant', 'Buttery, flaky pastry', 2.50, 'pastries', '/images/croissant.jpg', false, false),
  ('Pain au Chocolat', 'Chocolate-filled pastry', 3.20, 'pastries', '/images/pain-au-chocolat.jpg', false, false),
  ('Almond Croissant', 'Croissant filled with almond cream', 3.50, 'pastries', '/images/almond-croissant.jpg', false, false),
  ('Cinnamon Roll', 'Sweet roll with cinnamon and icing', 3.80, 'pastries', '/images/cinnamon-roll.jpg', false, false),
  ('Blueberry Muffin', 'Moist muffin with fresh blueberries', 3.20, 'pastries', '/images/blueberry-muffin.jpg', false, false),
  ('Banana Bread', 'Home-made banana bread slice', 3.50, 'pastries', '/images/banana-bread.jpg', false, false),
  ('Cheese Danish', 'Flaky pastry with sweet cheese filling', 3.50, 'pastries', '/images/cheese-danish.jpg', true, false),
  ('Scone', 'Traditional British scone with jam and cream', 3.80, 'pastries', '/images/scone.jpg', false, false);

-- BREAKFAST CATEGORY
INSERT INTO required_products VALUES
  ('Avocado Toast', 'Smashed avocado on toasted sourdough bread', 8.50, 'breakfast', '/images/avocado-toast.jpg', true, false),
  ('Granola Bowl', 'Yogurt with house-made granola and fresh fruits', 7.50, 'breakfast', '/images/granola-bowl.jpg', false, false),
  ('Breakfast Sandwich', 'Egg, cheese, and bacon on a brioche bun', 6.50, 'breakfast', '/images/breakfast-sandwich.jpg', false, false),
  ('Eggs Benedict', 'Poached eggs with hollandaise sauce on an English muffin', 9.50, 'breakfast', '/images/eggs-benedict.jpg', false, false),
  ('Pancakes', 'Fluffy pancakes with maple syrup and berries', 8.00, 'breakfast', '/images/pancakes.jpg', false, false),
  ('French Toast', 'Brioche bread dipped in egg and grilled', 8.00, 'breakfast', '/images/french-toast.jpg', false, false),
  ('Breakfast Burrito', 'Scrambled eggs, cheese, and salsa in a tortilla wrap', 7.50, 'breakfast', '/images/breakfast-burrito.jpg', true, false),
  ('Omelette', 'Three-egg omelette with choice of fillings', 9.00, 'breakfast', '/images/omelette.jpg', false, false);

-- LUNCH CATEGORY
INSERT INTO required_products VALUES
  ('Caprese Sandwich', 'Fresh mozzarella, tomato, and basil on ciabatta', 9.50, 'lunch', '/images/caprese-sandwich.jpg', false, false),
  ('Caesar Salad', 'Romaine lettuce with parmesan, croutons and Caesar dressing', 8.50, 'lunch', '/images/caesar-salad.jpg', false, false),
  ('Quinoa Bowl', 'Quinoa with roasted vegetables and tahini dressing', 10.50, 'lunch', '/images/quinoa-bowl.jpg', true, false),
  ('Turkey Club', 'Turkey, bacon, lettuce, and tomato on sourdough', 9.50, 'lunch', '/images/turkey-club.jpg', false, false),
  ('Chicken Wrap', 'Grilled chicken with lettuce and aioli in a tortilla wrap', 9.00, 'lunch', '/images/chicken-wrap.jpg', false, false),
  ('Soup of the Day', 'Daily rotating house-made soup with bread', 6.50, 'lunch', '/images/soup.jpg', false, false),
  ('Greek Salad', 'Cucumber, tomato, olives, and feta with olive oil dressing', 8.50, 'lunch', '/images/greek-salad.jpg', false, false),
  ('BLT Sandwich', 'Bacon, lettuce, and tomato on toasted bread', 8.00, 'lunch', '/images/blt-sandwich.jpg', false, false);

-- DESSERTS CATEGORY
INSERT INTO required_products VALUES
  ('Chocolate Cake', 'Rich chocolate cake with ganache frosting', 5.50, 'desserts', '/images/chocolate-cake.jpg', false, false),
  ('Cheesecake', 'Creamy cheesecake with berry compote', 6.00, 'desserts', '/images/cheesecake.jpg', false, false),
  ('Tiramisu', 'Classic Italian dessert with coffee and mascarpone', 5.50, 'desserts', '/images/tiramisu.jpg', true, false),
  ('Apple Pie', 'Warm apple pie with cinnamon and ice cream', 5.50, 'desserts', '/images/apple-pie.jpg', false, false),
  ('Carrot Cake', 'Moist carrot cake with cream cheese frosting', 5.50, 'desserts', '/images/carrot-cake.jpg', false, false),
  ('Brownie', 'Fudgy chocolate brownie with walnuts', 4.00, 'desserts', '/images/brownie.jpg', false, false),
  ('Lemon Tart', 'Tangy lemon tart with whipped cream', 5.00, 'desserts', '/images/lemon-tart.jpg', false, false),
  ('Ice Cream', 'Selection of artisanal ice cream flavors', 4.50, 'desserts', '/images/ice-cream.jpg', false, false);

-- Set up fallback image URLs for common categories
DO $$
BEGIN
  UPDATE required_products SET image_url = '/images/coffee-generic.jpg' WHERE category = 'coffee' AND image_url IS NULL;
  UPDATE required_products SET image_url = '/images/tea-generic.jpg' WHERE category = 'tea' AND image_url IS NULL;
  UPDATE required_products SET image_url = '/images/pastry-generic.jpg' WHERE category = 'pastries' AND image_url IS NULL;
  UPDATE required_products SET image_url = '/images/breakfast-generic.jpg' WHERE category = 'breakfast' AND image_url IS NULL;
  UPDATE required_products SET image_url = '/images/lunch-generic.jpg' WHERE category = 'lunch' AND image_url IS NULL;
  UPDATE required_products SET image_url = '/images/dessert-generic.jpg' WHERE category = 'desserts' AND image_url IS NULL;
END $$;

-- Now insert all required products that don't already exist
-- But don't update products that do exist to preserve any customizations
INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
SELECT rp.name, rp.description, rp.price, rp.category, rp.image_url, rp.is_new, rp.is_out_of_stock
FROM required_products rp
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE LOWER(p.name) = LOWER(rp.name)
);

-- Output how many products were added or already existed
DO $$
DECLARE
  total_required INTEGER;
  already_exist INTEGER;
  newly_added INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_required FROM required_products;
  SELECT COUNT(*) INTO already_exist FROM products p
  WHERE EXISTS (SELECT 1 FROM required_products rp WHERE LOWER(p.name) = LOWER(rp.name));
  newly_added := total_required - already_exist;
  
  RAISE NOTICE 'Product update summary:';
  RAISE NOTICE '- Total required products: %', total_required;
  RAISE NOTICE '- Already in database: %', already_exist;
  RAISE NOTICE '- Newly added: %', newly_added;
END $$;

-- Make sure all products have the required columns
DO $$
BEGIN
  -- Update any NULL is_new or is_out_of_stock values to false
  UPDATE products SET is_new = false WHERE is_new IS NULL;
  UPDATE products SET is_out_of_stock = false WHERE is_out_of_stock IS NULL;
  
  -- Ensure lowercase categories for consistency
  UPDATE products SET category = LOWER(category) WHERE category IS NOT NULL;
END $$;

-- Cleanup
DROP TABLE required_products; 