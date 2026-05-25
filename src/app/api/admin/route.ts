import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { isRateLimited } from '@/lib/rateLimit';

function verifyPassword(req: Request): boolean {
  const incomingPassword = req.headers.get('x-admin-password');
  const actualPassword = process.env.ADMIN_PASSWORD;
  
  if (!actualPassword) {
    console.error("ADMIN_PASSWORD is not configured on the server!");
    return false;
  }
  
  return incomingPassword === actualPassword;
}

const idSchema = z.object({
  id: z.string().uuid("Neplatný identifikátor.")
});

const saveBikeSchema = z.object({
  p_id: z.string().uuid("Neplatný identifikátor motocyklu.").nullable().optional(),
  p_brand: z.string().trim().min(1, "Značka je povinná.").max(50, "Značka může mít max 50 znaků."),
  p_model: z.string().trim().min(1, "Model je povinný.").max(50, "Model může mít max 50 znaků."),
  p_type: z.enum(['Scooter', 'Adventure', 'SuperSport', 'Supersport', 'Nakedbike', 'Heritage'], {
    message: "Neplatný typ motocyklu."
  }),
  p_license_category: z.enum(['A', 'A2', 'A1', 'B'], {
    message: "Neplatná skupina řidičského oprávnění."
  }),
  p_engine: z.string().trim().min(1, "Motor je povinný.").max(30),
  p_power: z.string().trim().min(1, "Výkon je povinný.").max(30),
  p_deposit: z.number().int().nonnegative("Kauce nesmí být záporná.").max(1000000),
  p_rental_fee: z.number().int().nonnegative("Cena nesmí být záporná.").max(100000),
  p_image_url: z.string().url("Neplatná URL obrázku.").or(z.string().length(0)),
  p_description: z.string().trim().max(2000, "Popis je příliš dlouhý.")
});

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  if (isRateLimited(`admin_get_${ip}`, 10, 60000)) {
    return NextResponse.json({ message: 'Příliš mnoho požadavků. Zkuste to prosím znovu za minutu.' }, { status: 429 });
  }

  if (!verifyPassword(req)) {
    return NextResponse.json({ message: 'Neautorizovaný přístup - nesprávné heslo.' }, { status: 401 });
  }

  try {
    const password = process.env.ADMIN_PASSWORD!;
    const { data, error } = await supabase.rpc('get_admin_data', { admin_password: password });
    
    if (error) {
      console.error("Database RPC error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ message: 'Vnitřní chyba serveru.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  if (isRateLimited(`admin_post_${ip}`, 10, 60000)) {
    return NextResponse.json({ message: 'Příliš mnoho požadavků. Zkuste to prosím znovu za minutu.' }, { status: 429 });
  }

  if (!verifyPassword(req)) {
    return NextResponse.json({ message: 'Neautorizovaný přístup - nesprávné heslo.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const password = process.env.ADMIN_PASSWORD!;

    let result;
    
    switch (action) {
      case 'confirm_reservation':
      case 'delete_reservation': {
        const val = idSchema.safeParse(body);
        if (!val.success) {
          return NextResponse.json({ message: val.error.issues[0].message }, { status: 400 });
        }
        
        if (action === 'confirm_reservation') {
          result = await supabase.rpc('confirm_reservation_secure', {
            res_id: val.data.id,
            admin_password: password
          });
        } else {
          result = await supabase.rpc('delete_reservation_secure', {
            res_id: val.data.id,
            admin_password: password
          });
        }
        break;
      }
        
      case 'save_bike': {
        const val = saveBikeSchema.safeParse(body);
        if (!val.success) {
          return NextResponse.json({ message: val.error.issues[0].message }, { status: 400 });
        }
        
        let type = val.data.p_type;
        if (type === 'Supersport') {
          type = 'SuperSport';
        }
        
        result = await supabase.rpc('save_bike_secure', {
          p_id: val.data.p_id,
          p_brand: val.data.p_brand,
          p_model: val.data.p_model,
          p_type: type,
          p_license_category: val.data.p_license_category,
          p_engine: val.data.p_engine,
          p_power: val.data.p_power,
          p_deposit: val.data.p_deposit,
          p_rental_fee: val.data.p_rental_fee,
          p_image_url: val.data.p_image_url,
          p_description: val.data.p_description,
          admin_password: password
        });
        break;
      }
        
      case 'delete_bike': {
        const val = idSchema.safeParse(body);
        if (!val.success) {
          return NextResponse.json({ message: val.error.issues[0].message }, { status: 400 });
        }
        
        result = await supabase.rpc('delete_bike_secure', {
          bike_id: val.data.id,
          admin_password: password
        });
        break;
      }
        
      default:
        return NextResponse.json({ message: 'Neznámá akce.' }, { status: 400 });
    }

    if (result.error) {
      console.error(`Database RPC error for action ${action}:`, result.error);
      return NextResponse.json({ message: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ message: 'Vnitřní chyba serveru při zpracování požadavku.' }, { status: 500 });
  }
}
