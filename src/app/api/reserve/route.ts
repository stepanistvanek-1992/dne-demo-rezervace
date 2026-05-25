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

    // 0. Check if this bike is already reserved on this day
    const { data: existingReservation, error: checkError } = await supabase
      .from('reservations')
      .select('id')
      .eq('bike_id', bikeId)
      .eq('reservation_date', date)
      .limit(1);

    if (checkError) {
      console.error('Check reservation error:', checkError);
      throw checkError;
    }

    if (existingReservation && existingReservation.length > 0) {
      return NextResponse.json(
        { message: 'Tento stroj je již na vybraný den rezervovaný jiným zájemcem.' },
        { status: 400 }
      );
    }

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

    // 3. Send confirmation email to customer, and CC info@nina-x.cz
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'rezervace@dnx-rezervace.cz',
        to: email,
        cc: 'info@nina-x.cz',
        subject: `Potvrzení přijetí rezervace: ${bike?.brand} ${bike?.model}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #fff;">
            <h2 style="color: #000; font-size: 20px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #ffed00; padding-bottom: 10px; margin-bottom: 20px;">
              Rezervace přijata
            </h2>
            <p style="font-size: 14px; line-height: 1.6; color: #333; margin-bottom: 20px;">
              Ahoj, rezervace na tvůj vybraný motocykl byla úspěšně přijata, brzy tě budeme kontaktovat s potvrzením termínu.
            </p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffed00;">
              <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Motocykl:</strong> ${bike?.brand} ${bike?.model}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Datum rezervace:</strong> ${date}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Jméno zájemce:</strong> ${fullName}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Telefon:</strong> ${phone}</p>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
              Tým MOTOSHOP DNX Hodonín<br />
              <a href="mailto:info@motoshopdnx.cz" style="color: #000; font-weight: bold; text-decoration: none;">info@motoshopdnx.cz</a>
            </p>
          </div>
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
