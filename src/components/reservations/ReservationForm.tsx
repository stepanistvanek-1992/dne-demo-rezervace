"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReservationFormProps {
  bikeId: string;
  bikeName: string;
  bikeDescription?: string;
  onSuccess: () => void;
}

export function ReservationForm({ bikeId, bikeName, bikeDescription, onSuccess }: ReservationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      date: undefined as Date | undefined,
    },
  });

  const onSubmit = async (values: any) => {
    if (!values.date) {
      toast.error("Prosím vyberte datum rezervace.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bikeId,
          ...values,
          date: format(values.date, "yyyy-MM-dd"),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Rezervace se nezdařila.");
      }

      toast.success("Rezervace byla úspěšně odeslána!");
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanDescription = bikeDescription?.replace(/\s*\[SKRYTO\]/g, "");

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Rezervujete si stroj</p>
        <p className="text-2xl font-black text-black">{bikeName}</p>
        
        {cleanDescription && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">O stroji</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap italic">
              {cleanDescription}
            </p>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            rules={{ required: "Jméno je povinné" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-gray-500 ml-1">Celé jméno</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Jan Novák" 
                    className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 focus-visible:ring-primary focus-visible:border-primary font-medium" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              rules={{ 
                required: "Email je povinný",
                pattern: { value: /^\S+@\S+$/i, message: "Neplatný email" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-gray-500 ml-1">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="jan.novak@example.cz" 
                      className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 focus-visible:ring-primary focus-visible:border-primary font-medium" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              rules={{ required: "Telefon je povinný" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-gray-500 ml-1">Telefon</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+420 123 456 789" 
                      className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 focus-visible:ring-primary focus-visible:border-primary font-medium" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-bold text-gray-500 ml-1">Datum rezervace (Po - Pá, So pouze dopoledne)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-12 pl-3 text-left font-medium rounded-2xl border-gray-100 bg-gray-50/50 focus-visible:ring-primary focus-visible:border-primary",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: cs })
                        ) : (
                          <span>Vyberte datum</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-3xl border-none shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date.getDay() === 0 || date < today;
                      }}
                      locale={cs}
                      className="bg-white rounded-3xl"
                    />
                  </PopoverContent>
                </Popover>
                {field.value && field.value.getDay() === 6 && (
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1 ml-1 flex items-center gap-1">
                    <span>⚠️</span> V sobotu testujeme pouze dopoledne (9:00 - 12:00).
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-primary/5 p-4 rounded-2xl space-y-2 border border-primary/10">
            <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">
              • DEMO JÍZDA TRVÁ 30 MINUT A JE ZDARMA.
            </p>
            <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">
              • NUTNO SLOŽIT VRATNOU KAUCI UVEDENOU U STROJE.
            </p>
            <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">
              • REZERVACE JSOU MOŽNÉ V PRACOVNÍ DNY (CELÝ DEN) A V SOBOTU (POUZE DOPOLEDNE).
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-black hover:text-white text-black font-bold h-14 rounded-2xl transition-all duration-300 shadow-lg shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Odesílám...</>
            ) : (
              "Potvrdit rezervaci"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
