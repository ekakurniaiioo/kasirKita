import { Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../schemas/productSchema';
import { generateSKU } from '../../utils/generateSKU';
import { uploadProductImage } from '../../lib/uploadProductImage';
import { deleteProductImage } from '../../lib/deleteProductImage';

export default function FormProduk() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const imageInputRef = useRef(null);
  const [oldImageUrl, setOldImageUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const { storeId } = useAuth();
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category_id: '',
      sku: '',
      price: '',
      cost_price: '',
      stock: '',
      low_stock_threshold: 5,
      is_active: true,
    },
  });
  const [watchedName, watchedPrice, watchedCostPrice, watchedStock] = useWatch({
    control,
    name: ['name', 'price', 'cost_price', 'stock'],
  });

  const profit = Number(watchedPrice) - Number(watchedCostPrice);
  const margin = Number(watchedPrice) > 0 ? (profit / Number(watchedPrice)) * 100 : 0;

  useEffect(() => {
    if (!storeId) return;

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('store_id', storeId)
        .order('name');

      if (error) {
        console.error('Gagal mengambil kategori:', error.message);
        return;
      }

      setCategories(data ?? []);
    }

    fetchCategories();
  }, [storeId]);

  function handleImageChange(file) {
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Foto harus berformat JPG atau PNG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5 MB');
      return;
    }

    setProductImage(file);

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
  }

  async function onSubmit(data) {
    setSubmitError('');
    setSuccessMessage('');

    if (!storeId) {
      console.error('Toko tidak ditemukan');
      return;
    }

    const productData = {
      ...data,
      store_id: storeId,
      sku: data.sku || (isEditMode ? null : generateSKU(data.name)),
      cost_price: data.cost_price === '' ? null : data.cost_price,
    };

    let query = supabase.from('products');

    if (isEditMode) {
      const updateData = Object.fromEntries(
        Object.entries(productData).filter(([key]) => !['stock', 'store_id'].includes(key)),
      );

      query = query.update(updateData).eq('id', id).eq('store_id', storeId);
    } else {
      query = query.insert(productData);
    }

    const { data: savedProduct, error } = await query.select('id').single();

    if (error) {
      if (error.code === '23505') {
        setSubmitError('SKU sudah digunakan. Silakan gunakan SKU lain.');
      } else {
        setSubmitError(error.message);
      }

      return;
    }

    if (productImage) {
      try {
        const imageUrl = await uploadProductImage(productImage, storeId);

        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('id', savedProduct.id)
          .eq('store_id', storeId);

        if (updateError) {
          throw updateError;
        }

        if (isEditMode && oldImageUrl && oldImageUrl !== imageUrl) {
          try {
            await deleteProductImage(oldImageUrl, storeId);
          } catch (deleteError) {
            console.warn('Gagal membersihkan foto lama:', deleteError.message);
          }
        }

        if (isEditMode) {
          setImagePreview(imageUrl);
          setOldImageUrl(imageUrl);
        }

        if (isEditMode) {
          setImagePreview(imageUrl);
        }
      } catch (error) {
        setSubmitError(`Produk berhasil dibuat, tetapi foto gagal disimpan: ${error.message}`);
        return;
      }
    }

    if (isEditMode) {
      setSuccessMessage('Produk berhasil diperbarui!');
    } else {
      setSuccessMessage('Produk berhasil ditambahkan!');
      reset();
      setImagePreview(null);
    }

    setProductImage(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }

  useEffect(() => {
    if (!imagePreview?.startsWith('blob:')) return;

    return () => {
      URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const { id } = useParams();
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (!isEditMode || !storeId) return;

    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('store_id', storeId)
        .single();

      if (error) {
        console.error('Gagal mengambil produk:', error.message);
        return;
      }

      reset({
        name: data.name ?? '',
        category_id: data.category_id ?? '',
        sku: data.sku ?? '',
        price: data.price ?? '',
        cost_price: data.cost_price ?? '',
        stock: data.stock ?? '',
        low_stock_threshold: data.low_stock_threshold ?? 5,
        is_active: data.is_active ?? true,
      });

      setImagePreview(data.image_url ?? null);
      setOldImageUrl(data.image_url ?? null);
    }

    fetchProduct();
  }, [id, isEditMode, storeId, reset]);

  return (
    <main>
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#1F2B24]">
          {isEditMode ? 'Ubah Produk' : 'Tambah Produk'}
        </h1>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/produk')}>
            Batal
          </Button>
          <Button variant="primary" type="submit" form="product-form" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
          </Button>
        </div>
      </header>

      {successMessage && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </p>
      )}

      {submitError && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Gagal menyimpan produk: {submitError}
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-6">
        <section className="col-span-2">
          <form id="product-form" onSubmit={(event) => handleSubmit(onSubmit)(event)}>
            <div className="rounded-xl border border-[#E5E3DD] bg-white p-6">
              <h2 className="text-base font-semibold text-[#1F2B24]">Informasi Produk</h2>

              <label
                htmlFor="product-image"
                className="mb-2 block text-sm font-medium text-[#1F2B24]"
              >
                Foto Produk (Opsional)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleImageChange(e.dataTransfer.files[0]);
                  setIsDragging(false);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onClick={() => imageInputRef.current?.click()}
                className={`flex cursor-pointer items-center gap-5 rounded-xl border-2 border-dashed p-6 transition-colors ${
                  isDragging
                    ? 'border-[#176344] bg-[#EAF4ED]'
                    : 'border-[#C8C7C0] bg-[#FAF9F6] hover:border-[#176344]'
                }`}
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#F0EFE9]">
                  <ImageIcon size={30} className="text-[#66665F]" />
                </div>

                <div>
                  <p className="text-base font-semibold text-[#1F2B24]">
                    Pilih atau seret foto ke sini
                  </p>

                  <p className="mt-1 text-sm text-[#66736B]">JPG atau PNG, maksimal 5 MB.</p>
                </div>

                <input
                  ref={imageInputRef}
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                  onClick={(e) => e.stopPropagation()}
                  className="sr-only"
                  tabIndex={-1}
                />
              </div>

              <div className="mt-6">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="product-name"
                      label="Nama Produk"
                      placeholder="Kopi Susu Gula Aren"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="product-category"
                        label="Kategori"
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: '', label: 'Pilih kategori' },
                          ...categories.map((category) => ({
                            value: category.id,
                            label: category.name,
                          })),
                        ]}
                      />
                    )}
                  />
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                  )}
                </div>
                <div>
                  <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="produt-sku"
                        label="SKU (Opsional)"
                        placeholder="KOPI-001"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#E5E3DD] bg-white p-6">
              <h2 className="text-base font-semibold text-[#1F2B24]">Harga</h2>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="product-price"
                        label="Harga Jual"
                        type="number"
                        placeholder="Contoh: 15000"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <Controller
                    name="cost_price"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="product-cost-price"
                        label="Harga Modal (Opsional)"
                        type="number"
                        placeholder="Contoh: 10000"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.cost_price && (
                    <p className="mt-1 text-sm text-red-600">{errors.cost_price.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#E5E3DD] bg-white p-6">
              <h2 className="text-base font-semibold text-[#1F2B24]">Stok</h2>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <Controller
                    name="stock"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="product-stock"
                        label={isEditMode ? 'Stok Saat Ini' : 'Stok Awal'}
                        type="number"
                        placeholder="Contoh: 20"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isEditMode}
                      />
                    )}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                  )}
                </div>
                <div>
                  <Controller
                    name="low_stock_threshold"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="product-low-stock"
                        label="Batas Stok Menipis"
                        type="number"
                        placeholder="Contoh: 5"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.low_stock_threshold && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.low_stock_threshold.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#E5E3DD] pt-5">
                <label htmlFor="product-active" className="text-sm font-medium text-[#1F2B24]">
                  Tampilkan di halaman Kasir
                </label>

                <label className="relative inline-flex cursor-pointer items-center">
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="product-active"
                        type="checkbox"
                        name={field.name}
                        ref={field.ref}
                        checked={field.checked}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        className="peer sr-only"
                      />
                    )}
                  />

                  <span className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-[#1F2B24]" />

                  <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>
          </form>
        </section>

        <aside className="col-span-1">
          <div className="rounded-xl border border-[#E5E3DD] bg-white p-6">
            <h2 className="mb-4 font-semibold text-[#1F2B24]">Preview Product</h2>

            <div className="rounded-xl border border-[#E5E3DD] p-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview produk"
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg bg-[#F0F2EE] text-sm text-gray-500">
                  Belum ada foto
                </div>
              )}
              <h3 className="mt-4 text-base font-semibold text-[#1F2B24]">
                {watchedName || 'Nama Produk'}
              </h3>
              <p className="mt-2 text-lg font-semibold text-[#176344]">
                Rp {Number(watchedPrice || 0).toLocaleString('id-ID')}
              </p>
              <p className="mt-2 text-sm text-[#66736B]">
                Stok tersedia: {watchedStock === '' ? '' : watchedStock}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E3DD] bg-white p-6 mt-6">
            <h2 className="mb-4 font-semibold text-[#1F2B24]">Perkiraan laba</h2>
            {watchedCostPrice !== '' && (
              <div>
                <p className="mt-4 text-sm text-[#176344]">
                  Perkiraan laba per item: Rp {profit.toLocaleString('id-ID')}
                </p>

                <p className="mt-1">
                  Margin keuntungan:{' '}
                  {margin.toLocaleString('id-ID', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                  %
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
