import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
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
            <h2 className="text-2xl font-semibold text-gray-900">Privacy Policy</h2>
            <p className="text-sm text-muted-foreground mt-2">Last Updated: November 11, 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              We value your privacy. This Privacy Policy outlines the information we collect, how we use it, 
              and with whom we share it.
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
              <p className="text-gray-600 mb-4">We collect information to operate and enhance the Service:</p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Information You Provide:</h4>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>
                    <strong>Profile Information:</strong> Your name, profile photo, age, gender, and other 
                    biographical details.
                  </li>
                  <li>
                    <strong>User Content:</strong> The images, text, and other material you post.
                  </li>
                  <li>
                    <strong>Communication Data:</strong> Messages that you send and receive within the app.
                  </li>
                  <li>
                    <strong>Transaction Information:</strong> If the Service involves payment, we collect 
                    information related to your transactions.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Information We Collect Automatically:</h4>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>
                    <strong>Device Data:</strong> Information about your device model, operating system, 
                    unique device identifiers, and mobile network information.
                  </li>
                  <li>
                    <strong>Usage Information:</strong> Data regarding pages you view, features you use, 
                    and interactions you have with the Service.
                  </li>
                  <li>
                    <strong>Location Information:</strong> We may collect information about your real-time 
                    geographic location to match you with nearby events or users. You can disable this feature 
                    via your device settings.
                  </li>
                  <li>
                    <strong>Information from Third-Party Services:</strong> If you access our Service through 
                    third-party platforms like Facebook or Google, we may gather information from those services.
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
              <p className="text-gray-600 mb-2">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Provide and maintain our Service.</li>
                <li>Connect you with relevant users or events.</li>
                <li>Enhance the security and safety of our platform.</li>
                <li>Analyze usage of the Service for product development.</li>
                <li>Send updates, promotions, and other relevant information.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. How We Share Your Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Other Users:</strong> Your profile information, including your name and other 
                  identifying details, is visible to other users of the Service.
                </li>
                <li>
                  <strong>Third-Party Service Providers:</strong> We share information with third-party 
                  service providers that assist us in operating the Service, such as hosting, data analytics, 
                  and customer support.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> We may use your data to comply with applicable laws, 
                  regulations, legal processes, or governmental requests.
                </li>
                <li>
                  <strong>With Your Consent:</strong> We may disclose your information for any other purpose 
                  with your explicit consent.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h3>
              <p className="text-gray-600">
                We implement appropriate technical and organizational measures to safeguard your personal 
                information against unauthorized access, disclosure, or loss. However, no method of 
                transmission over the internet or electronic storage is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Your Choices and Rights</h3>
              <p className="text-gray-600 mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Access your personal information that we hold.</li>
                <li>Correct any inaccurate information.</li>
                <li>Request the deletion of your personal data.</li>
                <li>Withdraw your consent at any time if we process data based on your consent.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h3>
              <p className="text-gray-600">
                We will retain your personal data as long as necessary to provide the Service, comply with 
                legal obligations, or resolve disputes.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Changes to this Privacy Policy</h3>
              <p className="text-gray-600">
                This Privacy Policy is subject to change. We will notify you via email and/or a prominent 
                notice on our Service prior to any changes taking effect, and we will update the "Last Updated" 
                date at the top of this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Contact Us</h3>
              <p className="text-gray-600">
                If you have questions regarding this Privacy Policy, please contact us at{' '}
                <a href="mailto:contact@daylightapp.asia" className="text-brand hover:underline">
                  contact@daylightapp.asia
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}