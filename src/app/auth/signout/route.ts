import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Sign out (POST only, so it can't be triggered by a cross-site GET). */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
