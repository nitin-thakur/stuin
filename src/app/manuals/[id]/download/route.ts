import { NextResponse } from "next/server";
import { getManualById } from "@/lib/manuals";
import { createAdminClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Download a lab manual via a short-lived signed URL. Visibility is enforced by
 * RLS in getManualById (approved -> any signed-in user; pending/rejected ->
 * uploader or admin only). The bucket itself stays private.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const manual = await getManualById(id);
  if (!manual) return new NextResponse("Not found", { status: 404 });

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(serverEnv.uploadBucket)
    .createSignedUrl(manual.object_key, 60, {
      download: manual.original_filename,
    });

  if (error || !data?.signedUrl) {
    return new NextResponse("Unavailable", { status: 502 });
  }

  return NextResponse.redirect(data.signedUrl);
}
