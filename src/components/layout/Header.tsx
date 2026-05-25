import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-12 w-32 transition-transform duration-300 group-hover:scale-105">
            <Image 
              src="/logo.webp" 
              alt="Nina-X Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#pujcovna" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Stroje</Link>
          <Link href="/podminky" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Podmínky</Link>
          <Link href="/#kontakt">
            <Button className="bg-black text-white hover:bg-primary hover:text-black font-bold px-8 h-12 rounded-2xl transition-all duration-300 shadow-xl shadow-black/10">
              Kontakt
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
