import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { parse } from 'papaparse'

// Basic email validation
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export async function POST(request: Request): Promise<Response> {
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

  const formData = await request.formData()
  const file = formData.get('file') as File
  const eventId = formData.get('eventId') as string

  if (!file || !eventId) {
    return new NextResponse(JSON.stringify({ error: 'Missing file or eventId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const fileContent = await file.text()

  return new Promise((resolve) => {
    parse<{ name?: string; Name?: string; email?: string; Email?: string }>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const fields = (results.meta.fields || []).map((field) => field.toLowerCase())
        if (!fields.includes('name') || !fields.includes('email')) {
          resolve(new NextResponse(JSON.stringify({ error: 'CSV must include Name and Email columns.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }))
          return
        }

        const guestsToInsert: { event_id: string; name: string; email: string }[] = []
        let invalidCount = 0
        const errors: string[] = []

        for (const row of results.data as any[]) {
          const name = row.name || row.Name
          const email = row.email || row.Email

          if (!name || !email) {
            invalidCount++
            errors.push(`Row skipped: Missing name or email. Data: ${JSON.stringify(row)}`)
            continue
          }

          if (!isValidEmail(email)) {
            invalidCount++
            errors.push(`Row skipped: Invalid email format. Email: ${email}`)
            continue
          }

          guestsToInsert.push({ event_id: eventId, name, email })
        }

        if (guestsToInsert.length === 0) {
          resolve(NextResponse.json({ added: 0, duplicates: 0, invalid: invalidCount, errors }))
          return
        }

        const { error, count } = await supabase
          .from('guests')
          .upsert(guestsToInsert, {
            onConflict: 'event_id,email',
            ignoreDuplicates: true,
            count: 'exact',
          })
          
        if (error) {
            console.error('Error during bulk insert:', error)
            // This is a simplified error handling. A real app might need more robust logic.
            resolve(new NextResponse(JSON.stringify({ error: 'A server error occurred during import.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }))
            return
        }

        const addedCount = count || 0
        const duplicatesCount = guestsToInsert.length - addedCount

        resolve(NextResponse.json({
          added: addedCount,
          duplicates: duplicatesCount,
          invalid: invalidCount,
          errors,
        }))
      },
      error: (error: Error) => {
        console.error('CSV parsing error:', error)
        resolve(new NextResponse(JSON.stringify({ error: 'Failed to parse CSV file.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }))
      },
    })
  })
}

