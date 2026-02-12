import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { event_id, name, email } = await request.json()
  const trimmedName = name?.trim()
  const trimmedEmail = email?.trim()
  const emailRegex = /^\S+@\S+\.\S+$/

  if (!event_id || !trimmedName || !trimmedEmail) {
    return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!emailRegex.test(trimmedEmail)) {
    return new NextResponse(JSON.stringify({ error: 'Invalid email address' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // RLS will enforce that the user owns the event.
  const { data, error, count } = await supabase
    .from('guests')
    .upsert(
      { event_id, name: trimmedName, email: trimmedEmail },
      {
        onConflict: 'event_id,email',
        ignoreDuplicates: true,
        count: 'exact',
      }
    )
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error inserting guest:', error)
    return new NextResponse(JSON.stringify({ error: 'Failed to add guest.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!count) {
    return new NextResponse(JSON.stringify({ error: 'Guest with this email already exists for this event.' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return NextResponse.json(data)
}
