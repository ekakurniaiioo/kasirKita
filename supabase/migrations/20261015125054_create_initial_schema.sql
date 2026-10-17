create table
    public.stores (
        id uuid primary key default gen_random_uuid (),
        name text not null,
        address text,
        receipt_footer text default 'Terima kasih sudah berbelanja!',
        created_at timestamptz default now ()
    );

create type public.user_role as enum ('owner', 'cashier');

create table
    public.profiles (
        id uuid primary key references auth.users (id) on delete cascade,
        store_id uuid not null references public.stores (id),
        full_name text not null,
        role public.user_role not null default 'cashier',
        is_active boolean not null default true,
        unique (id, store_id)
    );

create table
    public.categories (
        id uuid primary key default gen_random_uuid (),
        store_id uuid not null references public.stores (id),
        name text not null,
        unique (store_id, name),
        unique (id, store_id)
    );

create table
    public.products (
        id uuid primary key default gen_random_uuid (),
        store_id uuid not null references public.stores (id),
        category_id uuid,
        sku text,
        name text not null,
        price bigint not null check (price >= 0),
        cost_price bigint check (cost_price >= 0),
        stock integer not null default 0 check (stock >= 0),
        low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
        image_url text,
        is_active boolean not null default true,
        created_at timestamptz default now (),
        updated_at timestamptz default now (),
        constraint products_category_same_store_fk foreign key (category_id, store_id) references public.categories (id, store_id) on delete restrict,
        unique (id, store_id)
    );

create type public.trx_status as enum ('completed', 'void');

create table
    public.transactions (
        id uuid primary key default gen_random_uuid (),
        store_id uuid not null references public.stores (id),
        invoice_no text not null unique,
        cashier_id uuid not null,
        subtotal bigint not null check (subtotal >= 0),
        discount bigint not null default 0 check (discount >= 0),
        total bigint not null check (total >= 0),
        paid bigint not null check (paid >= 0),
        change bigint not null check (change >= 0),
        payment_method text not null default 'cash',
        status public.trx_status not null default 'completed',
        void_reason text,
        voided_by uuid,
        created_at timestamptz default now (),
        constraint transactions_cashier_same_store_fk foreign key (cashier_id, store_id) references public.profiles (id, store_id),
        constraint transactions_voided_by_same_store_fk foreign key (voided_by, store_id) references public.profiles (id, store_id),
        constraint transactions_discount_valid check (discount <= subtotal),
        constraint transactions_total_valid check (total = subtotal - discount),
        constraint transactions_payment_valid check (paid >= total and change = paid - total),

        unique (id, store_id)
    );

create table
    public.transaction_items (
        id uuid primary key default gen_random_uuid (),
        store_id uuid not null,
        transaction_id uuid not null,
        product_id uuid not null,
        product_name text not null,
        price bigint not null check (price >= 0),
        cost_price bigint check (cost_price >= 0),
        qty integer not null check (qty > 0),
        line_total bigint not null check (line_total >= 0),
        constraint transaction_items_transaction_fk foreign key (transaction_id, store_id) references public.transactions (id, store_id) on delete cascade,
        constraint transactions_items_line_total_valid check (line_total = price * qty),
        constraint transaction_items_product_fk foreign key (product_id, store_id) references public.products (id, store_id)
    );

create table
    public.stock_movements (
        id uuid primary key default gen_random_uuid (),
        store_id uuid not null,
        product_id uuid not null,
        type text not null check (type in ('sale', 'void', 'adjust', 'restock')),
        qty_change integer not null,
        transaction_id uuid,
        note text,
        created_by uuid,
        created_at timestamptz default now (),
        constraint stock_movements_product_fk foreign key (product_id, store_id) references public.products (id, store_id),
        constraint stock_movements_transaction_fk foreign key (transaction_id, store_id) references public.transactions (id, store_id),
        constraint stock_movements_created_by_fk foreign key (created_by, store_id) references public.profiles (id, store_id)
    );

alter table public.stores enable row level security;

alter table public.profiles enable row level security;

alter table public.categories enable row level security;

alter table public.products enable row level security;

alter table public.transactions enable row level security;

alter table public.transaction_items enable row level security;

alter table public.stock_movements enable row level security;

create function public.my_store()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select store_id
  from public.profiles
  where id = (select auth.uid())
    and is_active = true
$$;

create function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'owner'
      and is_active = true
  )
$$;

create function public.get_product_cost_prices()
returns table (
  product_id uuid,
  cost_price bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select public.is_owner()) is not true then
    raise exception 'Only active owners can access cost prices';
  end if;

  return query
  select
    p.id,
    p.cost_price
  from public.products p
  where p.store_id = (select public.my_store());
end;
$$;

create function public.get_transaction_item_cost_prices()
returns table (
  transaction_item_id uuid,
  transaction_id uuid,
  cost_price bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select public.is_owner()) is not true then
    raise exception 'Only active owners can access transaction cost prices';
  end if;

  return query
  select
    ti.id,
    ti.transaction_id,
    ti.cost_price
  from public.transaction_items ti
  where ti.store_id = (select public.my_store());
end;
$$;

create policy "store_members_can_read"
on public.stores
for select
to authenticated
using (
  id = (select public.my_store())
);

