import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useForm, useWatch } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SettingsPage() {
  const { storeId } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      receipt_footer: '',
    },
  });
  const storePreview = useWatch({ control });

  useEffect(() => {
    if (!storeId) return;

    let ignore = false;

    async function fetchStore() {
      const { data, error } = await supabase
        .from('stores')
        .select('name, address, receipt_footer')
        .eq('id', storeId)
        .single();

      if (ignore) return;

      if (error) {
        setError(error.message);
      } else {
        reset({
          name: data.name ?? '',
          address: data.address ?? '',
          receipt_footer: data.receipt_footer ?? '',
        });
      }
    }

    fetchStore();

    return () => {
      ignore = true;
    };
  }, [storeId, reset]);

  async function onSubmit(values) {
    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('stores')
      .update({
        name: values.name.trim(),
        address: values.address.trim() || null,
        receipt_footer: values.receipt_footer.trim() || null,
      })
      .eq('id', storeId);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess('Pengaturan toko berhasil disimpan!');
  }

  return (
    <main className="p-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#176344]">
            Pengaturan / Toko
          </p>

          <h1 className="text-2xl font-semibold text-[#1F2B24]">Pengaturan Toko</h1>

          <p className="mt-2 text-sm text-[#66736B]">
            Kelola informasi toko dan pengaturan struk transaksi.
          </p>
        </div>

        <Button type="submit" form="settings-form" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </header>

      {success && (
        <p role="status" className="mb-4 text-sm text-[#176344]">
          {success}
        </p>
      )}

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-6">
        <section className="col-span-2">
          <div className="rounded-xl border border-[#E5E3DD] bg-white p-6">
            <h2 className="text-base font-semibold text-[#1F2B24]">Informasi Toko</h2>

            <p className="mt-1 text-sm text-[#66736B]">
              Informasi yang digunakan untuk identitas toko.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              <form id="settings-form" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <Input
                    id="store-name"
                    label="Nama Toko"
                    placeholder="Contoh: Kopi Senja"
                    {...register('name', {
                      required: 'Nama toko wajib diisi',
                    })}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="mt-3">
                  <Input
                    id="store-address"
                    label="Alamat Toko"
                    placeholder="Contoh: Jl. Melati No. 10, Bandung"
                    {...register('address')}
                  />
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="receipt-footer" className="text-sm font-medium text-[#1F2B24]">
                    Catatan Kaki Struk
                  </label>

                  <textarea
                    id="receipt-footer"
                    rows={3}
                    placeholder="Terima kasih sudah berbelanja!"
                    {...register('receipt_footer')}
                    className="w-full resize-y rounded-lg border border-[#E5E3DD] bg-white px-4 py-3 text-sm text-[#1F2B24] outline-none focus:border-[#176344]"
                  />

                  <p className="text-xs text-[#66736B]">
                    Pesan ini akan ditampilkan di bagian bawah struk transaksi.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>

        <aside className="col-span-1">
          <div className="rounded-xl border border-[#E5E3DD] bg-white p-6">
            <h2 className="text-base font-semibold text-[#1F2B24]">Preview Struk</h2>

            <p className="mt-1 text-sm text-[#66736B]">
              Pratinjau informasi yang akan muncul pada struk transaksi.
            </p>

            <div className="mx-auto mt-6 max-w-sm rounded-lg border border-[#E5E3DD] bg-[#FAF9F6] p-6 font-mono text-sm text-[#1F2B24]">
              <div className="text-center">
                <h3 className="font-semibold uppercase">{storePreview.name || 'Nama Toko'}</h3>

                <p className="mt-2 whitespace-pre-line text-xs">
                  {storePreview.address || '[Alamat toko]'}
                </p>
              </div>

              <div className="my-5 border-t border-dashed border-[#B8B8B0]" />

              <div className="space-y-1">
                <div className="flex justify-between gap-2">
                  <span>No</span>
                  <span>INV-20261012-00018</span>
                </div>

                <div className="flex justify-between gap-2">
                  <span>Tanggal</span>
                  <span>12/10/2026 14.05</span>
                </div>

                <div className="flex justify-between gap-2">
                  <span>Kasir</span>
                  <span>Yuha</span>
                </div>
              </div>

              <div className="my-5 border-t border-dashed border-[#B8B8B0]" />

              <div className="space-y-4">
                <div>
                  <p>Kopi Susu Gula Aren</p>
                  <div className="mt-1 flex justify-between text-[#66736B]">
                    <span>2 x 18.000</span>
                    <span>36.000</span>
                  </div>
                </div>

                <div>
                  <p>Pisang Goreng</p>
                  <div className="mt-1 flex justify-between text-[#66736B]">
                    <span>1 x 10.000</span>
                    <span>10.000</span>
                  </div>
                </div>
              </div>

              <div className="my-5 border-t border-dashed border-[#B8B8B0]" />

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>TOTAL</span>
                  <span>Rp46.000</span>
                </div>

                <div className="flex justify-between">
                  <span>Tunai</span>
                  <span>50.000</span>
                </div>

                <div className="flex justify-between">
                  <span>Kembali</span>
                  <span>4.000</span>
                </div>
              </div>

              <div className="my-5 border-t border-dashed border-[#B8B8B0]" />

              <p className="whitespace-pre-line text-center text-xs">
                {storePreview.receipt_footer || 'Terima kasih sudah berbelanja!'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
