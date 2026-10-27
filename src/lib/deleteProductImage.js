import { supabase } from './supabase';

export async function deleteProductImage(imageUrl, storeId) {
  const marker = '/storage/v1/object/public/product-images/';
  const path = imageUrl.split(marker)[1]?.split('?')[0];

  if (!path) {
    throw new Error('URL foto produk tidak valid');
  }

  const decodedPath = decodeURIComponent(path);

  if (!decodedPath.startsWith(`${storeId}/`)) {
    throw new Error('Foto bukan milik toko ini');
  }

  const { data, error } = await supabase.storage.from('product-images').remove([decodedPath]);

  if (error) {
    throw error;
  }

  return data;
}
