-- Multi-tenancy Support

-- 1. Create Organizations Table
create table "public"."organizations" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "slug" text not null unique,
    "owner_id" uuid not null references auth.users(id) on delete cascade
);

alter table "public"."organizations" enable row level security;

CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);
alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

-- 2. Create Organization Members Table
create table "public"."organization_members" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "organization_id" uuid not null references public.organizations(id) on delete cascade,
    "user_id" uuid not null references auth.users(id) on delete cascade,
    "role" text not null default 'member' check (role in ('owner', 'admin', 'member')),
    unique(organization_id, user_id)
);

alter table "public"."organization_members" enable row level security;

CREATE UNIQUE INDEX organization_members_pkey ON public.organization_members USING btree (id);
alter table "public"."organization_members" add constraint "organization_members_pkey" PRIMARY KEY using index "organization_members_pkey";

-- 3. Update todo_list to be Org-aware
alter table "public"."todo_list" add column "org_id" uuid references public.organizations(id) on delete cascade;

-- 4. RLS Policies for Organizations
create policy "Users can view organizations they belong to"
on "public"."organizations"
for select
to authenticated
using (
    exists (
        select 1 from public.organization_members
        where organization_id = organizations.id
        and user_id = auth.uid()
    )
);

create policy "Owners can update their organizations"
on "public"."organizations"
for update
to authenticated
using (owner_id = auth.uid());

-- Trigger to add owner as member
create or replace function public.handle_new_organization()
returns trigger as $$
begin
    insert into public.organization_members (organization_id, user_id, role)
    values (new.id, new.owner_id, 'owner');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_organization_created
    after insert on public.organizations
    for each row execute procedure public.handle_new_organization();

-- 5. RLS Policies for Organization Members
create policy "Members can view other members in their org"
on "public"."organization_members"
for select
to authenticated
using (
    exists (
        select 1 from public.organization_members my_membership
        where my_membership.organization_id = organization_members.organization_id
        and my_membership.user_id = auth.uid()
    )
);

-- 6. Update todo_list RLS to support Org-based access
drop policy "Owner can do everything" on "public"."todo_list";

create policy "Users can access todos in their organization"
on "public"."todo_list"
as permissive
for all
to authenticated
using (
    (authenticative.is_user_authenticated() AND (owner = auth.uid()))
    OR
    (authenticative.is_user_authenticated() AND exists (
        select 1 from public.organization_members
        where organization_id = todo_list.org_id
        and user_id = auth.uid()
    ))
);
