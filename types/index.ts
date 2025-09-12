export type UID = string;
export type ID = string;
export type TimestampMs = number;

export type UserProfile = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoURL?: string;
  email: string;
  createdAt: TimestampMs;
  updatedAt: TimestampMs;
};

export type Product = {
  id: ID;
  title: string;
  description?: string;
  gender: "men" | "women" | "unisex";
  category: "coat" | "trouser" | "waistcoat" | "suit" | "accessory" | "dress";
  sizes: string[]; // e.g. ["S","M","L","XL","32","34"]
  pricePerDay: number;
  images: string[];
  stock: number; // total units
  active: boolean;
  createdAt: TimestampMs;
  updatedAt: TimestampMs;
};

export type Card = {
  id?: ID;
  cardNumber: string;
  expiry: string;
  cvc: string;
  createdAt?: number;
};


export type CartItem = {
  id: ID;                // cart item id
  productId: ID;
  size?: string;
  qty: number;
  startDate: TimestampMs; // rental start
  endDate: TimestampMs;   // rental end
  addedAt: TimestampMs;
};

export type OrderItem = {
  productId: ID;
  title: string;
  image?: string;
  size?: string;
  qty: number;
  pricePerDay: number;
  startDate: TimestampMs;
  endDate: TimestampMs;
  days: number;
  lineTotal: number;
};

export type Order = {
  id: ID;
  userId: UID;
  items: OrderItem[];
  subtotal: number;
  deposit?: number;
  total: number;
  status: "pending" | "confirmed" | "picked_up" | "returned" | "cancelled";
  createdAt: TimestampMs;
  notes?: string;
};
