'use client'
import { useState, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import { processImagesAndUpload, uploadImageToCloudinary } from '@/services/uploadAvatarService';
import api from '@/lib/axios';

const RichTextEditor = dynamic(() => import('@/components/CKEditorComponent/CKEditor'), {
  ssr: false,
  loading: () => <p>Đang tải trình soạn thảo...</p>
});

export default function CreatePost() {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditorChange = (event: any, editor: any) => {
    const data = editor.getData();
    setContent(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setThumbnailUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!thumbnailUrl) {
    Swal.fire('Lỗi', 'Vui lòng chọn ảnh thumbnail!', 'error');
    return;
  }

  // Hiển thị thông báo "Đang xử lý" với nút không thể đóng
  Swal.fire({
    title: 'Đang đăng bài...',
    html: 'Vui lòng chờ trong giây lát',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    // Xử lý upload thumbnail nếu cần
    let finalThumbnailUrl = thumbnailUrl;
    if (thumbnailUrl.startsWith('data:image/') && fileInputRef.current?.files?.[0]) {
      const { url } = await uploadImageToCloudinary(fileInputRef.current.files[0]);
      finalThumbnailUrl = url;
    }

    const processedContent = await processImagesAndUpload(content);
    const postData = {
      title,
      content: processedContent,
      thumbnailUrl: finalThumbnailUrl,
      summary,
    };
    
    // Gọi API đăng bài
    const response = await api.post('/posts/post', postData);
    
    if (response.status === 201) {
      // Đóng thông báo "Đang xử lý" và hiển thị thành công
      Swal.fire({
        title: 'Thành công!',
        text: 'Bài viết đã được đăng thành công',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        // Reset form sau khi đăng thành công (tuỳ chọn)
        setTitle('');
        setContent('');
        setThumbnailUrl('');
        setSummary('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    } else {
      throw new Error('Lỗi từ phía server');
    }
  } catch (error) {
    console.error('Lỗi khi đăng bài:', error);
    
    // Đóng thông báo loading và hiển thị lỗi
    Swal.fire({
      title: 'Lỗi!',
      text: 'Đã có lỗi xảy ra khi đăng bài',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
};

  return (
    <>
      <Head>
        <title>Tạo bài viết mới</title>
      </Head>
      
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề bài viết"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        
        <div className="mb-4">
          <RichTextEditor 
            initialData={content}
            onChange={handleEditorChange}
          />
        </div>

        {/* Phần chọn thumbnail và summary - Đơn giản hóa */}
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <h3 className="font-bold mb-2">Thiết lập trước khi đăng</h3>
          
          <div className="mb-3">
            <label className="block mb-1">Ảnh thumbnail:</label>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              required
            />
            
            <button
              type="button"
              onClick={triggerFileInput}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mb-2"
            >
              Chọn ảnh từ máy tính
            </button>
            
            {thumbnailUrl && (
              <div className="mt-2">
                <img 
                  src={thumbnailUrl} 
                  className="w-40 h-40 object-cover border rounded"
                  alt="Thumbnail preview" 
                />
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="block mb-1">Tóm tắt bài viết:</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Nhập tóm tắt ngắn gọn..."
              className="w-full p-2 border rounded"
              rows={3}
              required
            />
          </div>
        </div>
        
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Đăng bài
        </button>
      </form>
    </>
  );
}

// Hàm upload ảnh (ví dụ)
