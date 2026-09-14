create extension if not exists "uuid-ossp";
create extension if not exists btree_gist;

create type user_role as enum ('member', 'staff', 'admin');
create type membership_tier as enum ('free', 'standard', 'family');
create type resource_type as enum ('room', 'equipment');
create type booking_status as enum ('pending', 'approved', 'rejected', 'cancelled');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  contact_info text,
  role user_role not null default 'member',
  membership_tier membership_tier not null default 'free',
  joined_at timestamptz not null default now(),
  membership_expires_at timestamptz not null default (now() + interval '1 year')
);

create table resources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type resource_type not null,
  capacity integer,
  description text
);

create table bookings (
  id uuid primary key default uuid_generate_v4(),
  resource_id uuid not null references resources(id) on delete cascade,
  member_id uuid not null references profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint valid_range check (end_time > start_time),
  exclude using gist (
    resource_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status in ('pending', 'approved'))
);

create table campaigns (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  goal_amount numeric(12,2) not null,
  current_amount numeric(12,2) not null default 0,
  active boolean not null default true
);

create table donations (
  id uuid primary key default uuid_generate_v4(),
  donor_id uuid references profiles(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  campaign_id uuid references campaigns(id) on delete set null,
  is_recurring_pledge boolean not null default false,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Keep campaign totals in sync with donations
create or replace function update_campaign_total()
returns trigger as $$
begin
  if new.campaign_id is not null then
    update campaigns set current_amount = current_amount + new.amount where id = new.campaign_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_campaign_total
after insert on donations
for each row execute function update_campaign_total();

-- Notify a member when their booking status changes
create or replace function notify_booking_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    insert into notifications (user_id, message)
    values (new.member_id, 'Your booking request is now ' || new.status || '.');
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_booking_status
after update on bookings
for each row execute function notify_booking_status_change();

-- Create a profile row automatically when someone signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, membership_tier)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'member', 'free');
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();