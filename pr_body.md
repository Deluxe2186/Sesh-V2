## Summary

This PR implements Supabase Auth in `src/lib/auth.ts`, replacing the localStorage-based auth while preserving all existing function signatures and the `SeshUser` shape. The `AuthProvider`, `/login`, `/signup`, `AppChrome`, and settings continue working without changes.

## Changes

### `src/lib/auth.ts` - Rewritten with Supabase Auth
- **Deleted**: Plaintext-password logic, `sesh-users` and `sesh-session` localStorage keys
- **Added**: Legacy key cleanup on first run (removes `sesh-users` and `sesh-session`)
- **`signUp(input)`**: Sends `name`, `handle`, `shareLocation` as user metadata; auto-signs-in after registration
- **`logIn(email, password)`**: Uses Supabase `signInWithPassword`
- **`logOut()`**: Calls Supabase `signOut`
- **`getUser()`**: Returns current user from Supabase session
- **Error messages** (matching requirements):
  - `"That username is already taken."` — handle uniqueness
  - `"An account with that email already exists."` — duplicate emails
  - `"Wrong email or password."` — invalid credentials
- **Singleton Supabase client** for client-side use

### `src/components/AuthProvider.tsx` - Simplified
- Now uses `signUp`, `logIn`, `logOut`, `getUser` from `@/lib/auth`
- Removed direct Supabase client usage and `onAuthStateChange` listener
- Initial user loaded via `getUser()` on mount

### Email Confirmation Callback Route
- **`src/app/(marketing)/auth/callback/page.tsx`** — Handles Supabase email confirmation
- Exchanges code for session, then redirects to `/explore` (or `next` param)

## Supabase Dashboard Settings Required

### Authentication → Email Templates
- **Confirm signup**: Ensure the redirect URL points to your callback route:
  - Local: `http://localhost:3000/auth/callback?next=/explore`
  - Production: `https://your-domain.com/auth/callback?next=/explore`

### Authentication → URL Configuration
- **Site URL**: `http://localhost:3000` (local) / `https://your-domain.com` (production)
- **Redirect URLs**: Add both callback URLs above

### Email Confirmation (choose one)
- **ON (recommended for production)**: Users must confirm email before accessing the app. The callback route handles the confirmation flow.
- **OFF (easier for local dev)**: Users can sign in immediately after signup. No email confirmation needed.

## Testing
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅

## Notes
- All existing function signatures, context APIs, and `SeshUser` type preserved
- Guests can still browse `/explore`, `/heatmap`, `/spot/[id]`
- Protected actions (start session, submit spot, profile, security reports) will need the auth gate dialog in follow-up work
- No service role key used; all access via publishable key + RLS

🤖 Generated with [Claude Code](https://claude.com/claude-code)