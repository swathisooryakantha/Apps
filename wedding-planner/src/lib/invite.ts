// An invite link looks like https://app.example/?invite=<token>. The token is kept in
// localStorage while the person signs in (Google and email links return to the site root).

const INVITE_PARAM = 'invite'
const PENDING_INVITE_KEY = 'wedding-planner:pending-invite'

export function inviteUrl(token: string) {
  return `${window.location.origin}/?${INVITE_PARAM}=${token}`
}

/** Moves an invite token from the address bar into storage, so it survives the sign-in redirect. */
export function captureInviteFromUrl(): string | null {
  const url = new URL(window.location.href)
  const token = url.searchParams.get(INVITE_PARAM)
  if (token) {
    try {
      localStorage.setItem(PENDING_INVITE_KEY, token)
    } catch {
      // Without storage the token still rides along in the sign-in redirect URL.
    }
    url.searchParams.delete(INVITE_PARAM)
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  }
  return token ?? readPendingInvite()
}

export function readPendingInvite(): string | null {
  try {
    return localStorage.getItem(PENDING_INVITE_KEY)
  } catch {
    return null
  }
}

export function clearPendingInvite() {
  try {
    localStorage.removeItem(PENDING_INVITE_KEY)
  } catch {
    // Nothing stored.
  }
}

/** Where sign-in should return to; carries a pending invite so it works even if storage is cleared. */
export function signInRedirectUrl(pendingInvite: string | null) {
  return pendingInvite ? inviteUrl(pendingInvite) : window.location.origin
}
