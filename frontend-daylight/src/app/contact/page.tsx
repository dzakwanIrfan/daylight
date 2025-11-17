import { ArrowLeft, Mail, Phone, Instagram, Music2, Youtube } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/auth/login">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-brand mb-2 logo-text">DayLight</h1>
            <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>
            <p className="text-muted-foreground mt-2">
              We'd love to hear from you. Get in touch with us!
            </p>
          </div>

          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-brand/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-brand" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Send us an email for inquiries and support
                </p>
                <a
                  href="mailto:contact@daylightapp.asia"
                  className="text-brand hover:underline font-medium"
                >
                  contact@daylightapp.asia
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-brand/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-brand" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Call us during business hours
                </p>
                <a
                  href="tel:+6287875617912"
                  className="text-brand hover:underline font-medium"
                >
                  +62 878-7561-7912
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">Follow Us</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/daylight.asia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-brand/30 hover:bg-brand/5 transition-colors"
                >
                  <Instagram className="w-6 h-6 text-brand" />
                  <div>
                    <p className="font-medium text-gray-900">Instagram</p>
                    <p className="text-xs text-muted-foreground">@daylight.asia</p>
                  </div>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@daylight_asia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-brand/30 hover:bg-brand/5 transition-colors"
                >
                  <Music2 className="w-6 h-6 text-brand" />
                  <div>
                    <p className="font-medium text-gray-900">TikTok</p>
                    <p className="text-xs text-muted-foreground">@daylight_asia</p>
                  </div>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@daylightasia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-brand/30 hover:bg-brand/5 transition-colors"
                >
                  <Youtube className="w-6 h-6 text-brand" />
                  <div>
                    <p className="font-medium text-gray-900">YouTube</p>
                    <p className="text-xs text-muted-foreground">@daylightasia</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Medium */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-brand/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-brand" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Blog</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Read our latest articles and updates
                </p>
                <a
                  href="https://medium.com/@Daylight.asia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline font-medium"
                >
                  medium.com/@Daylight.asia
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}