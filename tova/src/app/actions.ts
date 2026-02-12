"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserEvents() {
  const supabase = await createServerSupabaseClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, name, date");

  if (error) {
    console.error("Error fetching events:", error);
  }

  return events || [];
}

export async function getEventDetail(eventId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, date")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    console.error("Error fetching event:", eventError);
    return null;
  }

  const { data: guests, error: guestsError } = await supabase
    .from("guests")
    .select("id, name, email, checked_in")
    .eq("event_id", eventId);

  if (guestsError) {
    console.error("Error fetching guests:", guestsError);
  }

  return { event, guests: guests || [] };
}
