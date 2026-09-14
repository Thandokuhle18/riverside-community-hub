alter table profiles enable row level security;
alter table resources enable row level security;
alter table bookings enable row level security;
alter table donations enable row level security;
alter table campaigns enable row level security;
alter table notifications enable row level security;

create or replace function is_staff_or_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('staff', 'admin'));
$$ language sql security definer stable;

create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- profiles
create policy "profiles_select_own" on profiles for select using (id = auth.uid());
create policy "profiles_select_staff" on profiles for select using (is_staff_or_admin());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());
create policy "profiles_update_admin" on profiles for update using (is_admin());

-- resources (public catalogue, staff/admin manage)
create policy "resources_select_all" on resources for select using (true);
create policy "resources_insert_staff" on resources for insert with check (is_staff_or_admin());
create policy "resources_update_staff" on resources for update using (is_staff_or_admin());
create policy "resources_delete_staff" on resources for delete using (is_staff_or_admin());

-- bookings
create policy "bookings_select_own" on bookings for select using (member_id = auth.uid());
create policy "bookings_select_staff" on bookings for select using (is_staff_or_admin());
create policy "bookings_insert_own" on bookings for insert with check (member_id = auth.uid());
create policy "bookings_update_own" on bookings for update using (member_id = auth.uid());
create policy "bookings_update_staff" on bookings for update using (is_staff_or_admin());

-- campaigns (public read, admin write)
create policy "campaigns_select_all" on campaigns for select using (true);
create policy "campaigns_insert_admin" on campaigns for insert with check (is_admin());
create policy "campaigns_update_admin" on campaigns for update using (is_admin());

-- donations (open insert, restricted read/update)
create policy "donations_insert_open" on donations for insert with check (true);
create policy "donations_select_own" on donations for select using (donor_id = auth.uid());
create policy "donations_select_admin" on donations for select using (is_admin());
create policy "donations_update_admin" on donations for update using (is_admin());

-- notifications
create policy "notifications_select_own" on notifications for select using (user_id = auth.uid());
create policy "notifications_update_own" on notifications for update using (user_id = auth.uid());
