export interface Product {
  id?: string;
  name: string;
  description: string;
  priceToday: number;
  priceScheduled: number;
  priceOffer?: number;
  priceWholesale?: number;
  wholesaleMinQuantity?: number;
  stock: number;
  imageUrl?: string;
  images?: string[];
  category: "pizza" | "focaccia" | "empanada" | "bebida" | "postre" | "otro";
  isAvailable: boolean;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  address?: string;
  neighborhood?: string;
  apartment?: string;
  phone?: string;
  role: "admin" | "customer";
  isClubMember: boolean;
  clubPlanId?: string;
  points: number;
  referredBy?: string;
  referralCode?: string;
  coupons?: UserCoupon[];
  activePromoCoupons?: string[];
  lastDailyRewardClaim?: number;
  createdAt: number;
}

export interface PromoCoupon {
  id: string;
  code: string;
  description: string;
  type: "fixed" | "percentage" | "free_product";
  value: number; 
  maxDiscount?: number; 
  targetProducts?: string[]; 
  usageLimit: number; 
  usesCount: number;
  validDays: number[]; 
  isHidden: boolean; 
  active: boolean;
}

export interface CouponTemplate {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  isWelcomeCoupon: boolean;
  validDays: number[]; // 0=Sunday, 1=Monday, etc. Empty array means all days valid.
  rewardType: "discount_fixed" | "discount_percentage" | "free_item";
  rewardValue: string | number; // "1500" for discount, or "product_id" for free_item
  requiresSpecificCode: boolean;
  specificCode: string; // The code the user must type if requiresSpecificCode is true
  imageUrl?: string;
}

export interface UserCoupon {
  id: string;
  couponTemplateId: string;
  couponName: string;
  code: string; // the specific code or a randomly generated one
  isUsed: boolean;
  acquiredAt: number;
  usedAt?: number;
  // Snapshot of logic for checkout
  validDays: number[];
  rewardType: "discount_fixed" | "discount_percentage" | "free_item";
  rewardValue: string | number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  isForFutureDate: boolean;
  futureDate?: string;
}

export interface Order {
  id?: string;
  userId?: string; // Optional if guest checkout is allowed
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  deliveryDate?: string;
  deliveryTime?: string;
  status: "Pendiente" | "Visto" | "Listo" | "Entregado";
  createdAt: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
}

export interface DeliveryDay {
  dayOfWeek: number; // 0=Sun, 1=Mon, etc.
  active: boolean;
  timeSlots: { start: string; end: string }[]; // e.g. [{start: "10:00", end: "14:00"}]
}

export interface Settings {
  id?: string;
  totalEmpanadasSold: number;
  quantityDiscounts: { minQuantity: number; discountPercentage: number }[];
  earlyOrderDiscountPercentage: number;
  clubPlans: { id: string; name: string; price: number; empanadasPerMonth: number; description: string }[];
  
  // Checkout & Delivery Config
  paymentMethods?: PaymentMethod[];
  deliveryDays?: DeliveryDay[];
  
  // Marketing Configs
  marketing_welcomeModal?: boolean;
  marketing_loyaltyPointsValue?: number; // Equivalencia, ej: 1 punto = $1 peso
  marketing_loyaltyEarnRate?: number; // Tasa de ganancia, ej: Gana 1 punto cada $10 gastados
  marketing_allowCheckoutDiscount?: boolean; // Permite descontar plata directamente del total usando puntos
  marketing_allowCouponRedemption?: boolean; // Permite usar los puntos para canjear Cupones/Premios en la tienda
  
  marketing_dailyPrizeActive?: boolean;
  marketing_dailyPrizeMin?: number;
  marketing_dailyPrizeMax?: number;
  
  marketing_referralsActive?: boolean;
  marketing_referralReferrerReward?: number; // Puntos para quien invita
  marketing_referralReferredReward?: number; // Puntos para el invitado
}

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  createdAt: number;
  published: boolean;
}

export type UnitType = 'kg' | 'lt' | 'unid';

export interface CostIngredient {
  id: string;
  name: string;
  originalName?: string;
  unitType: UnitType;
  buyPrice: number; // Cost per kg, lt, or package
  packageSize: number; // For 'unid', units per package. For 'kg'/'lt', it's usually 1.
  quantityUsed: number; // Quantity used in the batch
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: CostIngredient[];
  yield: number; // Total empanadas produced
  createdAt: number;
}

export interface CostBreakdown {
  totalBatchCost: number;
  costPerEmpanada: number;
  ingredientBreakdown: {
    name: string;
    totalCost: number;
    unitCost: number;
    unitQuantity: number;
    unitMeasure: string;
  }[];
}

export interface BaseIngredient {
  id?: string;
  name: string;
  unitType: UnitType;
  buyPrice: number; 
  packageSize: number; 
  updatedAt: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantityUsed: number;
}

export interface EnhancedRecipe {
  id?: string;
  name: string;
  ingredients: RecipeIngredient[];
  yield: number;
  profitMargin: number;
  totalCost?: number;
  suggestedPrice?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface MenuItem {
  id?: string;
  recipeId?: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  category: "pizza" | "focaccia" | "empanada" | "bebida" | "postre" | "otro";
  isAvailable: boolean;
  createdAt: number;
}

export interface Collectible {
  id?: string;
  name: string;
  description: string;
  pointsCost: number;
  imageUrl?: string;
  stock: number;
  active: boolean;
  createdAt: number;
}

export interface Subscription {
  id?: string;
  name: string;
  description: string;
  pointsCost: number;
  durationDays: number;
  benefits: string[];
  active: boolean;
  createdAt: number;
}

export interface SecretCode {
  id?: string;
  code: string;
  rewardType: "points" | "discount_fixed" | "discount_percentage" | "free_item";
  rewardValue: number | string;
  maxUses: number;
  currentUses: number;
  active: boolean;
  createdAt: number;
}

