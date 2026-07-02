import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function callEdgeFunction<T = unknown>(
  name: string,
  body: FormData | Record<string, unknown>,
): Promise<T> {
  const url = `${supabaseUrl}/functions/v1/${name}`
  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  }

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body) as unknown as FormData
  }

  const res = await fetch(url, { method: 'POST', headers, body: body as BodyInit })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Edge function ${name} failed: ${res.status} ${text}`)
  }
  return res.json()
}
