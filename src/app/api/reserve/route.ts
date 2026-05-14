import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bikeId, fullName, email, phone, date } = body;

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

    // 3. Send email via Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
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
