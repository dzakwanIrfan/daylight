import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - DayLight',
  description: 'Admin panel for managing DayLight platform',
};

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}