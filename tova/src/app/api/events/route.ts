import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, date } = await request.json();

  if (!name || !date) {
    return NextResponse.json(
      { error: "Event name and date are required." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("events")
    .insert({ name, date, created_by: user.id })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id });
}
