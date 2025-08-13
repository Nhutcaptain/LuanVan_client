"use client";

import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/services/uploadAvatarService";

interface TinyMCEEditorProps {
  value?: string;
  onChange: (content: string) => void;
  onImagesChange?: (images: string[]) => void;
}

export default function TinyMCEEditor({
  value = "",
  onChange,
  onImagesChange,
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);

  // Lấy danh sách publicId của các hình ảnh trong nội dung
  const getCurrentImagePublicIds = (content: string): string[] => {
    if (!content) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const images = Array.from(doc.querySelectorAll("img[data-public-id]"));
    return images
      .map((img) => img.getAttribute("data-public-id"))
      .filter((publicId): publicId is string => publicId !== null);
  };

  // Xử lý khi nội dung editor thay đổi
  const handleEditorChange = (content: string) => {
    onImagesChange?.(getCurrentImagePublicIds(content));
    onChange(content);
  };

  // Xử lý upload hình ảnh
  const imageUploadHandler = async (blobInfo: any): Promise<string> => {
    try {
      const file = new File([blobInfo.blob()], blobInfo.filename(), {
        type: blobInfo.blob().type,
      });
      const { url } = await uploadImageToCloudinary(file);
      return url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Template cho các khối hình ảnh + nội dung
  const contentTemplates = [
    {
      title: "Image with Text - Left",
      description: "Image on the left with text on the right",
      content: `
        <div class="content-block image-text-left">
          <div class="image-wrapper">
            <img src="https://via.placeholder.com/400x300" alt="Placeholder image" 
                 data-public-id="" class="block-image" width="100%">
          </div>
          <div class="text-wrapper">
            <h3>Title Here</h3>
            <p>Your content goes here. You can edit this text as needed.</p>
          </div>
        </div>
      `
    },
    {
      title: "Image with Text - Right",
      description: "Image on the right with text on the left",
      content: `
        <div class="content-block image-text-right">
          <div class="text-wrapper">
            <h3>Title Here</h3>
            <p>Your content goes here. You can edit this text as needed.</p>
          </div>
          <div class="image-wrapper">
            <img src="https://via.placeholder.com/400x300" alt="Placeholder image" 
                 data-public-id="" class="block-image" width="100%">
          </div>
        </div>
      `
    },
    {
      title: "Full Width Image with Caption",
      description: "Full width image with text below",
      content: `
        <div class="content-block full-width-image">
          <div class="image-wrapper">
            <img src="https://via.placeholder.com/1200x400" alt="Placeholder image" 
                 data-public-id="" class="block-image" width="100%">
          </div>
          <div class="caption-wrapper">
            <p class="image-caption">Caption text goes here</p>
          </div>
        </div>
      `
    }
  ];

  return (
    <div className="tinymce-editor">
      <Editor
        apiKey="isvt665eg9hgn0gxedtvkjxq5fnj8vc8emctk93e46hbgb7j"
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value}
        init={{
          height: 600,
          menubar: true,
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
            "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
            "insertdatetime", "media", "table", "help", "wordcount", "template"
          ],
          external_plugins: {
    'template': 'https://cdn.tiny.cloud/1/YOUR_API_KEY/tinymce/6/plugins/template/plugin.min.js'
  },
          toolbar: `
            undo redo | blocks fontselect fontsizeselect | 
            bold italic underline forecolor | alignleft aligncenter alignright alignjustify | 
            bullist numlist outdent indent | image link table template | 
            code fullscreen help
          `,
          content_style: `
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              font-size: 16px;
              line-height: 1.6;
              color: #333;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            
            /* Styling for content blocks */
            .content-block {
              margin: 30px 0;
              padding: 20px;
              border-radius: 8px;
              background-color: #f9f9f9;
              border: 1px solid #e1e1e1;
            }
            
            .content-block:hover {
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            /* Image with text layouts */
            .image-text-left, .image-text-right {
              display: flex;
              gap: 30px;
              align-items: flex-start;
            }
            
            .image-text-left .image-wrapper {
              flex: 0 0 40%;
            }
            
            .image-text-left .text-wrapper {
              flex: 1;
            }
            
            .image-text-right .image-wrapper {
              flex: 0 0 40%;
              order: 2;
            }
            
            .image-text-right .text-wrapper {
              flex: 1;
              order: 1;
            }
            
            /* Full width image */
            .full-width-image .image-wrapper {
              margin-bottom: 15px;
            }
            
            .full-width-image .image-caption {
              text-align: center;
              font-style: italic;
              color: #666;
              font-size: 14px;
              margin-top: 10px;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
              .image-text-left, .image-text-right {
                flex-direction: column;
              }
              
              .image-text-left .image-wrapper,
              .image-text-right .image-wrapper {
                flex: 1 1 100%;
                order: 1;
                margin-bottom: 20px;
              }
              
              .image-text-left .text-wrapper,
              .image-text-right .text-wrapper {
                flex: 1 1 100%;
                order: 2;
              }
            }
            
            /* Image styling */
            .block-image {
              border-radius: 4px;
              height: auto;
              display: block;
            }
            
            /* Regular content styling */
            p {
              margin-bottom: 1.5em;
              line-height: 1.6;
            }
            
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1.5em;
              margin-bottom: 0.8em;
              line-height: 1.3;
              color: #222;
            }
          `,
          fontsize_formats: "10pt 12pt 14pt 16pt 18pt 24pt 36pt",
          image_caption: true,
          image_dimensions: true,
          automatic_uploads: true,
          images_upload_url: "none",
          file_picker_types: "image",
          templates: contentTemplates,
          images_upload_handler: imageUploadHandler,
          file_picker_callback: (callback: any, value: any, meta: any) => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");

            input.onchange = async () => {
              if (input.files && input.files[0]) {
                const file = input.files[0];
                try {
                  const { url, publicId } = await uploadImageToCloudinary(file);
                  callback(url, {
                    title: file.name,
                    "data-public-id": publicId,
                    class: "block-image"
                  });
                } catch (error) {
                  console.error("Upload failed:", error);
                  callback("", { alt: "Upload failed" });
                }
              }
            };

            input.click();
          },
          setup: (editor: any) => {
            // Thêm nút tạo khối nhanh
            editor.ui.registry.addButton('quickImageBlock', {
              icon: 'image',
              tooltip: 'Insert image with text block',
              onAction: () => {
                editor.execCommand('mceInsertTemplate', false, `
                  <div class="content-block image-text-left">
                    <div class="image-wrapper">
                      <img src="https://via.placeholder.com/400x300" alt="" 
                           data-public-id="" class="block-image" width="100%">
                    </div>
                    <div class="text-wrapper">
                      <h3>Section Title</h3>
                      <p>Your content goes here...</p>
                    </div>
                  </div>
                `);
              }
            });
            
            // Thêm nút vào toolbar
            editor.ui.registry.addButton('divider', {
              icon: 'horizontal-rule',
              tooltip: 'Add divider',
              onAction: () => {
                editor.insertContent('<hr class="content-divider">');
              }
            });
          }
        }}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
}