import { Coffee, Github, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with Next.js. Licensed under{' '}
          <Link
            href="https://opensource.org/licenses/MIT"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-foreground"
          >
            MIT
          </Link>
          .
        </p>

        <div className="flex items-center space-x-4">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <Github className="mr-1 h-4 w-4" />
            GitHub
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>

          <Link
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <Coffee className="mr-1 h-4 w-4" />
            Buy me a coffee
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
