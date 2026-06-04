"use client";

import { cn } from "@/lib/utils";

interface FilterBarProps {
  activeBrand: string;
  activeType: string;
  activeLicense: string;
  onBrandChange: (brand: string) => void;
  onTypeChange: (type: string) => void;
  onLicenseChange: (license: string) => void;
}

export function FilterBar({
  activeBrand,
  activeType,
  activeLicense,
  onBrandChange,
  onTypeChange,
  onLicenseChange,
}: FilterBarProps) {
  const brands = ["Vše", "Aprilia", "Moto Guzzi", "Vespa", "Piaggio", "QJ Motor", "Royal Enfield"];
  const types = ["Vše", "Nakedbike", "Scooter", "Adventure", "Supersport", "Heritage"];
  const licenses = ["Vše", "A", "A2", "A1", "B"];

  return (
    <div className="bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 space-y-6">
      <div className="flex flex-wrap items-center gap-6 md:gap-10">
        {/* Brand Filter */}
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Značka</span>
          <div className="flex gap-2">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => onBrandChange(brand)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-black transition-all duration-300 uppercase tracking-tighter whitespace-nowrap",
                  activeBrand === brand
                    ? "bg-primary text-black shadow-lg shadow-primary/20 scale-105"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                )}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:block h-8 w-px bg-gray-100" />

        {/* Type Filter */}
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Typ</span>
          <div className="flex gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-black transition-all duration-300 uppercase tracking-tighter whitespace-nowrap",
                  activeType === type
                    ? "bg-primary text-black shadow-lg shadow-primary/20 scale-105"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-50 w-full" />

      {/* License Filter */}
      <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Řidičák</span>
        <div className="flex gap-2">
          {licenses.map((license) => (
            <button
              key={license}
              onClick={() => onLicenseChange(license)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-black transition-all duration-300 uppercase tracking-tighter",
                activeLicense === license
                  ? "bg-black text-white shadow-lg shadow-black/20 scale-105"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              )}
            >
              {license === "Vše" ? "Všechny" : license}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
