'use client';

import { useAuth } from '@/hooks/use-auth';
import EventsPage from './(main)/events/page';
import LandingPage from './home/page';

export default function HomePage() {
  useAuth();

  return (
    <LandingPage />
  );
}