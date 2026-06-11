import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Supabase SSR requires this route to exchange the auth code for a session.
// Without it, email confirmation links and magic links will silently fail.
// Supabase sends the user here after they click the confirmation link in their email.
// Add this to your Supabase Dashboard → Authentication → URL Configuration:
//   Site URL:           https://your-domain.com
//   Redirect URLs:      https://your-domain.com/auth/callback

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful auth — redirect to dashboard (or wherever next points)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Code missing or exchange failed — redirect to login with error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
