import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Nama produk wajib diisi'),
  sku: z.string().trim(),
  category_id: z.string().min(1, 'Kategori wajib dipilih'),
  price: z
    .union([z.literal(''), z.coerce.number()])
    .refine((value) => value !== '', 'Harga jual wajib diisi')
    .refine((value) => value === '' || value >= 0, 'Harga jual tidak boleh negatif'),
  cost_price: z.union([z.literal(''), z.coerce.number().min(0, 'Harga modal tidak boleh negatif')]),
  stock: z
    .union([z.literal(''), z.coerce.number()])
    .refine((value) => value !== '', 'Stok awal wajib diisi')
    .refine((value) => value === '' || Number.isInteger(value), 'Stok harus berupa bilangan bulat')
    .refine((value) => value === '' || value >= 0, 'Stok tidak boleh negatif'),
  low_stock_threshold: z
    .union([z.literal(''), z.coerce.number()])
    .refine((value) => value !== '', 'Batas stok wajib diisi')
    .refine(
      (value) => value === '' || Number.isInteger(value),
      'Batas stok harus berupa bilangan bulat',
    )
    .refine((value) => value === '' || value >= 0, 'Batas stok tidak boleh negatif'),
  is_active: z.boolean(),
});
