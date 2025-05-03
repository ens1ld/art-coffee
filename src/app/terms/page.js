'use client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container-custom py-12">
        <h1 className="heading-2 mb-6">Terms & Conditions</h1>
        
        <div className="prose max-w-none">
          <p className="lead mb-8">
            Please read these terms and conditions carefully before using the Art Coffee website and services.
          </p>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">1. Introduction</h2>
            <p>
              Welcome to Art Coffee. By accessing or using our website, mobile applications, or services,
              you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms,
              you may not use our services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">2. Definitions</h2>
            <p>
              &ldquo;Company&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo; or &ldquo;Our&rdquo; refers to Art Coffee.
              &ldquo;Customer&rdquo;, &ldquo;You&rdquo;, &ldquo;Your&rdquo; refers to the person accessing this website and accepting the Company&apos;s terms and conditions.
              &ldquo;Products&rdquo; refers to the items offered for sale on the website.
              &ldquo;Service&rdquo; refers to the services provided by Art Coffee.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">3. Products and Services</h2>
            <p>
              All products and services displayed on our website are subject to availability.
              We reserve the right to discontinue any product or service at any time.
              Prices for our products are subject to change without notice.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">4. Orders and Payments</h2>
            <p>
              When you place an order, you are making an offer to purchase the products you have selected.
              We reserve the right to accept or decline your order for any reason.
              Payment must be made at the time of ordering. We accept various payment methods as indicated on the website.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">5. Gift Cards</h2>
            <p>
              Gift cards are valid for the period specified and can be used for purchases on our website or in our physical stores.
              Gift cards cannot be exchanged for cash, refunded, or used to purchase additional gift cards.
              We are not responsible for lost, stolen, or damaged gift cards.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">6. Loyalty Program</h2>
            <p>
              Participation in our Loyalty Program is subject to these Terms and Conditions.
              Points earned through the Loyalty Program have no cash value and cannot be transferred or sold.
              We reserve the right to modify or terminate the Loyalty Program at any time without prior notice.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">7. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account information, including your password.
              You agree to accept responsibility for all activities that occur under your account.
              We reserve the right to terminate accounts at our discretion.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">8. Intellectual Property</h2>
            <p>
              All content on this website, including but not limited to text, graphics, logos, images, and software,
              is the property of Art Coffee and is protected by copyright and other intellectual property laws.
              You may not use, reproduce, distribute, or display any portion of the website without prior written consent.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">9. Changes to Terms</h2>
            <p>
              We reserve the right to revise these Terms and Conditions at any time.
              By using this website, you are agreeing to be bound by the current version of these Terms and Conditions.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
              <br />
              <a href="mailto:info@artcoffee.com" className="text-primary">info@artcoffee.com</a>
              <br />
              123 Coffee Street, New York, NY 10001
              <br />
              (212) 555-1234
            </p>
          </section>
          
          <p className="text-sm text-text-secondary">
            Last updated: May 1, 2024
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 