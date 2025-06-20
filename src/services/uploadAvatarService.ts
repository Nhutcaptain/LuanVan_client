import api from "@/lib/axios";

interface CloudinaryResult {
    publicId: string;
    url: string;
}

export const uploadImageToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'Upload Image');
  formData.append('cloud_name', 'dmdfi6nq7');

  const res = await fetch('https://api.cloudinary.com/v1_1/dmdfi6nq7/image/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
};

export const deleteImageFromCloudinary = async (publicId: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Chưa đăng nhập');

  const res = await api.delete('/images/delete', { data: {publicId} })

  return res.data;
};