"use client";

import { useRef, useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/services/uploadAvatarService";

interface TinyMCEEditorProps {
  value?: string;
  onChange: (content: string) => void;
  onImagesChange: (images: string[]) => void; // Callback to update parent with current image publicIds
}

export default function TinyMCEEditor({
  value = "",
  onChange,
  onImagesChange,
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);

  // Extract current image publicIds from content
  const getCurrentImagePublicIds = (content: string): string[] => {
    if (!content) return [];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = Array.from(doc.querySelectorAll('img[data-public-id]'));
    
    return images
      .map(img => img.getAttribute('data-public-id'))
      .filter((publicId): publicId is string => publicId !== null);
  };

  const handleEditorChange = (content: string) => {
    const currentImagePublicIds = getCurrentImagePublicIds(content);
    onImagesChange(currentImagePublicIds); // Update parent with current images
    onChange(content);
  };

  const imageUploadHandler = async (blobInfo: any, progress: any): Promise<string> => {
    try {
      const file = new File([blobInfo.blob()], blobInfo.filename(), {
        type: blobInfo.blob().type,
      });

      const { url, publicId } = await uploadImageToCloudinary(file);
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return (
    <div className="tinymce-editor">
      <Editor
        apiKey='isvt665eg9hgn0gxedtvkjxq5fnj8vc8emctk93e46hbgb7j'
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks fontselect fontsizeselect | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "link image | alignleft aligncenter alignright | togglecaption | removeformat help",
          content_style: `
            body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
            figure.image { position: relative; border: 1px dashed #ccc; padding: 5px; }
            figcaption { 
              display: none; 
              padding: 8px; 
              background: #f5f5f5; 
              text-align: center; 
              font-style: italic;
            }
            figure.image.has-caption figcaption { display: block; }
          `,
          fontsize_formats: "8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt",
          image_caption: true,
          valid_elements: '*[*]',
          image_dimensions: true,
          images_upload_handler: imageUploadHandler,
          images_upload_url: 'none',
          automatic_uploads: true,
          file_picker_types: 'image',
          file_picker_callback: (callback: any, value: any, meta: any) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            
            input.onchange = async () => {
              if (input.files && input.files[0]) {
                const file = input.files[0];
                
                try {
                  const { url, publicId } = await uploadImageToCloudinary(file);
                  callback(url, { 
                    title: file.name,
                    'data-public-id': publicId
                  });
                } catch (error) {
                  console.error('Upload failed:', error);
                  callback('', { alt: 'Upload failed' });
                }
              }
            };
            
            input.click();
          },
        }}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
}