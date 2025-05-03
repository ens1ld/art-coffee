'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function MenuPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const menuCategories = [
    {
      title: 'Hot Coffees',
      items: [
        { name: 'Espresso', price: '$3.50', description: 'Rich and bold single shot' },
        { name: 'Americano', price: '$4.00', description: 'Espresso with hot water' },
        { name: 'Cappuccino', price: '$4.50', description: 'Espresso with steamed milk and foam' },
        { name: 'Latte', price: '$4.75', description: 'Espresso with steamed milk' },
        { name: 'Mocha', price: '$5.00', description: 'Espresso with chocolate and steamed milk' },
      ],
    },
    {
      title: 'Cold Brews',
      items: [
        { name: 'Cold Brew', price: '$4.50', description: 'Smooth and refreshing' },
        { name: 'Iced Latte', price: '$5.00', description: 'Espresso with cold milk' },
        { name: 'Iced Mocha', price: '$5.25', description: 'Espresso with chocolate and cold milk' },
        { name: 'Nitro Cold Brew', price: '$5.50', description: 'Cold brew infused with nitrogen' },
      ],
    },
    {
      title: 'Specialty Drinks',
      items: [
        { name: 'Caramel Macchiato', price: '$5.25', description: 'Espresso with vanilla, steamed milk, and caramel' },
        { name: 'Hazelnut Latte', price: '$5.00', description: 'Espresso with hazelnut syrup and steamed milk' },
        { name: 'Vanilla Bean Latte', price: '$5.00', description: 'Espresso with vanilla bean and steamed milk' },
        { name: 'Pumpkin Spice Latte', price: '$5.50', description: 'Seasonal favorite with pumpkin and spices' },
      ],
    },
    {
      title: 'Teas & More',
      items: [
        { name: 'Chai Latte', price: '$4.50', description: 'Spiced tea with steamed milk' },
        { name: 'Matcha Latte', price: '$5.00', description: 'Green tea powder with steamed milk' },
        { name: 'Hot Chocolate', price: '$4.00', description: 'Rich chocolate with steamed milk' },
        { name: 'Iced Tea', price: '$3.50', description: 'Freshly brewed iced tea' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Use the shared Navigation component */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 text-center bg-card-bg">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-primary mb-6">
            Our Menu
          </h1>
          <p className="text-xl text-secondary">
            Discover our carefully crafted selection of premium coffees and specialty drinks
          </p>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {menuCategories.map((category, index) => (
              <div key={index} className="bg-card-bg border border-card-border rounded-xl p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  {category.title}
                </h2>
                <div className="space-y-6">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-b border-card-border pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-primary">
                            {item.name}
                          </h3>
                          <p className="text-secondary text-sm">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-primary font-semibold">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order CTA Section */}
      <section className="py-16 bg-card-bg">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Ready to Order?
          </h2>
          <p className="text-xl text-secondary mb-8">
            Sign in to place your order and earn loyalty points
          </p>
          <Link
            href="/auth"
            className="btn-primary px-8 py-3 rounded text-lg"
          >
            Sign In to Order
          </Link>
        </div>
      </section>

      {/* Use the shared Footer component */}
      <Footer />
    </div>
  );
} 