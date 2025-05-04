'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// Create the language context
const LanguageContext = createContext();

// English translations - default language
const en = {
  // Navigation
  nav_home: 'Home',
  nav_order: 'Order',
  nav_loyalty: 'Loyalty',
  nav_gift_cards: 'Gift Cards',
  nav_bulk_order: 'Bulk Order',
  nav_admin: 'Admin',
  nav_superadmin: 'Superadmin',
  nav_profile: 'My Profile',
  nav_sign_out: 'Sign Out',
  nav_login: 'Login / Sign Up',
  
  // Homepage
  home_hero_title: 'Experience Artisanal Coffee at Its Finest',
  home_hero_desc: 'At Art Coffee, we craft each cup with passion and precision, using only the finest beans sourced from around the world. Discover flavors that tell a story.',
  home_start_order: 'Start Your Order',
  home_view_menu: 'View Menu',
  home_my_profile: 'My Profile',
  home_go_admin: 'Go to Admin Dashboard',
  home_go_superadmin: 'Go to Superadmin Panel',
  home_why_choose: 'Why Choose Art Coffee',
  home_why_desc: 'Discover what makes our coffee experience unique and why our customers keep coming back for more.',
  home_premium_quality: 'Premium Quality',
  home_premium_desc: 'We select only the highest-quality beans, expertly roasted to bring out their unique flavors.',
  home_personalized: 'Personalized Orders',
  home_personalized_desc: 'Customize your coffee just the way you like it. We craft each cup to match your preferences.',
  home_loyalty: 'Loyalty Rewards',
  home_loyalty_desc: 'Earn points with every purchase and enjoy special rewards to enhance your coffee experience.',
  home_services: 'Our Services',
  home_services_desc: 'Explore our range of services designed to make your coffee experience exceptional.',
  home_customize: 'Customize Your Order',
  home_customize_desc: 'Create your perfect cup with our wide range of customization options. Choose your beans, brewing method, and add-ons.',
  home_order_now: 'Order Now',
  home_gift_card: 'Send a Gift Card',
  home_gift_desc: 'Share the gift of exceptional coffee with friends and family. Personalize your gift card with a custom message.',
  home_send_gift: 'Send Gift Card',
  home_earn_points: 'Earn Loyalty Points',
  home_earn_desc: 'Join our loyalty program and earn points with every purchase. Redeem for free drinks, special offers, and more.',
  home_view_loyalty: 'View Loyalty Program',
  home_bulk_order: 'Bulk Orders for Events',
  home_bulk_desc: 'Perfect for meetings, events, or office gatherings. Place bulk orders with customization options for each cup.',
  home_place_bulk: 'Place Bulk Order',
  
  // Profile Page
  profile_title: 'My Profile',
  profile_orders: 'My Orders',
  profile_account_info: 'Account Information',
  profile_full_name: 'Full Name',
  profile_email: 'Email Address',
  profile_account_type: 'Account Type',
  profile_member_since: 'Member Since',
  profile_pending_approval: 'Your admin account is pending approval. You will be notified when it\'s approved.',
  profile_no_orders: 'You haven\'t placed any orders yet.',
  profile_browse_menu: 'Browse Menu',
  profile_order_items: 'Items:',
  profile_total: 'Total:',
  profile_notes: 'Notes:',
  
  // Access Info
  access_info: 'Access Information',
  access_user: 'You currently have regular user access which allows you to:',
  access_user_p1: 'Place coffee orders',
  access_user_p2: 'Purchase gift cards',
  access_user_p3: 'Participate in our loyalty program',
  access_user_p4: 'View your order history',
  access_admin_approved: 'You have admin access which allows you to:',
  access_admin_pending: 'Once approved, you will have admin access to:',
  access_admin_p1: 'View all customer orders',
  access_admin_p2: 'Manage products and inventory',
  access_admin_p3: 'View loyalty program analytics',
  access_admin_p4: 'Access the admin dashboard',
  access_superadmin: 'You have superadmin access which allows you to:',
  access_superadmin_p1: 'Manage all user accounts',
  access_superadmin_p2: 'Approve admin account requests',
  access_superadmin_p3: 'Access all system settings',
  access_superadmin_p4: 'View all admin and customer data',
  access_superadmin_p5: 'Complete access to the admin dashboard',
  become_admin: 'Want to become an admin?',
  become_admin_p1: 'If you\'d like to request admin access, please contact us or create a new account with admin privileges.',
  contact_us: 'Contact Us',
  
  // Recommendations
  recommendations: 'Recommended For You',
  view_all_products: 'View All Products',
  based_on_history: 'Based on your order history and browsing habits, we think you might like:',
  pro_tip: 'Pro tip:',
  recommendation_tip: 'We update these recommendations based on your ordering habits and preferences to help you discover new favorites.',
  
  // Order page
  order_menu: 'Order Menu',
  browse_menu: 'Browse our menu and place your order',
  table: 'Table',
  all: 'All',
  search_menu: 'Search menu items...',
  add_to_cart: 'Add to Cart',
  your_order: 'Your Order',
  cart_empty: 'Your cart is empty',
  your_table: 'Your Table',
  select_table: 'Select Table',
  change: 'Change',
  order_notes: 'Order Notes (optional)',
  order_notes_placeholder: 'Special instructions for your order...',
  subtotal: 'Subtotal',
  total: 'Total',
  sign_in_loyalty: 'Sign in to earn loyalty points with your purchase!',
  sign_in_now: 'Sign in now',
  order_success: 'Order placed successfully!',
  order_notification: 'You will be notified when your order is ready.',
  order_thank_you: 'Thank you for your order!',
  place_order: 'Place Order',
  processing: 'Processing...',
  please_select_table: 'Please select a table before placing your order',
  select_your_table: 'Select Your Table',
  seats: 'Seats',
  location: 'Location',
  description: 'Description',
  cancel: 'Cancel',
  confirm_selection: 'Confirm Selection',
  
  // Common UI elements  
  loading: 'Loading...',
  error: 'Error',
  retry: 'Retry',
  new: 'NEW',
  
  // Language
  language: 'Language',
  english: 'English',
  albanian: 'Albanian',
  
  // Order page categories
  category_coffee: 'Coffee',
  category_tea: 'Tea',
  category_pastries: 'Pastries',
  category_breakfast: 'Breakfast',
  category_lunch: 'Lunch',
  category_desserts: 'Desserts',
  
  // Footer translations
  quick_links: 'Quick Links',
  about_us: 'About Us',
  our_story: 'Our Story',
  our_team: 'Our Team',
  our_values: 'Our Values',
  contact: 'Contact',
  all_rights_reserved: 'All rights reserved.',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
};

