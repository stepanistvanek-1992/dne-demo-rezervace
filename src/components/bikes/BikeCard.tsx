import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fuel, Gauge, ShieldCheck, Zap } from 'lucide-react';

interface BikeProps {
  bike: {
    id: string;
    brand: string;
    model: string;
    type: string;
    license_category: string;
    engine: string;
    power: string;
    rental_fee: number;
    deposit: number;
    image_url: string;
  };
  onReserve: (id: string) => void;
}

export function BikeCard({ bike, onReserve }: BikeProps) {
  return (
    <Card className="overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl border-gray-100 group bg-white rounded-3xl">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={bike.image_url || '/placeholder-bike.webp'}
          alt={`${bike.brand} ${bike.model}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-white/20">
          Řidičák {bike.license_category}
        </div>
      </div>
      
      <CardHeader className="p-6 pb-2">
        <div className="text-xs text-primary font-bold uppercase tracking-widest mb-1">{bike.brand}</div>
        <h3 className="text-2xl font-black text-black leading-tight">{bike.model}</h3>
      </CardHeader>
      
      <CardContent className="p-6 pt-2 grid grid-cols-2 gap-4">
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Zap className="w-4 h-4 mr-2 text-primary" />
          <span>{bike.engine}</span>
        </div>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Gauge className="w-4 h-4 mr-2 text-primary" />
          <span>{bike.power}</span>
        </div>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Fuel className="w-4 h-4 mr-2 text-primary" />
          <span>{bike.type}</span>
        </div>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
          <span>Kauce {bike.deposit.toLocaleString()} Kč</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-8 flex items-center justify-between border-t border-gray-50/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Demo jízda</span>
          <span className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">30 min | Zdarma</span>
        </div>
        <Button 
          onClick={() => onReserve(bike.id)}
          className="bg-primary hover:bg-black hover:text-white text-black font-bold px-8 h-12 rounded-2xl transition-all duration-300 shadow-lg shadow-primary/20"
        >
          Rezervovat
        </Button>
      </CardFooter>
    </Card>
  );
}
