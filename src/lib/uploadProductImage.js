import { supabase } from './supabase';

export async function uploadProductImage(file, storeId) {
  const extension = file.name.split('.').pop().toLowerCase();
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `${storeId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}