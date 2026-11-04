export interface CartItem {
  id: string; // Composite ID: `${productId}-${packagingSize}`
  productId: string;
  productSlug: string;
  name: string;
  variety: string;
  image: string;
  packagingSize: string;
  weightKg: number;
  unitPrice: number;
  quantity: number;
  supplierName: string;
  isWholesale?: boolean;
}

export interface CheckoutCustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: "cod" | "card" | "bank_transfer" | "invoice";
  notes?: string;
}

export interface PlacedOrder {
  orderId: string;
  placedAt: string;
  customer: CheckoutCustomerInfo;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  status: "confirmed" | "processing";
}

export interface B2BQuoteRequest {
  id?: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  riceVariety: string;
  quantityKg: number;
  targetPricePerKg?: number;
  deliveryDestination: string;
  deliveryTimeframe: string;
  packagingRequirement: "50kg Sacks" | "25kg Sacks" | "1 Ton Bulk Bags" | "Custom";
  notes?: string;
}

