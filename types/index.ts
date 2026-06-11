export type DeliveryStatus = 'pending' | 'active' | 'delivered' | 'cancelled'
export type PaymentType = 'cash' | 'transfer'
export type CreditTransactionStatus = 'pending' | 'completed' | 'failed'

export interface Vendor {
  id: string
  name: string
  business_name: string | null
  phone: string | null
  email: string
  created_at: string
  updated_at: string
}

export interface VendorWallet {
  id: string
  vendor_id: string
  credits: number
  total_purchased: number
  total_used: number
  created_at: string
  updated_at: string
}

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price_ngn: number
  is_active: boolean
  sort_order: number
}

export interface CreditTransaction {
  id: string
  vendor_id: string
  package_id: string | null
  credits: number
  amount_ngn: number
  paystack_reference: string | null
  status: CreditTransactionStatus
  created_at: string
}

export interface Delivery {
  id: string
  vendor_id: string
  customer_name: string
  customer_phone: string | null
  delivery_notes: string | null
  rider_token: string
  customer_token: string
  status: DeliveryStatus
  payment_type: PaymentType | null
  payment_amount: number | null
  payment_confirmed: boolean
  payment_confirmed_at: string | null
  started_at: string | null
  delivered_at: string | null
  credit_deducted: boolean
  created_at: string
  updated_at: string
}

export interface DeliveryLocation {
  id: number
  delivery_id: string
  lat: number
  lng: number
  accuracy: number | null
  speed: number | null
  heading: number | null
  recorded_at: string
}

export interface PaymentReceipt {
  id: string
  delivery_id: string
  file_url: string
  file_path: string
  uploaded_by: string
  created_at: string
}

export interface CreateDeliveryInput {
  customer_name: string
  customer_phone?: string
  delivery_notes?: string
  payment_type?: PaymentType
  payment_amount?: number
}

export interface LocationPing {
  lat: number
  lng: number
  accuracy?: number
  speed?: number
  heading?: number
  recorded_at?: string
}
