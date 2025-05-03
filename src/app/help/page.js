'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';

export default function HelpPage() {
  const { user, profile, loading } = useProfile();
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('general');
  const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback) {
      setSubmitStatus({
        message: 'Please provide your question or feedback',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ message: '', type: '' });
    
    try {
      // In a real implementation, you would save this to a database table
      // For now, we'll just show a success message
      
      // For demonstration, we'll wait 1 second to simulate a network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus({
        message: 'Thank you for your feedback! We will get back to you soon.',
        type: 'success'
      });
      setFeedback('');
      setTopic('general');
      
      // If we had a real backend endpoint:
      // const { error } = await supabase
      //   .from('feedback')
      //   .insert({
      //     user_id: user?.id || null,
      //     email: user?.email || email,
      //     topic,
      //     message: feedback,
      //     created_at: new Date().toISOString()
      //   });
      //
      // if (error) throw error;
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus({
        message: 'There was an error submitting your feedback. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Help Center</h1>
        <p className="text-gray-600 mb-8">Find answers to common questions or contact our support team</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-amber-800 mb-3">Frequently Asked Questions</h2>
            <ul className="space-y-2">
              <li>
                <Link href="#account" className="text-amber-700 hover:text-amber-900">
                  Account & Login Issues
                </Link>
              </li>
              <li>
                <Link href="#orders" className="text-amber-700 hover:text-amber-900">
                  Orders & Payments
                </Link>
              </li>
              <li>
                <Link href="#loyalty" className="text-amber-700 hover:text-amber-900">
                  Loyalty Program
                </Link>
              </li>
              <li>
                <Link href="#hours" className="text-amber-700 hover:text-amber-900">
                  Store Hours & Locations
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-amber-800 mb-3">Contact Information</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium">Email:</p>
                  <p className="text-amber-700">support@artcoffee.com</p>
                </div>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="font-medium">Phone:</p>
                  <p className="text-amber-700">(555) 123-4567</p>
                </div>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Hours:</p>
                  <p className="text-amber-700">Mon-Fri: 7am - 8pm</p>
                  <p className="text-amber-700">Sat-Sun: 8am - 7pm</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-amber-800 mb-3">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/profile" className="text-amber-700 hover:text-amber-900">
                  Your Account
                </Link>
              </li>
              <li>
                <Link href="/order" className="text-amber-700 hover:text-amber-900">
                  Place an Order
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-amber-700 hover:text-amber-900">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-amber-700 hover:text-amber-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-amber-700 hover:text-amber-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">Contact Us</h2>
          
          {submitStatus.message && (
            <div className={`border-l-4 p-4 mb-6 ${
              submitStatus.type === 'success' 
                ? 'bg-green-100 border-green-500 text-green-700' 
                : 'bg-red-100 border-red-500 text-red-700'
            }`}>
              <p>{submitStatus.message}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {!user && (
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="your@email.com"
                    required={!user}
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="topic" className="block text-gray-700 mb-1">Topic</label>
                <select
                  id="topic"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="general">General Inquiry</option>
                  <option value="account">Account Issue</option>
                  <option value="order">Order Problem</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="feedback" className="block text-gray-700 mb-1">Your Message</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={6}
                placeholder="How can we help you?"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-800 text-white px-6 py-3 rounded-md hover:bg-amber-700 transition-colors disabled:bg-amber-400"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
        
        <div id="faq" className="space-y-8">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">Frequently Asked Questions</h2>
          
          <div id="account" className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-amber-800 mb-4">Account & Login Issues</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-amber-700 mb-1">How do I create an account?</h4>
                <p className="text-gray-600">Visit our login page and click on &ldquo;Sign Up&rdquo; to create a new account. You&apos;ll need to provide your email address and create a secure password.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-1">I forgot my password. How do I reset it?</h4>
                <p className="text-gray-600">On the login page, click &ldquo;Forgot Password&rdquo; and enter the email associated with your account. We&apos;ll send you instructions to reset your password.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-1">How do I change my email address?</h4>
                <p className="text-gray-600">You can update your email address in the Profile section of your account. For security reasons, you&apos;ll need to verify the new email address.</p>
              </div>
            </div>
          </div>
          
          <div id="orders" className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-amber-800 mb-4">Orders & Payments</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-amber-700 mb-1">How do I place an order?</h4>
                <p className="text-gray-600">Browse our menu, select the items you want, add them to your cart, and proceed to checkout. You can choose pickup or delivery options during checkout.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-1">What payment methods do you accept?</h4>
                <p className="text-gray-600">We accept all major credit cards, gift cards, and mobile payment options like Apple Pay and Google Pay.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-1">How can I check the status of my order?</h4>
                <p className="text-gray-600">You can view your order status in the &ldquo;Order History&rdquo; section of your dashboard. You&apos;ll also receive email updates about your order status.</p>
              </div>
            </div>
          </div>
          
          <div id="loyalty" className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-amber-800 mb-4">Loyalty Program</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-amber-700 mb-1">How does the loyalty program work?</h4>
                <p className="text-gray-600">You earn 10 points for every dollar spent at Art Coffee. Points can be redeemed for free drinks, pastries, and other rewards.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-1">How do I check my point balance?</h4>
                <p className="text-gray-600">Your points balance is displayed in the Loyalty section of your dashboard. You can also see it in the mobile app.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-1">Do points expire?</h4>
                <p className="text-gray-600">Points expire 12 months after they are earned if not redeemed.</p>
              </div>
            </div>
          </div>
          
          <div id="hours" className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-amber-800 mb-4">Store Hours & Locations</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-amber-700 mb-1">What are your hours of operation?</h4>
                <p className="text-gray-600">Our stores are open Monday through Friday from 7am to 8pm, and Saturday and Sunday from 8am to 7pm. Hours may vary by location on holidays.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-1">Do you have multiple locations?</h4>
                <p className="text-gray-600">Yes, we have several locations throughout the city. You can find the nearest store by using the &ldquo;Find a Store&rdquo; feature on our website or app.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-1">Are your stores wheelchair accessible?</h4>
                <p className="text-gray-600">Yes, all of our locations are wheelchair accessible with designated parking spaces.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 