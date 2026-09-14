export type UserRole = "member" | "staff" | "admin";
export type MembershipTier = "free" | "standard" | "family";
export type ResourceType = "room" | "equipment";
export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  contact_info: string | null;
  role: UserRole;
  membership_tier: MembershipTier;
  joined_at: string;
  membership_expires_at: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number | null;
  description: string | null;
}

export interface Booking {
  id: string;
  resource_id: string;
  member_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  goal_amount: number;
  current_amount: number;
  active: boolean;
}

export interface Donation {
  id: string;
  donor_id: string | null;
  amount: number;
  campaign_id: string | null;
  is_recurring_pledge: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
}