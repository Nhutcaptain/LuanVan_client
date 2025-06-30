'use client'
import { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { processImagesAndUpload } from '@/services/uploadAvatarService';

const RichTextEditor = dynamic(() => import('@/components/CKEditorComponent/CKEditor'), {
  ssr: false,
  loading: () => <p>Đang tải trình soạn thảo...</p>
});

export default function CreatePost() {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const processedContent = await processImagesAndUpload(content);
      const postData = {
        title,
        content: processedContent,
      };
      console.log(postData);
    } catch (error) {
      console.error('Lỗi khi lưu bài viết:', error);
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
             onChange={(event, editor) => {
              const data = editor.getData();     // lấy nội dung HTML
              setContent(data);                  // lưu vào state
            }}
          />
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