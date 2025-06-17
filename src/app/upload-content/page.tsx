'use client';
import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { OutputData } from '@editorjs/editorjs';

// Dynamic import để tránh lỗi SSR
const Editorjs = dynamic(() => import('@/components/Editorjs'), {
  ssr: false,
  loading: () => <p>Đang tải trình soạn thảo...</p>
});

const extractUsedImagePublicIds = (data: OutputData): string[] => {
  const imageBlocks = data.blocks.filter(block => block.type === 'image');

  return imageBlocks
    .map(block => (block.data as any).file?.public_id)
    .filter(Boolean); // Bỏ null/undefined
};

const Page = () => {
    const [content, setContent] = useState<OutputData>();
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<any>(null);

  const handleSave = async () => {
    if (!editorRef.current) return;
    
    setIsSaving(true);
    try {
      const savedData = await editorRef.current.save();
      setContent(savedData);
      
      // Gửi dữ liệu lên API hoặc xử lý tại đây
      console.log('Dữ liệu đã lưu:', savedData);
      alert('Lưu thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
      alert('Lưu thất bại!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (editorRef.current?.clear) {
      editorRef.current.clear();
      setContent(undefined);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Trình soạn thảo nội dung</h1>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <Editorjs 
          editorRef={editorRef}
          onChange={setContent}
          {...(content && content.blocks && content.blocks.length > 0 ? { data: content } : {})}
        />
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md text-white ${isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu nội dung'}
        </button>
        
        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
        >
          Xóa hết
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Xem trước nội dung</h2>
          <div className="prose max-w-none">
            {content?.blocks?.length ? (
              content.blocks.map((block, index) => {
                switch (block.type) {
                  case 'header':
                    return <h2 key={index} className="text-xl font-bold">{block.data.text}</h2>;
                  case 'paragraph':
                    return <p key={index}>{block.data.text}</p>;
                  case 'list':
                    return block.data.style === 'unordered' ? (
                      <ul key={index} className="list-disc pl-5">
                        {block.data.items.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <ol key={index} className="list-decimal pl-5">
                        {block.data.items.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ol>
                    );
                  case 'image':
                    return (
                      <div key={index} className="my-3">
                        <img 
                          src={block.data.file.url} 
                          alt={block.data.caption || ''} 
                          className="max-w-full h-auto rounded"
                        />
                        {block.data.caption && (
                          <p className="text-sm text-gray-500 mt-1">{block.data.caption}</p>
                        )}
                      </div>
                    );
                  default:
                    return null;
                }
              })
            ) : (
              <p className="text-gray-500">Chưa có nội dung để hiển thị</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Dữ liệu JSON</h2>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-[400px]">
            {content ? JSON.stringify(content, null, 2) : '{}'}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Page;
