"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addGuest(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to add a guest." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const eventId = formData.get("eventId") as string;
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim();
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!trimmedName || !trimmedEmail || !eventId) {
    return { error: "Name, email, and event ID are required." };
  }

  if (!emailRegex.test(trimmedEmail)) {
    return { error: "Please enter a valid email address." };
  }

  // First, verify the user owns the event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("created_by", user.id)
    .single();

  if (eventError || !event) {
    return { error: "Event not found or you do not have permission to add guests to it." };
  }

  const { data: newGuest, error: insertError, count } = await supabase
    .from("guests")
    .upsert(
      {
        name: trimmedName,
        email: trimmedEmail,
        event_id: eventId,
      },
      {
        onConflict: "event_id,email",
        ignoreDuplicates: true,
        count: "exact",
      },
    )
    .select()
    .maybeSingle();

  if (insertError) {
    console.error("Error adding guest:", insertError);
    return { error: "Failed to add guest. Please try again." };
  }

  if (!count) {
    return { duplicate: true };
  }

  revalidatePath(`/events/${eventId}`);
  return { newGuest };
}

export async function updateGuestCheckInStatus(guestId: number, eventId: string, newStatus: boolean) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to update a guest." };
  }

  // Verify the user owns the event linked to the guest
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("created_by", user.id)
    .single();

  if (eventError || !event) {
    return { error: "Event not found or you do not have permission to modify its guests." };
  }

  // Update the guest's check-in status
  const { data: updatedGuest, error: updateError } = await supabase
    .from("guests")
    .update({ checked_in: newStatus })
    .eq("id", guestId)
    .eq("event_id", eventId) // Ensure guest belongs to the correct event
    .select()
    .single();

  if (updateError) {
    console.error("Error updating guest status:", updateError);
    return { error: "An unexpected error occurred while updating the guest." };
  }

  revalidatePath(`/events/${eventId}`);
  return { updatedGuest };
}

export async function uploadGuestsCSV(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to upload guests." };
  }

  const csvFile = formData.get("csvFile") as File;
  const eventId = formData.get("eventId") as string;

  if (!csvFile || !eventId) {
    return { error: "CSV file and event ID are required." };
  }

  // Verify user owns the event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("created_by", user.id)
    .single();

  if (eventError || !event) {
    return { error: "Event not found or you do not have permission to add guests." };
  }

  const fileContent = (await csvFile.text()).replace(/^\uFEFF/, "");
  const lines = fileContent.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) {
    return { error: "CSV file is empty." };
  }

  const headerCells = lines[0].split(",").map((cell) => cell.trim().toLowerCase());
  const nameIndex = headerCells.findIndex((cell) => cell === "name");
  const emailIndex = headerCells.findIndex((cell) => cell === "email");
  if (nameIndex === -1 || emailIndex === -1) {
    return { error: "CSV must include Name and Email columns." };
  }
  const rows = lines.slice(1);

  const cleanCell = (value: string | undefined) =>
    (value || "").trim().replace(/^"|"$/g, "");

  let added = 0;
  let duplicates = 0;
  let invalid = 0;
  const errors: string[] = [];
  const guestsToInsert: { name: string; email: string; event_id: string }[] = [];

  for (const row of rows) {
    if (!row.trim()) continue;
    const cells = row.split(",").map((cell) => cell.trim());
    const rawName = nameIndex >= 0 ? cells[nameIndex] : cells[0];
    const rawEmail = emailIndex >= 0 ? cells[emailIndex] : cells[1];
    const name = cleanCell(rawName);
    const email = cleanCell(rawEmail);

    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      invalid++;
      errors.push(`Invalid row: ${row}`);
      continue;
    }

    guestsToInsert.push({ name, email, event_id: eventId });
  }

  if (guestsToInsert.length > 0) {
    const { error: insertError, count } = await supabase
      .from("guests")
      .upsert(guestsToInsert, {
        onConflict: "event_id,email",
        ignoreDuplicates: true,
        count: "exact",
      });

    if (insertError) {
      console.error("CSV Insert Error:", insertError);
      return { error: "An error occurred during the bulk insert." };
    }
    
    added = count || 0;
    duplicates = guestsToInsert.length - added;
  }

  revalidatePath(`/events/${eventId}`);
  return { result: { added, duplicates, invalid, errors } };
}
