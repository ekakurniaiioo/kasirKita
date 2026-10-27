import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';

export default function Kategori() {
  const { storeId } = useAuth();
  const [categoryName, setCategoryName] = useState('');
  const columns = [
    { key: 'name', label: 'Nama kategori' },
    {
      key: 'actions',
      label: '',
      render: (category) => (
        <div className="flex gap-2">
          <Button
            variant="textSuccess"
            disabled={saving || deleting}
            onClick={() => {
              setError('');
              setEditingCategory(category);
              setCategoryName(category.name);
            }}
          >
            Ubah
          </Button>
          <Button
            variant={
              usageLoadingError || usedCategoryIds.includes(category.id)
                ? 'textMuted'
                : 'textDanger'
            }
            disabled={
              loading ||
              saving ||
              deleting ||
              usageLoadingError ||
              usedCategoryIds.includes(category.id)
            }
            onClick={() => {
              setError('');
              setDeletingCategory(category);
            }}
          >
            {usageLoadingError
              ? 'Tidak tersedia'
              : usedCategoryIds.includes(category.id)
                ? 'Dipakai'
                : 'Hapus'}{' '}
          </Button>
        </div>
      ),
    },
  ];
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [usedCategoryIds, setUsedCategoryIds] = useState([]);
  const [usageLoadingError, setUsageLoadingError] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError('');
      setUsedCategoryIds([]);
      setUsageLoadingError(false);

      const { data: usedProducts, error: productsError } = await supabase
        .from('products')
        .select('category_id')
        .eq('store_id', storeId)
        .not('category_id', 'is', null);

      if (productsError) {
        setUsageLoadingError(true);
        setError(productsError.message);
      } else {
        setUsageLoadingError(false);

        const ids = [...new Set(usedProducts.map((product) => product.category_id))];
        setUsedCategoryIds(ids);
      }

      const { data, error } = await supabase.from('categories').select('*').eq('store_id', storeId);

      if (error) {
        setError(error.message);
      } else {
        setCategories(data ?? []);
      }

      setLoading(false);
    }

    if (!storeId) return;

    fetchCategories();
  }, [storeId]);

  async function handleAddCategory() {
    if (saving || deleting) return;

    const name = categoryName.trim();

    if (!name) return;

    if (!storeId) {
      setError('ID toko belum tersedia. Silahkan login ulang');
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        store_id: storeId,
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      if (error.code === '23505') {
        setError('Nama kategori sudah digunakan di toko ini.');
      } else {
        setError(error.message);
      }

      return;
    }

    setCategories((prev) => [...prev, data]);
    setCategoryName('');
    setError('');
  }

  async function handleUpdateCategory() {
    if (saving || deleting) return;

    const name = categoryName.trim();

    if (!name || !editingCategory || !storeId) return;

    setSaving(true);

    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', editingCategory.id)
      .eq('store_id', storeId);

    setSaving(false);

    if (error) {
      if (error.code === '23505') {
        setError('Nama kategori sudah digunakan di toko ini.');
      } else {
        setError(error.message);
      }

      return;
    }

    setCategories((prev) =>
      prev.map((category) =>
        category.id === editingCategory.id ? { ...category, name } : category,
      ),
    );

    setEditingCategory(null);
    setCategoryName('');
    setError('');
  }

  async function checkCategoryUsage(categoryId) {
    const { count, error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('store_id', storeId);

    if (error) {
      setError(error.message);
      return null;
    }

    return count;
  }

  async function handleDeleteCategory() {
    if (deleting || !deletingCategory || !storeId) return;

    setError('');
    setDeleting(true);

    const count = await checkCategoryUsage(deletingCategory.id);

    if (count === null) {
      setDeleting(false);
      return;
    }

    if (count > 0) {
      setDeleting(false);
      setError('Kategori tidak bisa dihapus karena masih digunakan produk.');
      setDeletingCategory(null);
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', deletingCategory.id)
      .eq('store_id', storeId);

    setDeleting(false);

    if (error) {
      setError(error.message);
      setDeletingCategory(null);
      return;
    }

    setCategories((prev) => prev.filter((category) => category.id !== deletingCategory.id));

    setUsedCategoryIds((prev) => prev.filter((id) => id !== deletingCategory.id));

    setDeletingCategory(null);
  }

  return (
    <main className="p-6">
      <header>
        <h1 className="text-2xl font-semibold text-[#1F2B24]">Kategori</h1>

        <p className="mt-2 text-sm text-[#66736B]">Kelola kategori produk toko.</p>
      </header>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="col-span-2">
          {error && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-[#66736B]">Memuat kategori...</p>
          ) : (
            <Table columns={columns} data={categories} />
          )}
        </div>
        <div className="max-w-full bg-white p-6 rounded-xl">
          <h2 className="mb-3 text-lg font-bold">
            {editingCategory ? 'Ubah Kategori' : 'Tambah Kategori'}
          </h2>
          <Input
            id="category-name"
            label="Nama Kategori"
            placeholder="Contoh: Paket Hemat"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value.slice(0, 30));
              setError('');
            }}
          />
          <p className="mt-2 mb-4 text-xs text-[#66736B]">Maksimal 30 karakter. Nama harus unik</p>
          <Button
            onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
            disabled={!categoryName.trim() || !storeId || saving || deleting}
          >
            {saving ? 'Menyimpan...' : editingCategory ? 'Simpan Perubahan' : 'Simpan Kategori'}
          </Button>
          {editingCategory && (
            <Button
              variant="secondary"
              disabled={saving || deleting}
              onClick={() => {
                setEditingCategory(null);
                setCategoryName('');
                setError('');
              }}
            >
              Batal
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!deletingCategory}
        onClose={() => {
          if (deleting) return;
          setDeletingCategory(null);
        }}
        title="Hapus Kategori"
      >
        <p>
          Yakin ingin menghapus kategori <strong>{deletingCategory?.name}</strong>?
        </p>

        <div className="mt-6 flex justify-end">
          <Button variant="danger" onClick={handleDeleteCategory} disabled={deleting}>
            {deleting ? 'Menghapus...' : 'Hapus Kategori'}
          </Button>
        </div>
      </Modal>
    </main>
  );
}