create policy "owner_can_update_store"
on public.stores
for update
to authenticated
using (
  id = (select public.my_store())
  and (select public.is_owner())
)
with check (
  id = (select public.my_store())
  and (select public.is_owner())
);

create policy "users_can_read_own_profile"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  and is_active = true
);

create policy "owner_can_read_store_profiles"
on public.profiles
for select
to authenticated
using (
  store_id = (select public.my_store())
  and (select public.is_owner())
);

create policy "store_members_can_read_categories"
on public.categories
for select
to authenticated
using (
  store_id = (select public.my_store())
);

create policy "owner_can_insert_categories"
on public.categories
for insert
to authenticated
with check (
  store_id = (select public.my_store())
  and (select public.is_owner())
);

create policy "owner_can_update_categories"
on public.categories
for update
to authenticated
using (
  store_id = (select public.my_store())
  and (select public.is_owner())
)
with check (
  store_id = (select public.my_store())
  and (select public.is_owner())
);

create policy "store_members_can_read_products"
on public.products
for select
to authenticated
using (
  store_id = (select public.my_store())
  and (
    is_active = true
    or (select public.is_owner())
  )
);

create policy "owner_can_read_store_transactions"
on public.transactions
for select
to authenticated
using (
  store_id = (select public.my_store())
  and (select public.is_owner())
);

create policy "cashier_can_read_own_today_transactions"
on public.transactions
for select
to authenticated
using (
  store_id = (select public.my_store())
  and cashier_id = (select auth.uid())
  and created_at >= date_trunc(
    'day',
    now() at time zone 'Asia/Jakarta'
  ) at time zone 'Asia/Jakarta'
  and created_at < (
    date_trunc(
      'day',
      now() at time zone 'Asia/Jakarta'
    ) + interval '1 day'
  ) at time zone 'Asia/Jakarta'
);

create policy "owner_can_read_store_transaction_items"
on public.transaction_items
for select
to authenticated
using (
  store_id = (select public.my_store())
  and (select public.is_owner())
);

create policy "cashier_can_read_own_today_transaction_items"
on public.transaction_items
for select
to authenticated
using (
  store_id = (select public.my_store())
  and exists (
    select 1
    from public.transactions t
    where t.id = transaction_id
      and t.store_id = transaction_items.store_id
      and t.cashier_id = (select auth.uid())
      and t.created_at >= (
        date_trunc(
          'day',
          now() at time zone 'Asia/Jakarta'
        ) at time zone 'Asia/Jakarta'
      )
      and t.created_at < (
        (
          date_trunc(
            'day',
            now() at time zone 'Asia/Jakarta'
          ) + interval '1 day'
        ) at time zone 'Asia/Jakarta'
      )
  )
);

create policy "owner_can_read_stock_movements"
on public.stock_movements
for select
to authenticated
using (
  store_id = (select public.my_store())
  and (select public.is_owner())
);

revoke all on function public.my_store()
from public, anon, authenticated;

revoke all on function public.is_owner()
from public, anon, authenticated;

grant execute on function public.my_store()
to authenticated;

grant execute on function public.is_owner()
to authenticated;

revoke all on table public.products
from public, anon, authenticated;

revoke all on function public.get_product_cost_prices()
from public, anon, authenticated;

grant execute on function public.get_product_cost_prices()
to authenticated;

revoke all on function public.get_transaction_item_cost_prices()
from public, anon, authenticated;

grant execute on function public.get_transaction_item_cost_prices()
to authenticated;

grant select (
  id,
  store_id,
  category_id,
  sku,
  name,
  price,
  stock,
  low_stock_threshold,
  image_url,
  is_active,
  created_at,
  updated_at
)
on public.products
to authenticated;


grant insert (
  store_id,
  category_id,
  sku,
  name,
  price,
  cost_price,
  low_stock_threshold,
  image_url,
  is_active
)
on public.products
to authenticated;

grant update (
  category_id,
  sku,
  name,
  price,
  cost_price,
  low_stock_threshold,
  image_url,
  is_active
)
on public.products
to authenticated;

create policy "owner_can_insert_products"
on public.products
for insert
to authenticated
with check (
  store_id = (select public.my_store())
  and (select public.is_owner())
);

create policy "owner_can_update_products"
on public.products
for update
to authenticated
using (
  store_id = (select public.my_store())
  and (select public.is_owner())
)
with check (
  store_id = (select public.my_store())
  and (select public.is_owner())
);

revoke all on table
  public.stores,
  public.profiles,
  public.categories,
  public.transactions,
  public.transaction_items,
  public.stock_movements
from public, anon, authenticated;

grant select on table
  public.stores,
  public.profiles,
  public.categories,
  public.transactions,
  public.stock_movements
to authenticated;

grant select (
  id,
  store_id,
  transaction_id,
  product_id,
  product_name,
  price,
  qty,
  line_total
)
on public.transaction_items
to authenticated;

grant update (
  name,
  address,
  receipt_footer
)
on public.stores
to authenticated;

grant insert (
  store_id,
  name
)
on public.categories
to authenticated;

grant update (
  name
)
on public.categories
to authenticated;

grant usage on schema public
to authenticated;

revoke create on schema public
from public, anon, authenticated;