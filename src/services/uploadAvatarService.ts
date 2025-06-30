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

export const processImagesAndUpload = async (content: string) => {
  const div = document.createElement('div');
  div.innerHTML = content;

  const images = div.querySelectorAll('img');

  for (const img of images) {
    const src = img.getAttribute('src');
    if (src && src.startsWith('data:image/')) {
      try {
        const file = dataURLtoFile(src, 'image.png');
        const { url, publicId } = await uploadImageToCloudinary(file);
        
        // Cập nhật ảnh với URL mới và thêm publicId để dùng sau
        img.setAttribute('src', url);
        img.setAttribute('data-public-id', publicId);
      } catch (error) {
        console.error('Upload ảnh thất bại:', error);
      }
    }
  }

  return div.innerHTML;
};

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}