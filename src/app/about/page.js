'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Bar */}
      <nav className="bg-card-bg border-b border-card-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Art Coffee
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-secondary hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-secondary hover:text-primary transition-colors">
              Contact
            </Link>
            <Link href="/auth" className="btn-primary px-4 py-2 rounded">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 text-center bg-card-bg">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-primary mb-6">
            Our Story
          </h1>
          <p className="text-xl text-secondary">
            From bean to cup, we&apos;re passionate about crafting the perfect coffee experience
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">
                The Art of Coffee
              </h2>
              <p className="text-secondary mb-4">
                Founded in 2020, Art Coffee began as a small passion project between two coffee enthusiasts. 
                What started as a simple desire to share our love for quality coffee has grown into a 
                thriving community of coffee lovers.
              </p>
              <p className="text-secondary mb-4">
                We believe that coffee is more than just a beverage - it&apos;s an art form. Each cup tells a 
                story, from the careful selection of beans to the precise brewing process. Our mission is 
                to bring this art to life in every cup we serve.
              </p>
            </div>
            <div className="bg-card-bg border border-card-border rounded-xl p-6">
              <div className="relative w-full h-64">
                <Image
                  src="/src/components/images/interior.png"
                  alt="Art Coffee Shop Interior"
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-card-bg">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background border border-card-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Quality</h3>
              <p className="text-secondary">
                We source only the finest beans and maintain the highest standards in every step of our process.
              </p>
            </div>
            <div className="bg-background border border-card-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Sustainability</h3>
              <p className="text-secondary">
                We&apos;re committed to ethical sourcing and environmentally friendly practices throughout our supply chain.
              </p>
            </div>
            <div className="bg-background border border-card-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Community</h3>
              <p className="text-secondary">
                We believe in building meaningful connections and creating a welcoming space for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/10"></div>
              <h3 className="text-xl font-semibold text-primary mb-2">Sarah Johnson</h3>
              <p className="text-secondary mb-2">Founder & Head Barista</p>
              <p className="text-secondary text-sm">
                With over 10 years of experience in specialty coffee, Sarah leads our team with passion and expertise.
              </p>
            </div>
            <div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/10"></div>
              <h3 className="text-xl font-semibold text-primary mb-2">Michael Chen</h3>
              <p className="text-secondary mb-2">Coffee Roaster</p>
              <p className="text-secondary text-sm">
                Michael&apos;s expertise in roasting brings out the unique flavors in every bean we source.
              </p>
            </div>
            <div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/10"></div>
              <h3 className="text-xl font-semibold text-primary mb-2">Emma Rodriguez</h3>
              <p className="text-secondary mb-2">Customer Experience Manager</p>
              <p className="text-secondary text-sm">
                Emma ensures every customer leaves with a smile and a perfect cup of coffee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card-bg border-t border-card-border py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Art Coffee</h3>
              <p className="text-secondary">
                Crafting the perfect cup, one bean at a time
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-secondary hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-secondary hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/menu" className="text-secondary hover:text-primary">
                    Menu
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Contact Us</h3>
              <p className="text-secondary">
                Email: info@artcoffee.com<br />
                Phone: (123) 456-7890<br />
                Address: 123 Coffee Street, City
              </p>
            </div>
          </div>
          <div className="mt-8 text-center text-secondary">
            <p>© 2024 Art Coffee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 