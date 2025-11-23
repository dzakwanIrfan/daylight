'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter, Music2, Youtube } from 'lucide-react';
import { FaInstagram, FaMedium, FaTiktok, FaYoutube } from 'react-icons/fa6';

export function BlogFooter() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h1 className="text-2xl logo-text font-bold text-brand">
                DayLight
              </h1>
            </Link>
            <p className="text-sm text-gray-600 mb-4">
              Connecting people through real life experiences. Join our community and discover amazing events.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/daylight.asia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand transition-colors"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@daylight_asia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand transition-colors"
              >
                <FaTiktok className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@daylightasia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand transition-colors"
              >
                <FaYoutube className="w-5 h-5" />
              </a>
              <a 
                href="https://medium.com/@Daylight.asia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand transition-colors"
              >
                <FaMedium className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-gray-600 hover:text-brand transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-gray-600 hover:text-brand transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/subscriptions" className="text-sm text-gray-600 hover:text-brand transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-brand transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-brand transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-brand transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/community-guidelines" className="text-sm text-gray-600 hover:text-brand transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} DayLight. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}