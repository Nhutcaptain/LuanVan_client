'use client';
import React, { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Table from '@editorjs/table';
import Paragraph from '@editorjs/paragraph';
import TextColorPlugin from 'editorjs-text-color-plugin';

interface EditorProps {
  onChange?: (data: OutputData) => void;
  data?: OutputData;
  editorRef?: React.RefObject<EditorJS | null>;
  onReady?: () => void;
}

const Editorjs = (props: EditorProps) => {
  const { onChange, data, editorRef, onReady } = props;
  const ref = useRef<HTMLDivElement>(null);
  const localEditorRef = useRef<EditorJS | null>(null);
  const hasInitialized = useRef(false);


  useEffect(() => {
    if (hasInitialized.current) return; // Chỉ khởi tạo một lần
    hasInitialized.current = true;
    if (!ref.current) return;

    // Destroy previous instance if exists
    if (localEditorRef.current && typeof localEditorRef.current.destroy === 'function') {
      localEditorRef.current.destroy();
      localEditorRef.current = null;
    }

    localEditorRef.current = new EditorJS({
      holder: ref.current,
      autofocus: true,
      ...(data && data.blocks && data.blocks.length > 0 ? { data } : {}),
      inlineToolbar: true,
      tools: {
        header: {
            class: Header as any,
            inlineToolbar: true,
            config: {
                placeholder: 'Enter a header',
                levels: [2, 3, 4],
                defaultLevel: 1,
            },
        },
        Marker: {
          class: TextColorPlugin,
          config: {
            type: 'marker', // or 'textColor'
            icon: '<svg>...</svg>', // optional custom icon
          },
        },
        list: List,
        table: {
            class: Table as any,
            inlineToolbar: true,
        },
        paragraph: {
          class: Paragraph as any,
          inlineToolbar: true,
          config: {
            placeholder: 'Nhập nội dung ở đây...',
          },
        },
        image: {
          class: ImageTool as any,
          config: {
            uploadByFile(file: File) {
            const tempUrl = URL.createObjectURL(file);
            return Promise.resolve({
              success: 1,
              file: {
                url: tempUrl, 
                name: file.name,
                _originalFile: file, 
              },
            });
          }
          },
        },
      },
     onChange: async (api) => {
        try {
          const content = await api.saver.save(); // Sử dụng api từ callback
          onChange?.(content);
        } catch (error) {
          console.error('Lỗi khi lưu:', error);
        }
      },
      onReady: () => {
        if (editorRef) editorRef.current = localEditorRef.current;

        onReady?.();
      },
    });

    if (editorRef) editorRef.current = localEditorRef.current;

    return () => {
      if (localEditorRef.current && typeof localEditorRef.current.destroy === 'function') {
        localEditorRef.current.destroy();
        localEditorRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={ref} className="border rounded p-4" />
  );
};

export default Editorjs;