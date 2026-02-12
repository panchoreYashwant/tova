import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const guestId = params.id
  const { checked_in } = await request.json()

  if (typeof checked_in !== 'boolean') {
    return new NextResponse(JSON.stringify({ error: 'Invalid "checked_in" value' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // RLS will enforce that the user can only update guests for their own events.
  const { data, error } = await supabase
    .from('guests')
    .update({ checked_in })
    .eq('id', guestId)
    .select()
    .single()

  if (error) {
    console.error('Error updating guest:', error)
    return new NextResponse(JSON.stringify({ error: 'Failed to update guest.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return NextResponse.json(data)
}
