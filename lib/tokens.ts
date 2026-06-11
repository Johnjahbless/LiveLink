import { randomBytes } from 'crypto'

/** Generates a cryptographically secure token (32 hex chars) */
export function generateToken(bytes = 16): string {
  return randomBytes(bytes).toString('hex')
}

export function buildRiderLink(baseUrl: string, riderToken: string): string {
  return `${baseUrl}/track/r/${riderToken}`
}

export function buildCustomerLink(baseUrl: string, customerToken: string): string {
  return `${baseUrl}/track/c/${customerToken}`
}
