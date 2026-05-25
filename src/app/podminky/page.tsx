import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  ShieldAlert, 
  Sun, 
  Coins, 
  Clock, 
  CalendarDays, 
  MapPin, 
  Undo2, 
  UserCheck, 
  CheckCircle2,
  Navigation,
  Compass
} from "lucide-react";

export const metadata = {
  title: "Podmínky zapůjčení | Rezervace DEMO Motocyklů Hodonín",
  description: "Hlavní i finanční podmínky pro zkušební a demo jízdy na motocyklech v Hodoníně.",
};

export default function PodminkyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gray-50/50 py-16 text-center border-b border-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none mb-4">
            Podmínky <span className="text-primary">zapůjčení</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest max-w-lg mx-auto leading-relaxed">
            Vše, co potřebujete vědět před testovací jízdou nebo zapůjčením motocyklu v Motoshopu DNX Hodonín.
          </p>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Card 1: Rider Conditions */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <UserCheck className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Pro jezdce</h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Hlavní pravidla</p>
                </div>
              </div>
              
              <div className="space-y-6 flex-1">
                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl h-fit">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm">Doklady k zapůjčení</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Platný řidičský průkaz pro danou kategorii motocyklu + druhý doklad totožnosti (např. OP nebo cestovní pas).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl h-fit">
                    <ShieldAlert className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm">Vlastní výbava</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Musíte mít kompletně vlastní motocyklovou výbavu (homologovaná přilba, moto oblečení s protektory a pevná obuv).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl h-fit">
                    <Sun className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm">Vliv počasí</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Testování probíhá formou individuální jízdy a výhradně za příznivého, suchého a bezpečného počasí.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl h-fit">
                    <CheckCircle2 className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm">Odpovědnost a rizika</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Případné poškození motocyklu zaviněné jezdcem hradí klient dle platného ceníku oprav. Motoshop DNX si vyhrazuje právo jízdu zrušit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Financial Conditions */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Coins className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Finance</h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Kauce a ceny</p>
                </div>
              </div>
              
              <div className="space-y-6 flex-1">
                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl h-fit">
                    <Clock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm">30 minut zdarma</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed font-semibold">
                      Standardní zkušební jízda v trvání do 30 minut je u nás zcela ZDARMA!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl h-fit">
                    <Compass className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm">Delší zapůjčení</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Individuální doba zapůjčení nad rámec 30 minut je možná po předchozí domluvě a podléhá individuálnímu schválení.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl h-fit">
                    <Coins className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm">Vratná kauce</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Vratná kauce se pohybuje v rozmezí <span className="font-bold text-black">20 000 až 50 000 Kč</span> (výjimečně do 60 000 Kč) podle vybraného modelu stroje. 
                      Skládá se na místě v hotovosti při převzetí. Konkrétní kauce je uvedena přímo u každého motocyklu.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl h-fit">
                    <Navigation className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm">Kilometrový limit</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Při delším zapůjčení je v ceně zahrnut limit (zpravidla 100 km / den). Překročení limitu je zpoplatněno sazbou <span className="font-bold text-black">10 Kč za každý další km</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Process Steps */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <CalendarDays className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Průběh</h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Krok za krokem</p>
                </div>
              </div>
              
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-8 flex-1">
                
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[35px] top-0 bg-primary border-4 border-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]" />
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" /> 1. Rezervace
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Vyplníte jednoduchý webový formulář s výběrem modelu a termínu jízdy. Náš tým vám termín obratem potvrdí telefonicky nebo e-mailem.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[35px] top-0 bg-primary border-4 border-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]" />
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" /> 2. Převzetí v Hodoníně
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Dostavíte se na naši prodejnu v Hodoníně. Provedeme kontrolu dokladů, podepíšeme smlouvu o zápůjčce, složíte kauci a náš technik vás seznámí s ovládáním stroje.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[35px] top-0 bg-black border-4 border-white w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px]" />
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm flex items-center gap-2">
                      <Undo2 className="w-4 h-4 text-gray-400" /> 3. Vrácení stroje
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Po ukončení jízdy společně zkontrolujeme stav motocyklu, stav paliva a ujeté kilometry. Pokud je vše v pořádku, vrátíme vám kauci zpět v plné výši.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
          
          <div className="flex justify-center mt-16">
            <Link href="/#pujcovna">
              <Button className="bg-primary hover:bg-black hover:text-white text-black font-black uppercase tracking-widest text-xs md:text-sm px-10 h-14 rounded-2xl transition-all duration-300 shadow-xl shadow-primary/20 cursor-pointer">
                Vybrat testovací stroj
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
