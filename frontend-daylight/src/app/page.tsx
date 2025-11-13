'use client';

import { useAuth } from '@/hooks/use-auth';
import EventsPage from './(main)/events/page';

export default function HomePage() {
  useAuth();

  return (
    <EventsPage />
  );
}