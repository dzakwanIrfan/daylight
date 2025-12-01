'use client';

import { usePathname, useRouter } from 'next/navigation';
import { X, LayoutDashboard, Users, Calendar, Handshake, Crown, Settings, FileText, CreditCard, BookText, Folder, Tags, Sparkles, Sparkle, BarChart3, Globe, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Events',
        href: '/admin/events',
        icon: Calendar,
      },
      {
        title: 'Partners',
        href: '/admin/partners',
        icon: Handshake,
      },
    ],
  },
  {
    title: 'Locations',
    items: [
      {
        title: 'Countries',
        href: '/admin/locations/countries',
        icon: Globe,
      },
      {
        title: 'Cities',
        href: '/admin/locations/cities',
        icon: MapPin,
      },
    ],
  },
  {
    title: 'Subscriptions',
    items: [
      {
        title: 'Subscriptions',
        href: '/admin/subscriptions',
        icon: Crown,
      },
      {
        title: 'Plans',
        href: '/admin/subscription-plans',
        icon: Settings,
      },
    ],
  },
  {
    title: 'Financial',
    items: [
      {
        title: 'Transactions',
        href: '/admin/transactions',
        icon: FileText,
      },
      {
        title: 'Payment Methods',
        href: '/admin/payment-methods',
        icon: CreditCard,
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        title: 'Blog Posts',
        href: '/admin/blog',
        icon: BookText,
      },
      {
        title: 'Categories',
        href: '/admin/blog/categories',
        icon: Folder,
      },
      {
        title: 'Tags',
        href: '/admin/blog/tags',
        icon: Tags,
      },
    ],
  },
  {
    title: 'Personality',
    items: [
      {
        title: 'Questions',
        href: '/admin/persona-questions',
        icon: Sparkles,
      },
      {
        title: 'Archetypes',
        href: '/admin/archetype-details',
        icon: Sparkle,
      },
    ],
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/admin') {
      return pathname === '/admin';
    }

    // Special handling for blog routes
    if (href === '/admin/blog') {
      return pathname === '/admin/blog' || 
             pathname === '/admin/blog/new' ||
             pathname. match(/^\/admin\/blog\/[^/]+\/edit$/);
    }

    if (href === '/admin/blog/categories') {
      return pathname === '/admin/blog/categories';
    }

    if (href === '/admin/blog/tags') {
      return pathname === '/admin/blog/tags';
    }

    // Special handling for location routes
    if (href === '/admin/locations/countries') {
      return pathname === '/admin/locations/countries' || 
             pathname === '/admin/locations/countries/new' ||
             pathname. match(/^\/admin\/locations\/countries\/[^/]+\/edit$/);
    }

    if (href === '/admin/locations/cities') {
      return pathname === '/admin/locations/cities' || 
             pathname === '/admin/locations/cities/new' ||
             pathname.match(/^\/admin\/locations\/cities\/[^/]+\/edit$/);
    }
    
    // For other routes, exact match or starts with href + /
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col overflow-hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <Image src="/daylight.png" alt="DayLight Logo" width={32} height={32} className="rounded-lg" />
            <div>
              <h1 className="font-headline text-lg font-bold text-gray-900">DayLight</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Title */}
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
              
              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const itemIsActive = isActive(item.href);

                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        itemIsActive
                          ? 'bg-brand text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className={cn(
                          'ml-auto text-xs px-2 py-0.5 rounded-full',
                          itemIsActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-brand/10 text-brand'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="px-4 py-3 bg-brand/5 rounded-lg">
            <p className="text-xs font-medium text-gray-900">Admin Access</p>
            <p className="text-xs text-gray-600 mt-1">
              You have full system privileges
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}