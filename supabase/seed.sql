insert into public.categories (
  store_id,
  name
)
select
  id,
  'Makanan'
from public.stores
where name = 'KasirKita Test Store';

insert into public.categories (
  store_id,
  name
)
select
  id,
  'Minuman'
from public.stores
where name = 'KasirKita Test Store';

insert into public.categories (
  store_id,
  name
)
select
  id,
  'Snack'
from public.stores
where name = 'KasirKita Test Store';

insert into public.products (
  store_id,
  category_id,
  name,
  price,
  cost_price,
  stock,
  low_stock_threshold,
  is_active
)
select
  s.id,
  c.id,
  p.name,
  p.price,
  p.cost_price,
  p.stock,
  5,
  true
from (
  values
    ('Makanan', 'Nasi Goreng', 18000, 12000, 30),
    ('Makanan', 'Mie Goreng', 15000, 10000, 25),
    ('Makanan', 'Roti Bakar', 12000, 7000, 20),
    ('Makanan', 'Sosis Bakar', 10000, 6000, 20),

    ('Minuman', 'Air Mineral', 5000, 3000, 50),
    ('Minuman', 'Es Teh Manis', 6000, 2500, 40),
    ('Minuman', 'Kopi Susu', 15000, 9000, 25),
    ('Minuman', 'Jus Jeruk', 12000, 7000, 20),

    ('Snack', 'Keripik Kentang', 10000, 6500, 30),
    ('Snack', 'Cokelat Batang', 8000, 5000, 35),
    ('Snack', 'Biskuit', 7000, 4500, 40),
    ('Snack', 'Permen', 2000, 1000, 60)
) as p(category_name, name, price, cost_price, stock)
join public.stores s
  on s.name = 'KasirKita Test Store'
join public.categories c
  on c.store_id = s.id
  and c.name = p.category_name;