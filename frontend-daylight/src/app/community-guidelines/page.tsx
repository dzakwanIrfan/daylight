import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CommunityGuidelinesPage() {
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
            <h2 className="text-2xl font-semibold text-gray-900">Community Guidelines</h2>
            <p className="text-sm text-muted-foreground mt-2">Last Updated: November 11, 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to Daylight! where we prioritize genuine connections and cherish moments that matter. 
              To maintain a safe and respectful environment for everyone, we've established the following 
              guidelines. By using our platform, you agree to adhere to these rules.
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Be Respectful & Kind</h3>
              <p className="text-gray-600 mb-4">
                We have a zero-tolerance policy for harassment, hate speech, or personal attacks. As an 
                international community, treating all members with respect is essential.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>No Harassment or Bullying:</strong> Members must not send unsolicited messages, 
                  persist in contacting individuals after being asked to stop, or engage in threatening, 
                  harassing, stalking, or abusive behavior, including cyber-stalking and doxxing (posting 
                  private information).
                </li>
                <li>
                  <strong>No Hate Speech:</strong> Do not submit or share material that discriminates or 
                  incites hatred based on race, ethnicity, religion, gender identity, sexual orientation, 
                  disability, region, or age. This includes slurs, derogatory stereotypes, and symbols of hate.
                </li>
                <li>
                  <strong>Respectful Discussion:</strong> While dissent is natural, discussions must remain 
                  civil and focused on issues rather than individuals. Abusive language, including verbal or 
                  physical threats, profanity, and name-calling, is strictly prohibited.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Be Authentic & Trustworthy</h3>
              <p className="text-gray-600 mb-4">
                Authenticity is the cornerstone of Daylight. We aim to foster a community built on trust 
                and genuine human connection.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>No Impersonation or Fake Profiles:</strong> Create a profile that represents you. 
                  Do not use someone else's photos or identity, and refrain from using multiple accounts to 
                  evade rules or bans. Violations will result in account termination.
                </li>
                <li>
                  <strong>Honesty in Events:</strong> If you promote an event, ensure all information is 
                  accurate. Misleading descriptions, locations, or times are not allowed.
                </li>
                <li>
                  <strong>No Spam or Commercial Activity:</strong> Daylight is not a platform for advertising 
                  personal or business promotions. It is prohibited to communicate promotional material or 
                  advertisements to other users.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Be Safe & Responsible</h3>
              <p className="text-gray-600 mb-4">
                Your safety is our top priority. Please exercise caution and responsibility when interacting 
                with others, whether in-person or online.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Safeguard Your Privacy:</strong> Avoid sharing personally identifiable information, 
                  such as your full address, phone number, or financial details. Be mindful of what you 
                  disclose in private chats.
                </li>
                <li>
                  <strong>In-Person Safety:</strong> If you choose to meet someone from Daylight, do so in 
                  a public place and inform a friend or family member of your plans. Daylight is not 
                  responsible for any in-person meetings.
                </li>
                <li>
                  <strong>Report Suspected Behavior:</strong> If you feel uncomfortable with a user or 
                  suspect someone is violating our Terms of Use, please use the in-app reporting tool 
                  immediately. Your reports are anonymous and crucial for keeping our community safe.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Be Lawful</h3>
              <p className="text-gray-600 mb-4">
                You agree to comply with all local, national, and international laws.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>No Illegal Activity:</strong> You must not use Daylight to organize, promote, or 
                  engage in any illegal activities, including selling obscene goods, drug trafficking, illegal 
                  gambling, or other crimes.
                </li>
                <li>
                  <strong>Honor Intellectual Property:</strong> Do not submit, post, or share content that 
                  you do not have the right to publish under applicable law. This includes stolen music, 
                  videos, images, or any other copyrighted material.
                </li>
                <li>
                  <strong>No Nudity or Sexually Explicit Material:</strong> Do not upload, share, or post 
                  pornographic content or any sexually explicit material, including screenshots of media that 
                  depict nudity. This applies to all forms of media, including photos, videos, and GIFs.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Consequences of Violating Our Guidelines</h3>
              <p className="text-gray-600 mb-4">
                We approach violations on a case-by-case basis and may implement one or more of the following 
                actions, depending on the severity and frequency of the violation:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                <li>Issuing a formal warning.</li>
                <li>Temporarily suspending your account.</li>
                <li>Permanently banning your account and preventing the creation of new accounts.</li>
                <li>Removing any offending content or incidents.</li>
              </ol>
              <p className="text-gray-600 mt-4">
                We reserve the right, but are not obligated, to remove any content or accounts deemed 
                inappropriate or harmful to our service and community as a whole.
              </p>
            </section>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mt-8">
              <p className="text-gray-700 text-center">
                By accessing Daylight, you agree to these guidelines and our commitment to fostering a safe 
                and supportive community. Thank you for helping us make Daylight a vibrant space for all.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}