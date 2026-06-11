const R = 6371000 // earth radius in metres

/** Returns distance in metres between two GPS coordinates */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Normalises a Nigerian phone number to WhatsApp-compatible format (no +).
 * 08012345678  → 2348012345678
 * +2348012345678 → 2348012345678
 * 2348012345678  → 2348012345678
 */
export function cleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '234' + digits.slice(1)
  if (digits.startsWith('234')) return digits
  return '234' + digits
}

/** Builds a WhatsApp deep link that opens a pre-filled message */
export function buildWhatsAppLink(phone: string, message: string): string {
  const clean = cleanPhoneForWhatsApp(phone)
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}
