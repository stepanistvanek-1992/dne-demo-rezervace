"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BikeCard } from "@/components/bikes/BikeCard";
import { FilterBar } from "@/components/bikes/FilterBar";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [bikes, setBikes] = useState<any[]>([]);
  const [filteredBikes, setFilteredBikes] = useState<any[]>([]);
  const [activeBrand, setActiveBrand] = useState("Vše");
  const [activeType, setActiveType] = useState("Vše");
  const [activeLicense, setActiveLicense] = useState("Vše");
  const [selectedBike, setSelectedBike] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBikes();
  }, []);

  useEffect(() => {
    let result = bikes;
    if (activeBrand !== "Vše") {
      result = result.filter(
        (b) => (b.brand || "").toLowerCase().trim() === activeBrand.toLowerCase().trim()
      );
    }
    if (activeType !== "Vše") {
      result = result.filter(
        (b) => (b.type || "").toLowerCase().trim() === activeType.toLowerCase().trim()
      );
    }
    if (activeLicense !== "Vše") {
      result = result.filter(
        (b) => (b.license_category || "").toLowerCase().trim() === activeLicense.toLowerCase().trim()
      );
    }
    setFilteredBikes(result);
  }, [activeBrand, activeType, activeLicense, bikes]);

  async function fetchBikes() {
    setIsLoading(true);
    const { data } = await supabase
      .from("bikes")
      .select("*")
      .order("brand", { ascending: true });

    if (data) {
      setBikes(data);
      setFilteredBikes(data);
    }
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Compact Hero Section */}
      <section className="py-12 bg-gray-50/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">
              ZAREZERVUJ SI <br /> SVÉ <span className="text-primary italic">DEMO</span>
            </h1>
          </div>
          <div className="max-w-md">
            <p className="text-gray-500 font-medium leading-tight text-sm mb-2">
              Autorizovaný prodejce značek <span className="text-black font-bold">Aprilia</span>, <span className="text-black font-bold">Moto Guzzi</span>, <span className="text-black font-bold">Vespa</span>, <span className="text-black font-bold">Piaggio</span>, <span className="text-black font-bold">QJ Motor</span>, <span className="text-black font-bold">Royal Enfield</span> a <span className="text-black font-bold">Zontes</span> v Hodoníně.
            </p>
          </div>
        </div>
      </section>

      {/* Horizontal Filter Bar */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <FilterBar
          activeBrand={activeBrand}
          activeType={activeType}
          activeLicense={activeLicense}
          onBrandChange={setActiveBrand}
          onTypeChange={setActiveType}
          onLicenseChange={setActiveLicense}
        />
      </section>

      {/* Main Grid Section */}
      <section id="pujcovna" className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[450px] bg-gray-50 animate-pulse rounded-[2rem]" />
              ))}
            </div>
          ) : filteredBikes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredBikes.map((bike) => (
                <div key={bike.id}>
                  <BikeCard
                    bike={bike}
                    onReserve={() => setSelectedBike(bike)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
              <p className="text-gray-400 text-lg font-bold uppercase tracking-widest">Žádné stroje nenalezeny</p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selectedBike} onOpenChange={() => setSelectedBike(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] p-8 border-none shadow-3xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic">Rezervace jízdy</DialogTitle>
          </DialogHeader>
          {selectedBike && (
            <ReservationForm
              bikeId={selectedBike.id}
              bikeName={`${selectedBike.brand} ${selectedBike.model}`}
              bikeDescription={selectedBike.description}
              onSuccess={() => setSelectedBike(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" richColors />

      <Footer />
    </main>
  );
}
