'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    
    // Simulate form submission
    setTimeout(() => {
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
            Get in Touch
          </h1>
          <p className="text-xl text-secondary">
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card-bg border border-card-border rounded-xl p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded border border-card-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded border border-card-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-secondary mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded border border-card-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-secondary mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 rounded border border-card-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className={`w-full py-3 rounded transition-colors ${
                    status === 'sending'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'btn-primary hover:bg-primary/90'
                  }`}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                {status === 'success' && (
                  <p className="text-green-500 text-center">
                    Thank you for your message! We&apos;ll get back to you soon.
                  </p>
                )}
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-card-bg border border-card-border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Visit Us
                </h3>
                <p className="text-secondary mb-2">
                  Lagja Emin Matraxhiu<br />
                  Elbasan, Albania, 3001
                </p>
                <p className="text-secondary">
                  Open Monday - Friday: 7am - 11pm<br />
                  Saturday - Sunday: 8am - 10pm
                </p>
              </div>

              <div className="bg-card-bg border border-card-border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Contact Information
                </h3>
                <p className="text-secondary mb-2">
                  Email: art-kafe@live.com<br />
                  Phone: (+355) 69 875 6167
                </p>
                <p className="text-secondary">
                  For bulk orders or special events, please contact us directly.
                </p>
              </div>

              <div className="bg-card-bg border border-card-border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <a href="#" className="text-secondary hover:text-primary">
                    Instagram
                  </a>
                  <a href="#" className="text-secondary hover:text-primary">
                    Facebook
                  </a>
                  <a href="#" className="text-secondary hover:text-primary">
                    Twitter
                  </a>
                </div>
              </div>
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
                Email: art-kafe@live.com<br />
                Phone: (+355)69 875 6167<br />
                Address: Lagja Emin Matraxhiu, Elbasan, Albania
              </p>
            </div>
          </div>
          <div className="mt-8 text-center text-secondary">
            <p>© 2025 Art Coffee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 