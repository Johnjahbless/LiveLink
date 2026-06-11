import { createHmac } from 'crypto'

/** Verifies Paystack webhook signature using HMAC-SHA512 */
export function verifyPaystackSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY!
  const expected = createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex')
  return expected === signature
}
