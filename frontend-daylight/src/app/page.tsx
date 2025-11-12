import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, Calendar, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-12">
          <div className="flex justify-between items-center h-24">
            <h1 className="text-2xl font-bold text-black logo-text">
              DayLight
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className='font-bold border border-r-4 border-b-4 border-black rounded-full'>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="font-blod bg-brand hover:bg-brand-dark text-white border border-r-4 border-b-4 border-black rounded-full">
                <Link href="/personality-test">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-0">
            <span className='px-4 py-2 border-brand border rounded-full font-bold text-sm'>The Light of the Day</span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              Find <span className='text-brand'>New Friends</span> Today!
            </h1>
            <p className="md:text-xl text-lg text-muted-foreground max-w-2xl mx-auto">
              Daylight is a lifestyle platform connecting people through real life experiences, from dinners, coffee, billiard, book club, yoga and many more. 
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              className="bg-brand hover:bg-brand-dark text-white font-bold border border-r-4 border-b-4 border-black rounded-full"
              asChild
            >
              <Link href="/personality-test">
                Take Personality Test
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-bold border border-r-4 border-b-4 border-black rounded-full" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-brand">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-12 text-white">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Sparkles,
                title: 'Take the Test',
                description: 'Complete our personality assessment to discover your social archetype',
              },
              {
                icon: Users,
                title: 'Get Matched',
                description: 'We pair you with compatible people based on your personality profile',
              },
              {
                icon: Calendar,
                title: 'Join a Event',
                description: 'Meet your matches at carefully curated event experiences',
              },
              {
                icon: Heart,
                title: 'Build Connections',
                description: 'Form meaningful friendships with people who truly get you',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center space-y-4 bg-white p-8 border border-r-4 border-b-4 border-black rounded-2xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10">
                  <feature.icon className="w-8 h-8 text-brand" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold">
              Personality Test
            </h2>
            <p className="text-xl text-muted-foreground">
              Less about labels, more about understanding your relationship with others.
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-brand hover:bg-brand-dark text-white text-lg font-bold border border-r-4 border-b-4 border-black rounded-full"
            asChild
          >
            <Link href="/personality-test">
              Take a Test
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 DayLight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}