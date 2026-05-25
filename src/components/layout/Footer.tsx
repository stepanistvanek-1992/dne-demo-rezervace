import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer id="kontakt" className="bg-black text-white py-10 mt-12 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link href="/" className="block relative h-10 w-28 hover:opacity-80 transition-opacity">
              <Image src="/logo.webp" alt="Nina-X Logo" fill className="object-contain" />
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              Autorizovaný prodejce a servis motocyklů v Hodoníně. Vášeň pro dvě kola od roku 1992.
            </p>
          </div>
          <div>
            <h4 className="text-primary font-black uppercase tracking-widest text-[10px] mb-4">Rychlý kontakt</h4>
            <div className="space-y-2 text-gray-300 font-bold uppercase text-xs tracking-tighter">
              <p className="flex items-center gap-2"><span className="text-primary">•</span> Velkomoravská 81, Hodonín</p>
              <p className="flex items-center gap-2"><span className="text-primary">•</span> info@motoshopdnx.cz</p>
              <Link href="tel:+420773145404" className="flex items-center gap-2 group">
                <span className="text-primary">•</span> 
                <span className="text-lg md:text-xl font-black text-primary group-hover:text-white transition-colors duration-300">+420 773 145 404</span>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-primary font-black uppercase tracking-widest text-[10px] mb-4">Showroom</h4>
            <div className="space-y-2 text-gray-300 font-bold uppercase text-xs tracking-tighter">
              <p className="flex justify-between"><span>Pondělí - Pátek</span> <span className="text-white">9:00 - 17:00</span></p>
              <p className="flex justify-between"><span>Sobota - Neděle</span> <span className="text-white">Zavřeno</span></p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 text-center flex flex-col items-center gap-2">
          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} MOTOSHOP DNX | VŠECHNA PRÁVA VYHRAZENA
          </p>
          <div className="flex gap-6">
            <Link href="/podminky" className="text-[10px] text-gray-400 hover:text-primary transition-colors uppercase tracking-widest font-bold">
              Podmínky zapůjčení
            </Link>
            <Link href="/dnx-admin-rezervace" className="text-[10px] text-gray-400 hover:text-primary transition-colors uppercase tracking-widest font-bold">
              Admin System
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
