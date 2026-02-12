import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createServerSupabaseClient must only be used in Server Components.')
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value || null
        },
        set() {
          // No-op in Server Components.
        },
        remove() {
          // No-op in Server Components.
        },
      },
    }
  )
}

export async function createRouteHandlerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value || null
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: -1 })
        },
      },
    }
  )
}

export const createClient = createRouteHandlerSupabaseClient
