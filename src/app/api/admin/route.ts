import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function verifyPassword(req: Request): boolean {
  const incomingPassword = req.headers.get('x-admin-password');
  const actualPassword = process.env.ADMIN_PASSWORD;
  
  if (!actualPassword) {
    console.error("ADMIN_PASSWORD is not configured on the server!");
    return false;
  }
  
  return incomingPassword === actualPassword;
}

export async function GET(req: Request) {
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
  if (!verifyPassword(req)) {
    return NextResponse.json({ message: 'Neautorizovaný přístup - nesprávné heslo.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, ...params } = body;
    const password = process.env.ADMIN_PASSWORD!;

    let result;
    
    switch (action) {
      case 'confirm_reservation':
        result = await supabase.rpc('confirm_reservation_secure', {
          res_id: params.id,
          admin_password: password
        });
        break;
        
      case 'delete_reservation':
        result = await supabase.rpc('delete_reservation_secure', {
          res_id: params.id,
          admin_password: password
        });
        break;
        
      case 'save_bike':
        result = await supabase.rpc('save_bike_secure', {
          p_id: params.p_id,
          p_brand: params.p_brand,
          p_model: params.p_model,
          p_type: params.p_type,
          p_license_category: params.p_license_category,
          p_engine: params.p_engine,
          p_power: params.p_power,
          p_deposit: params.p_deposit,
          p_rental_fee: params.p_rental_fee,
          p_image_url: params.p_image_url,
          p_description: params.p_description,
          admin_password: password
        });
        break;
        
      case 'delete_bike':
        result = await supabase.rpc('delete_bike_secure', {
          bike_id: params.id,
          admin_password: password
        });
        break;
        
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
