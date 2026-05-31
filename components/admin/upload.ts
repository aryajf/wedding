"use client";

import { createClient } from "@/lib/supabase/client";

// Must match the bucket created in supabase/schema.sql (and SUPABASE_BUCKET).
const MEDIA_BUCKET = "media";

/**
 * Upload a file to Supabase Storage and return its public URL.
 * RLS allows authenticated (admin) writes to the `media` bucket.
 */
export async function uploadToMedia(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `uploads/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
