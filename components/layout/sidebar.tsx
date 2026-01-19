"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useConnectionStore } from '@/lib/store/connection-store'
import {
  Store,
  FileCode,
  Link2,
  Search,
  ChevronRight,
  Home,
  Github,
  Coffee
} from 'lucide-react'

interface SidebarNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

export function Sidebar() {
  const pathname = usePathname()
  const currentStore = useConnectionStore((state) => state.currentStore)
  const currentStoreId = currentStore?.id

  const baseItems: SidebarNavItem[] = [
    {
      title: 'Stores',
      href: '/dashboard',
      icon: Home,
    },
  ]

  const storeItems: SidebarNavItem[] = currentStoreId
    ? [
        {
          title: 'Overview',
          href: `/dashboard/stores/${currentStoreId}`,
          icon: Store,
        },
        {
          title: 'Authorization Model',
          href: `/dashboard/stores/${currentStoreId}/model`,
          icon: FileCode,
        },
        {
          title: 'Relationship Tuples',
          href: `/dashboard/stores/${currentStoreId}/tuples`,
          icon: Link2,
        },
        {
          title: 'Query',
          href: `/dashboard/stores/${currentStoreId}/query`,
          icon: Search,
        },
      ]
    : []

  return (
    <aside className="fixed left-0 top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r md:block">
      <div className="h-full py-6 pr-6 lg:py-8 flex flex-col">
        <nav className="flex flex-col space-y-1 pl-4 flex-1">
          {baseItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          ))}

          {currentStore && (
            <>
              <div className="my-4 border-t" />
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Store
                </p>
                <p className="mt-1 text-sm font-medium truncate" title={currentStore.name}>
                  {currentStore.name}
                </p>
              </div>

              {storeItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                  <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Bottom Links */}
        <div className="pl-4 pt-4 border-t space-y-1">
          <a
            href="https://github.com/dz1922/openfga-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </a>
          <a
            href="https://buymeacoffee.com/dachao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Coffee className="mr-2 h-4 w-4" />
            Buy me a coffee
          </a>
        </div>
      </div>
    </aside>
  )
}
