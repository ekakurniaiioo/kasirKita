import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';

export default function Produk() {
  const { storeId } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showInactive, setShowInactive] = useState(false);
  const totalPages = Math.ceil(totalProducts / pageSize);
  const [productStats, setProductStats] = useState({
    active: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const columns = [
    {
      key: 'name',
      label: 'Produk',
      render: (product) => (
        <div>
          <p className="font-medium text-[#1F2B24]">{product.name}</p>
          <p className="text-xs text-[#66736B]">{product.sku || '-'}</p>
        </div>
      ),
    },
    {
      key: 'category_id',
      label: 'Kategori',
      render: (product) => (
        <span className="text-[#66736B]">{product.categories?.name || '-'}</span>
      ),
    },
    {
      key: 'price',
      label: 'Harga Jual',
      render: (product) =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(product.price),
    },
    {
      key: 'cost_price',
      label: 'Harga Modal',
      render: (product) =>
        product.cost_price != null
          ? new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0,
            }).format(product.cost_price)
          : '-',
    },
    {
      key: 'margin',
      label: 'Margin',
      render: (product) => {
        if (product.price == null || product.cost_price == null || product.price <= 0) {
          return '-';
        }

        const margin = ((product.price - product.cost_price) / product.price) * 100;

        return `${margin.toFixed(1)}%`;
      },
    },
    { key: 'stock', label: 'Stok' },
    {
      key: 'is_active',
      label: 'Status',
      render: (product) => (
        <Badge variant={product.is_active ? 'success' : 'neutral'}>
          {product.is_active ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (product) => (
        <Button variant="textSuccess" onClick={() => navigate(`/produk/${product.id}/edit`)}>
          Ubah
        </Button>
      ),
    },
  ];
  const categoryOptions = [
    { value: '', label: 'Semua Kategori' },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  useEffect(() => {
    if (!storeId) return;

    let ignore = false;

    async function loadProductStats() {
      const { data, error } = await supabase
        .from('products')
        .select('stock, low_stock_threshold, is_active')
        .eq('store_id', storeId);

      if (ignore) return;

      if (error) {
        console.error('Gagal mengambil statistik produk:', error.message);
        return;
      }

      const activeProducts = (data ?? []).filter((product) => product.is_active);

      setProductStats({
        active: activeProducts.length,
        lowStock: activeProducts.filter(
          (product) => product.stock > 0 && product.stock <= product.low_stock_threshold,
        ).length,
        outOfStock: activeProducts.filter((product) => product.stock === 0).length,
      });
    }

    loadProductStats();

    return () => {
      ignore = true;
    };
  }, [storeId]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('store_id', storeId)
        .order('name');

      if (categoryError) {
        setError(categoryError.message);
        return;
      }

      setCategories(data ?? []);
    }

    if (!storeId) return;

    fetchCategories();
  }, [storeId]);

  useEffect(() => {
    let ignore = false;

    async function fetchProduction() {
      setLoading(true);
      setError('');

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('products')
        .select('*, categories(name)', { count: 'exact' })
        .eq('store_id', storeId);

      if (!showInactive) {
        query = query.eq('is_active', true);
      }

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (submittedSearch) {
        query = query.or(`name.ilike.%${submittedSearch}%,sku.ilike.%${submittedSearch}%`);
      }

      const {
        data,
        count,
        error: fetchError,
      } = await query.order('name', { ascending: true }).range(from, to);

      if (ignore) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProducts(data ?? []);
        setTotalProducts(count ?? 0);
      }

      setLoading(false);
    }

    if (!storeId) return;

    fetchProduction();

    return () => {
      ignore = true;
    };
  }, [storeId, submittedSearch, selectedCategory, page, pageSize, showInactive]);

  return (
    <main className="p-6">
      <header className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2B24]">Produk</h1>
          <p className="mt-2 text-sm text-[#66736B]">
            {productStats.active} produk aktif · {productStats.lowStock} stok menipis ·{' '}
            {productStats.outOfStock} habis
          </p>{' '}
        </div>
        <Button variant="primary">+ Tambah Produk</Button>
      </header>

      {loading && <p className="mt-6 text-sm text-[#66736B]">Memuat produk...</p>}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
      {!loading && !error && (
        <div className="mt-6">
          <div className="mb-4 grid grid-cols-5 items-center gap-6">
            <div className="col-span-3">
              <Input
                id="search-product"
                label="Cari Produk"
                hideLabel
                placeholder="Cari nama atau SKU produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSubmittedSearch(search.trim());
                    setPage(1);
                  }
                }}
              />
            </div>

            <Select
              id="filter-category"
              label="Kategori"
              inlineLabel
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              options={categoryOptions}
            />

            <label className="flex items-center gap-2 whitespace-nowrap text-sm text-[#1F2B24]">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => {
                  setShowInactive(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 shrink-0 accent-[#166143]"
              />
              Tampilkan nonaktif
            </label>
          </div>
          {products.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#66736B]">
              Tidak ada produk yang ditemukan.
            </p>
          ) : (
            <Table columns={columns} data={products} />
          )}
          {totalProducts > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={totalProducts}
                pageSize={pageSize}
                itemLabel="produk"
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