// Albanian translations
const sq = {
  // Navigation
  nav_home: 'Kryefaqja',
  nav_order: 'Porosit',
  nav_loyalty: 'Besnikëria',
  nav_gift_cards: 'Kartat e Dhuratave',
  nav_bulk_order: 'Porosi me Shumicë',
  nav_admin: 'Admin',
  nav_superadmin: 'Superadmin',
  nav_profile: 'Profili Im',
  nav_sign_out: 'Dilni',
  nav_login: 'Hyrje / Regjistrohu',
  
  // Homepage
  home_hero_title: 'Përjetoni Kafenë Artizanale në Shkëlqimin e Saj',
  home_hero_desc: 'Në Art Coffee, ne e përgatisim secilën filxhan me pasion dhe saktësi, duke përdorur vetëm kokrrat më të mira të blera nga e gjithë bota. Zbuloni shijet që tregojnë një histori.',
  home_start_order: 'Fillo Porosinë',
  home_view_menu: 'Shiko Menunë',
  home_my_profile: 'Profili Im',
  home_go_admin: 'Shko te Paneli i Administratorit',
  home_go_superadmin: 'Shko te Paneli i Superadministratorit',
  home_why_choose: 'Pse të Zgjidhni Art Coffee',
  home_why_desc: 'Zbuloni çfarë e bën përvojën tonë të kafesë unike dhe pse klientët tanë vazhdojnë të kthehen për më shumë.',
  home_premium_quality: 'Cilësi Premium',
  home_premium_desc: 'Ne zgjedhim vetëm kokrrat me cilësinë më të lartë, të pjekura me mjeshtëri për të nxjerrë në pah shijet e tyre unike.',
  home_personalized: 'Porosi të Personalizuara',
  home_personalized_desc: 'Personalizoni kafenë tuaj ashtu siç ju pëlqen. Ne përgatisim çdo filxhan për të përshtatur preferencat tuaja.',
  home_loyalty: 'Shpërblimet e Besnikërisë',
  home_loyalty_desc: 'Fitoni pikë me çdo blerje dhe shijoni shpërblime të veçanta për të përmirësuar përvojën tuaj të kafesë.',
  home_services: 'Shërbimet Tona',
  home_services_desc: 'Eksploroni gamën tonë të shërbimeve të dizajnuara për ta bërë përvojën tuaj të kafesë të jashtëzakonshme.',
  home_customize: 'Personalizoni Porosinë Tuaj',
  home_customize_desc: 'Krijoni filxhanin tuaj perfekt me gamën tonë të gjerë të opsioneve të personalizimit. Zgjidhni kokrrat, metodën e përgatitjes dhe shtojcat.',
  home_order_now: 'Porosit Tani',
  home_gift_card: 'Dërgo një Kartë Dhurate',
  home_gift_desc: 'Ndani dhuratën e kafesë së jashtëzakonshme me miqtë dhe familjen. Personalizoni kartën tuaj të dhuratës me një mesazh të personalizuar.',
  home_send_gift: 'Dërgo Kartën e Dhuratës',
  home_earn_points: 'Fito Pikë Besnikërie',
  home_earn_desc: 'Bashkohuni me programin tonë të besnikërisë dhe fitoni pikë me çdo blerje. Këmbejini për pije falas, oferta të veçanta dhe më shumë.',
  home_view_loyalty: 'Shiko Programin e Besnikërisë',
  home_bulk_order: 'Porosi me Shumicë për Evente',
  home_bulk_desc: 'Perfekt për takime, evente ose grumbullime zyre. Vendosni porosi me shumicë me opsione personalizimi për çdo filxhan.',
  home_place_bulk: 'Vendos Porosi me Shumicë',
  
  // Profile Page
  profile_title: 'Profili Im',
  profile_orders: 'Porositë e Mia',
  profile_account_info: 'Informacioni i Llogarisë',
  profile_full_name: 'Emri i Plotë',
  profile_email: 'Adresa e Emailit',
  profile_account_type: 'Lloji i Llogarisë',
  profile_member_since: 'Anëtar që nga',
  profile_pending_approval: 'Llogaria juaj e administratorit është në pritje të miratimit. Do të njoftoheni kur të miratohet.',
  profile_no_orders: 'Nuk keni bërë ende asnjë porosi.',
  profile_browse_menu: 'Shfleto Menunë',
  profile_order_items: 'Artikujt:',
  profile_total: 'Totali:',
  profile_notes: 'Shënime:',
  
  // Access Info
  access_info: 'Informacion mbi Aksesin',
  access_user: 'Aktualisht keni akses si përdorues i rregullt që ju lejon të:',
  access_user_p1: 'Vendosni porosi për kafe',
  access_user_p2: 'Blini karta dhuratash',
  access_user_p3: 'Merrni pjesë në programin e besnikërisë',
  access_user_p4: 'Shikoni historinë tuaj të porosive',
  access_admin_approved: 'Keni akses si administrator që ju lejon të:',
  access_admin_pending: 'Pas miratimit, do të keni akses si administrator për të:',
  access_admin_p1: 'Shikoni të gjitha porositë e klientëve',
  access_admin_p2: 'Menaxhoni produktet dhe inventarin',
  access_admin_p3: 'Shikoni analitikën e programit të besnikërisë',
  access_admin_p4: 'Aksesoni panelin e administratorit',
  access_superadmin: 'Keni akses si super administrator që ju lejon të:',
  access_superadmin_p1: 'Menaxhoni të gjitha llogaritë e përdoruesve',
  access_superadmin_p2: 'Miratoni kërkesat për llogari administratori',
  access_superadmin_p3: 'Aksesoni të gjitha cilësimet e sistemit',
  access_superadmin_p4: 'Shikoni të gjitha të dhënat e administratorit dhe klientëve',
  access_superadmin_p5: 'Akses i plotë në panelin e administratorit',
  become_admin: 'Dëshironi të bëheni administrator?',
  become_admin_p1: 'Nëse dëshironi të kërkoni akses administratori, ju lutemi na kontaktoni ose krijoni një llogari të re me privilegje administratori.',
  contact_us: 'Na Kontaktoni',
  
  // Recommendations
  recommendations: 'Rekomandime për Ju',
  view_all_products: 'Shiko të Gjitha Produktet',
  based_on_history: 'Bazuar në historinë e porosive dhe zakonet e shfletimit, mendojmë se mund t\'ju pëlqejnë:',
  pro_tip: 'Këshillë:',
  recommendation_tip: 'I përditësojmë këto rekomandime bazuar në zakonet dhe preferencat tuaja të porosive për t\'ju ndihmuar të zbuloni të preferuara të reja.',
  
  // Order page
  order_menu: 'Menuja e Porosive',
  browse_menu: 'Shfletoni menunë tonë dhe vendosni porosinë tuaj',
  table: 'Tavolina',
  all: 'Të Gjitha',
  search_menu: 'Kërkoni artikuj në menu...',
  add_to_cart: 'Shto në Shportë',
  your_order: 'Porosia Juaj',
  cart_empty: 'Shporta juaj është bosh',
  your_table: 'Tavolina Juaj',
  select_table: 'Zgjidhni Tavolinën',
  change: 'Ndrysho',
  order_notes: 'Shënime për Porosinë (opsionale)',
  order_notes_placeholder: 'Udhëzime të veçanta për porosinë tuaj...',
  subtotal: 'Nëntotali',
  total: 'Totali',
  sign_in_loyalty: 'Hyni për të fituar pikë besnikërie me blerjen tuaj!',
  sign_in_now: 'Hyni tani',
  order_success: 'Porosia u vendos me sukses!',
  order_notification: 'Do të njoftoheni kur porosia juaj të jetë gati.',
  order_thank_you: 'Faleminderit për porosinë tuaj!',
  place_order: 'Vendos Porosinë',
  processing: 'Duke procesuar...',
  please_select_table: 'Ju lutemi zgjidhni një tavolinë para se të vendosni porosinë',
  select_your_table: 'Zgjidhni Tavolinën Tuaj',
  seats: 'Vende',
  location: 'Vendndodhja',
  description: 'Përshkrimi',
  cancel: 'Anulo',
  confirm_selection: 'Konfirmo Zgjedhjen',
  
  // Common UI elements
  loading: 'Duke u ngarkuar...',
  error: 'Gabim',
  retry: 'Provo përsëri',
  new: 'E RE',
  
  // Language
  language: 'Gjuha',
  english: 'Anglisht',
  albanian: 'Shqip',
  
  // Order page categories
  category_coffee: 'Kafe',
  category_tea: 'Çaj',
  category_pastries: 'Pasta',
  category_breakfast: 'Mëngjes',
  category_lunch: 'Drekë',
  category_desserts: 'Ëmbëlsira',
  
  // Footer translations
  quick_links: 'Lidhje të Shpejta',
  about_us: 'Rreth Nesh',
  our_story: 'Historia Jonë',
  our_team: 'Ekipi Ynë',
  our_values: 'Vlerat Tona',
  contact: 'Kontakti',
  all_rights_reserved: 'Të gjitha të drejtat e rezervuara.',
  terms: 'Kushtet dhe Rregullat',
  privacy: 'Politika e Privatësisë',
};

// Provider component
export function LanguageProvider({ children }) {
  // Try to get stored language preference from localStorage, default to 'en'
  const [language, setLanguage] = useState('en');
  
  // Initialize language from localStorage when component mounts (client side only)
  useEffect(() => {
    const storedLanguage = localStorage.getItem('art-coffee-language');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);
  
  // Function to change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('art-coffee-language', lang);
    }
  };
  
  // Get the translations for the current language
  const translations = language === 'sq' ? sq : en;
  
  // Create the context value
  const contextValue = {
    language,
    changeLanguage,
    translations
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext; 