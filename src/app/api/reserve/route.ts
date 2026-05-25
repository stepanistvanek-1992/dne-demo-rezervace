import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { z } from 'zod';
import { isRateLimited } from '@/lib/rateLimit';

const resend = new Resend(process.env.RESEND_API_KEY);

const reservationSchema = z.object({
  bikeId: z.string().uuid("Neplatný identifikátor motocyklu."),
  fullName: z.string().trim()
    .min(2, "Jméno musí mít alespoň 2 znaky.")
    .max(100, "Jméno může mít maximálně 100 znaků.")
    .regex(/^[a-zA-Zá-žÁ-Ž\s.-]+$/, "Jméno obsahuje nepovolené znaky."),
  email: z.string().trim().email("Neplatná e-mailová adresa."),
  phone: z.string().trim()
    .min(9, "Telefonní číslo je příliš krátké.")
    .max(20, "Telefonní číslo je příliš dlouhé.")
    .regex(/^(\+?[0-9\s.-]+)$/, "Neplatný formát telefonního čísla."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Neplatný formát data. Použijte YYYY-MM-DD.")
    .refine((dateStr) => {
      const date = new Date(dateStr + 'T00:00:00');
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      today.setHours(0,0,0,0);
      return date >= today;
    }, "Datum nesmí být v minulosti.")
    .refine((dateStr) => {
      const date = new Date(dateStr + 'T00:00:00');
      const day = date.getDay();
      return day !== 0;
    }, "Nedělní rezervace nejsou podporovány.")
});

export async function POST(req: Request) {
  try {
    // Rate Limiting: max 3 reservations per 10 minutes per IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    if (isRateLimited(`reserve_${ip}`, 3, 600000)) {
      return NextResponse.json(
        { message: 'Příliš mnoho požadavků. Zkuste to prosím znovu za 10 minut.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    
    // Validate inputs
    const validation = reservationSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0].message;
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { bikeId, fullName, email, phone, date } = validation.data;

    // 1. Save to Supabase
    const { data, error } = await supabase
      .from('reservations')
      .insert([
        { 
          bike_id: bikeId, 
          full_name: fullName, 
          email, 
          phone, 
          reservation_date: date,
          status: 'pending'
        }
      ]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Tento stroj máte již na tento den rezervovaný.' },
          { status: 400 }
        );
      }
      throw error;
    }

    // 2. Fetch bike info for email
    const { data: bike } = await supabase
      .from('bikes')
      .select('brand, model')
      .eq('id', bikeId)
      .single();

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'rezervace@dnx-rezervace.cz',
        to: 'info@nina-x.cz',
        subject: `Nová rezervace: ${bike?.brand} ${bike?.model}`,
        html: `
          <h1>Nová žádost o rezervaci</h1>
          <p><strong>Motocykl:</strong> ${bike?.brand} ${bike?.model}</p>
          <p><strong>Datum:</strong> ${date}</p>
          <p><strong>Jméno:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefon:</strong> ${phone}</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reservation error:', error);
    return NextResponse.json(
      { message: 'Chyba při zpracování rezervace.' },
      { status: 500 }
    );
  }
}
