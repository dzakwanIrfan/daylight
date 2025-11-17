import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
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
            <h2 className="text-2xl font-semibold text-gray-900">Terms & Conditions</h2>
            <p className="text-sm text-muted-foreground mt-2">Last Updated: November 11, 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to Daylight! These Terms and Conditions ("T&C") govern your use of our application, 
              website, and services (collectively referred to as "our Service"). By accessing or using the 
              Service, you agree to comply with these T&C.
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
              <p className="text-gray-600">
                By using our Service, you confirm that you have read, understood, and accepted these T&C. 
                If you do not agree with any part of these terms, you may not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. User Eligibility</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Age:</strong> You must be at least 18 years old to use the Service. By registering 
                  for an account, you affirm that you meet this age requirement.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> The Service may not be used in jurisdictions where such 
                  use is prohibited.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Account Creation:</strong> You must provide accurate and complete information when 
                  creating an account with us.
                </li>
                <li>
                  <strong>Account Security:</strong> You are responsible for maintaining the confidentiality 
                  of your login information and for all activities that occur under your account. You must 
                  notify us immediately if you become aware of any unauthorized use of your account.
                </li>
                <li>
                  <strong>Restrictions:</strong> You may not:
                  <ul className="list-circle pl-6 mt-2 space-y-1">
                    <li>Create fake accounts or impersonate others.</li>
                    <li>Use the Service for any illegal or unauthorized purposes.</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. User Content Rights and Licenses</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Your Rights:</strong> You retain ownership of the content you upload, post, or share 
                  on the Service (collectively referred to as "User Content").
                </li>
                <li>
                  <strong>License to Daylight:</strong> By uploading User Content, you grant Daylight an 
                  irrevocable, non-exclusive, royalty-free, and sublicensable license to use, reproduce, modify, 
                  adapt, publish, and distribute your User Content in connection with the Service. This license 
                  will terminate when you remove your User Content from the Service, unless that content has 
                  been shared with others.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Community Rules</h3>
              <p className="text-gray-600">
                While using the Service, you are expected to adhere to The Daylight Community Guidelines. 
                Violations of these guidelines will be considered a material breach of the T&C, and we reserve 
                the right to terminate your account.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Our Rights</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Suspension and Termination:</strong> We may suspend or terminate your account at 
                  any time, with or without notice, for any reason or no reason at all.
                </li>
                <li>
                  <strong>Service Changes:</strong> You acknowledge that we may modify or discontinue the 
                  Service (or any part of it) at any time, with or without notice.
                </li>
                <li>
                  <strong>Enforcement of T&C:</strong> We may cooperate with legal authorities and third 
                  parties in investigating alleged violations, including disclosing the identity or contact 
                  information of any individual you claim is infringing upon your rights.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Disclaimers and Limitation of Liability</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Disclaimer:</strong> The Service is provided on an "as is" and "as available" basis, 
                  without warranties of any kind. Daylight is not obligated to monitor user behavior, verify 
                  the accuracy of events, or oversee your interactions with other users.
                </li>
                <li>
                  <strong>Disclaimer of Warranty:</strong> Daylight disclaims all warranties and guarantees 
                  regarding the Service, whether express or implied, including but not limited to warranties 
                  of error-free operation or uninterrupted service.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Indemnification</h3>
              <p className="text-gray-600">
                You agree to defend and indemnify Daylight, its subsidiaries, affiliates, and their respective 
                officers from any claims or demands (including legal fees) made by any third party as a result 
                of your violation of these T&C.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Governing Law and Dispute Resolution</h3>
              <p className="text-gray-600">
                These T&C shall be governed by and constructed in accordance with the laws of the Republic of 
                Indonesia. Any disputes arising from or related to these T&C will be submitted to the exclusive 
                jurisdiction of the Indonesian courts.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}