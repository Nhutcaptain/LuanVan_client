"use client";
import { useState, useRef, useCallback } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/services/uploadAvatarService";
import api from "@/lib/axios";

const TinyMCEEditor = dynamic(
  () => import("@/components/TinyMCEComponent/TinyMCEComponent"),
  {
    ssr: false,
    loading: () => <p>Đang tải trình soạn thảo...</p>,
  }
);

export default function CreatePost() {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditorChange = useCallback((content: string) => {
    setContent(content);
  }, []);
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
      Swal.fire("Lỗi", "Vui lòng chọn ảnh thumbnail!", "error");
      return;
    }

    Swal.fire({
      title: "Đang đăng bài...",
      html: "Vui lòng chờ trong giây lát",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      let finalThumbnailUrl = thumbnailUrl;
      if (
        thumbnailUrl.startsWith("data:image/") &&
        fileInputRef.current?.files?.[0]
      ) {
        const { url } = await uploadImageToCloudinary(
          fileInputRef.current.files[0]
        );
        finalThumbnailUrl = url;
      }

      const imageToDelete = uploadedImages.filter(
        publicId => !currentImages.includes(publicId)
      );

      await Promise.all(
        imageToDelete.map(publicId => deleteImageFromCloudinary(publicId))
      )
      // const processedContent = await processImagesAndUpload(content);
      const postData = {
        title,
        content: content,
        thumbnailUrl: finalThumbnailUrl,
        summary,
      };

      const response = await api.post("/posts/post", postData);

      if (response.status === 201) {
        Swal.fire({
          title: "Thành công!",
          text: "Bài viết đã được đăng thành công",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          setTitle("");
          setContent("");
          setThumbnailUrl("");
          setSummary("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        });
      } else {
        throw new Error("Lỗi từ phía server");
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Đã có lỗi xảy ra khi đăng bài",
        icon: "error",
        confirmButtonText: "OK",
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
          className="w-full p-2 mb-4 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />

        <div className="mb-4">
          <TinyMCEEditor
            value={content}
            onChange={handleEditorChange}
            onImagesChange={(images) => {
              setCurrentImages(images);
              // Track all images that have ever been uploaded
              setUploadedImages((prev) => [
                ...prev,
                ...images.filter((img) => !prev.includes(img)),
              ]);
            }}
          />
        </div>

        <div className="mb-4 p-4 border rounded bg-gray-50">
          <h3 className="font-bold mb-2 text-lg">Thiết lập trước khi đăng</h3>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Ảnh thumbnail:</label>

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
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mb-2 transition-colors"
            >
              Chọn ảnh từ máy tính
            </button>

            {thumbnailUrl && (
              <div className="mt-2">
                <img
                  src={thumbnailUrl}
                  className="w-40 h-40 object-cover border rounded shadow-sm"
                  alt="Thumbnail preview"
                />
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Tóm tắt bài viết:</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Nhập tóm tắt ngắn gọn..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors font-medium"
        >
          Đăng bài
        </button>
      </form>
    </>
  );
}
