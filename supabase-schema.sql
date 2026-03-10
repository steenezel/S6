-- Supabase schema for Family Hub PWA
-- Run this in the Supabase SQL editor

-----------------------------
-- Boodschappenlijst tabel --
-----------------------------

create table if not exists public.shopping_list (
  id uuid primary key default gen_random_uuid(),
  household_id uuid default auth.uid(), -- optioneel: koppel aan gezin / user
  title text not null,
  category text not null check (category in ('supermarkt', 'apotheek', 'bureaugerei')),
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shopping_list
  enable row level security;

create policy "Users can read their shopping items"
  on public.shopping_list
  for select
  using (auth.uid() = household_id or household_id is null);

create policy "Users can insert their shopping items"
  on public.shopping_list
  for insert
  with check (auth.uid() = household_id or household_id is null);

create policy "Users can update their shopping items"
  on public.shopping_list
  for update
  using (auth.uid() = household_id or household_id is null);

create policy "Users can delete their shopping items"
  on public.shopping_list
  for delete
  using (auth.uid() = household_id or household_id is null);

create trigger set_timestamp_shopping_list
  before update on public.shopping_list
  for each row
  execute procedure moddatetime(updated_at);


-------------------
-- Polls tabellen --
-------------------

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  household_id uuid default auth.uid(),
  question text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.polls
  enable row level security;

create policy "Users can read polls"
  on public.polls
  for select
  using (auth.uid() = household_id or household_id is null);

create policy "Users can insert polls"
  on public.polls
  for insert
  with check (auth.uid() = household_id or household_id is null);


create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls (id) on delete cascade,
  label text not null,
  order_index int not null default 0
);

alter table public.poll_options
  enable row level security;

create policy "Users can read poll options"
  on public.poll_options
  for select
  using (
    exists (
      select 1
      from public.polls p
      where p.id = poll_id
        and (p.household_id = auth.uid() or p.household_id is null)
    )
  );

create policy "Users can insert poll options"
  on public.poll_options
  for insert
  with check (
    exists (
      select 1
      from public.polls p
      where p.id = poll_id
        and (p.household_id = auth.uid() or p.household_id is null)
    )
  );


create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls (id) on delete cascade,
  option_id uuid not null references public.poll_options (id) on delete cascade,
  voter_id uuid default auth.uid(),
  created_at timestamptz not null default now(),
  constraint unique_vote_per_user_per_poll unique (poll_id, voter_id)
);

alter table public.poll_votes
  enable row level security;

create policy "Users can read votes for their polls"
  on public.poll_votes
  for select
  using (
    exists (
      select 1
      from public.polls p
      where p.id = poll_id
        and (p.household_id = auth.uid() or p.household_id is null)
    )
  );

create policy "Users can vote once per poll"
  on public.poll_votes
  for insert
  with check (
    exists (
      select 1
      from public.polls p
      where p.id = poll_id
        and (p.household_id = auth.uid() or p.household_id is null)
    )
  );

