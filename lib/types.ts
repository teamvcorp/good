// ── Community Interest Categories ──────────────────────────────────────────
export type CommunityCategory = 'education' | 'health' | 'housing';

// ── Comment moderation ─────────────────────────────────────────────────────
export interface CommunityComment {
  id: string;               // crypto.randomUUID()
  kidId: string;            // the kid's unique public handle
  authorName: string;       // display name left by commenter
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;        // ISO datetime
  approvedAt?: string;
}

// ── Tip / donation ─────────────────────────────────────────────────────────
export interface Tip {
  id: string;                      // Stripe PaymentIntent ID
  kidId: string;
  category: CommunityCategory;
  amount: number;                  // cents
  message?: string;
  tipperName?: string;
  createdAt: string;
}

// ── Skill entry ────────────────────────────────────────────────────────────
export interface Skill {
  id: string;
  name: string;
  category: string;        // e.g. "Technology", "Leadership", "Arts"
  level: 'beginner' | 'intermediate' | 'advanced';
  earnedAt: string;
}

// ── Grade entry ────────────────────────────────────────────────────────────
export interface Grade {
  id: string;
  subject: string;
  grade: string;           // e.g. "A", "95", "Pass"
  period: string;          // e.g. "Fall 2025"
}

// ── Accomplishment ─────────────────────────────────────────────────────────
export interface Accomplishment {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

// ── Employment / Work History ────────────────────────────────────────────────
export interface EmploymentEntry {
  id: string;
  employer: string;
  title: string;
  startDate: string;       // "YYYY-MM" or plain year
  endDate?: string;        // blank = "Present"
  description?: string;
}

// ── Education History ──────────────────────────────────────────────────────
export interface EducationEntry {
  id: string;
  institution: string;
  degree?: string;         // e.g. "High School Diploma", "B.S. Computer Science"
  field?: string;          // e.g. "Computer Science"
  startDate: string;
  endDate?: string;        // blank = "In Progress"
  description?: string;
}

// ── Community Funds Totals (denormalized per-kid) ──────────────────────────
export interface CommunityFunds {
  education: number;   // cents raised via tips for this category
  health: number;
  housing: number;
}

// ── Kid / Student ──────────────────────────────────────────────────────────
export interface Kid {
  // identity
  kidId: string;              // short unique public ID, e.g. "GD-A3X9K2"
  name: string;
  age: number;
  rank: string;               // program rank / belt / level
  program?: string;

  // enrollment
  status: 'pending' | 'active' | 'inactive';
  expiresAt?: string;
  stripePaymentIntentId?: string;
  registrationPaid?: boolean;        // $5 registration fee
  businessCardsPaid?: boolean;       // $10 optional business card fee
  businessCardsOrdered?: boolean;
  avatarUrl?: string;

  // resume content
  bio?: string;
  skills: Skill[];
  grades: Grade[];
  accomplishments: Accomplishment[];
  employment?: EmploymentEntry[];     // work experience (optional, older kids)
  education?: EducationEntry[];       // school / college history (optional)

  // community fundraising
  communityFunds: CommunityFunds;
  selectedCategory: CommunityCategory;  // where tips default to

  // privacy
  hideContactInfo: boolean;

  // location (denormalized from parent; used for directory search/sort)
  city?: string;
  state?: string;
  zip?: string;

  // contact (may be hidden for minors)
  email?: string;
  phone?: string;
  socialLinks?: { label: string; url: string }[];
}

// ── Purchase (Pro Shop) ────────────────────────────────────────────────────
export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  category: string;
  size?: string;
  fulfillment: 'ship' | 'pickup';
  shippingAddress?: string;
  amount: number;
  purchasedAt: string;
}

// ── User / Parent ──────────────────────────────────────────────────────────
export interface User {
  id: string;                     // crypto.randomUUID()
  username: string;               // unique, lowercase
  passwordHash: string;
  parentName: string;
  parentAge: number;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  kids: Kid[];
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  purchases?: Purchase[];
  createdAt: string;
  updatedAt: string;
}

// ── Product (Pro Shop) ────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;          // cents
  stripePriceId?: string;
  stripeProductId?: string;
  imageUrl?: string;
  sizes?: string[];
  inStock: boolean;
  quantity?: number;
  createdAt: string;
  updatedAt: string;
}
