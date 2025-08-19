"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

type PostData = {
  _id?: string;
  title: string;
  content: string;
  thumbnailUrl?: string;
  summary?: string;
};

type ThumbnailSource = 'file' | 'url';

export default function PostEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");

  const isEditMode = Boolean(postId);

  const [postData, setPostData] = useState<PostData>({
    title: "",
    content: "",
    thumbnailUrl: "",
    summary: "",
  });
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailSource, setThumbnailSource] = useState<ThumbnailSource>('file');
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');

  // Fetch post data if editing
  useEffect(() => {
    if (!isEditMode) return;

    const fetchPost = async () => {
      try {
        console.log("📌 postId:", postId);
        const response = await api.get(`/posts/getById/${postId}`);
        setPostData(response.data);
        setCurrentImages(response.data.contentImages || []);
        setUploadedImages(response.data.contentImages || []);
        // Nếu thumbnail là URL từ bên ngoài, chọn chế độ URL
        if (response.data.thumbnailUrl && !response.data.thumbnailUrl.startsWith('http')) {
          setThumbnailSource('url');
          setThumbnailUrlInput(response.data.thumbnailUrl);
        }
      } catch (error) {
        console.error("❌ Error fetching post:", error);
        Swal.fire("Lỗi", "Không thể tải dữ liệu bài viết", "error");
      }
    };

    fetchPost();
  }, [isEditMode, postId]);

  const handleEditorChange = useCallback((content: string) => {
    setPostData((prev) => ({ ...prev, content }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPostData((prev) => ({
            ...prev,
            thumbnailUrl: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setThumbnailUrlInput(url);
    // Chỉ cập nhật thumbnailUrl khi URL hợp lệ
    if (url && isValidUrl(url)) {
      setPostData((prev) => ({
        ...prev,
        thumbnailUrl: url,
      }));
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postData.thumbnailUrl) {
      Swal.fire("Lỗi", "Vui lòng chọn ảnh thumbnail!", "error");
      return;
    }

    // Nếu chọn URL nhưng URL không hợp lệ
    if (thumbnailSource === 'url' && !isValidUrl(thumbnailUrlInput)) {
      Swal.fire("Lỗi", "Vui lòng nhập URL hợp lệ cho ảnh thumbnail", "error");
      return;
    }

    Swal.fire({
      title: "Đang lưu dữ liệu...",
      html: "Vui lòng chờ trong giây lát",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      let finalThumbnailUrl = postData.thumbnailUrl;
      
      // Chỉ upload lên Cloudinary nếu là ảnh từ máy tính
      if (thumbnailSource === 'file' && 
          postData.thumbnailUrl?.startsWith("data:image/") && 
          fileInputRef.current?.files?.[0]) {
        const { url } = await uploadImageToCloudinary(
          fileInputRef.current.files[0]
        );
        finalThumbnailUrl = url;
      }

      // Delete removed images
      const imagesToDelete = uploadedImages.filter(
        (publicId) => !currentImages.includes(publicId)
      );
      await Promise.all(
        imagesToDelete.map((publicId) =>
          deleteImageFromCloudinary(publicId)
        )
      );

      const payload = {
        ...postData,
        thumbnailUrl: finalThumbnailUrl,
        contentImages: currentImages,
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/posts/${postId}`, payload);
      } else {
        response = await api.post("/posts/post", payload);
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          title: "Thành công!",
          text: isEditMode
            ? "Bài viết đã được cập nhật"
            : "Bài viết đã được đăng thành công",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          router.back();
        });
      } else {
        throw new Error("Lỗi từ phía server");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lưu dữ liệu:", error);
      Swal.fire("Lỗi!", "Đã có lỗi xảy ra khi lưu dữ liệu", "error");
    }
  };

  return (
    <>
      <Head>
        <title>
          {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
        </title>
      </Head>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
        </h1>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Tiêu đề:</label>
          <input
            type="text"
            value={postData.title}
            onChange={(e) =>
              setPostData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Tiêu đề bài viết"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Nội dung:</label>
          <TinyMCEEditor
            value={postData.content}
            onChange={handleEditorChange}
            onImagesChange={(images) => {
              setCurrentImages(images);
              setUploadedImages((prev) => [
                ...prev,
                ...images.filter((img) => !prev.includes(img)),
              ]);
            }}
          />
        </div>

        <div className="mb-6 p-6 border rounded-lg bg-gray-50">
          <h3 className="font-bold mb-4 text-lg">Thiết lập bài viết</h3>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Ảnh thumbnail:</label>
            
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="thumbnailSource"
                  value="file"
                  checked={thumbnailSource === 'file'}
                  onChange={() => setThumbnailSource('file')}
                  className="mr-2"
                />
                Tải lên từ máy tính
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="thumbnailSource"
                  value="url"
                  checked={thumbnailSource === 'url'}
                  onChange={() => setThumbnailSource('url')}
                  className="mr-2"
                />
                Nhập URL hình ảnh
              </label>
            </div>

            {thumbnailSource === 'file' ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                  required={!isEditMode && thumbnailSource === 'file'}
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg mb-3 transition-colors"
                >
                  {postData.thumbnailUrl ? "Thay đổi ảnh" : "Chọn ảnh từ máy tính"}
                </button>
              </>
            ) : (
              <div className="mb-3">
                <input
                  type="url"
                  value={thumbnailUrlInput}
                  onChange={handleUrlChange}
                  placeholder="Nhập URL hình ảnh"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!isEditMode && thumbnailSource === 'url'}
                />
                {thumbnailUrlInput && !isValidUrl(thumbnailUrlInput) && (
                  <p className="text-red-500 text-sm mt-1">URL không hợp lệ</p>
                )}
              </div>
            )}

            {postData.thumbnailUrl && (
              <div className="mt-3">
                <img
                  src={postData.thumbnailUrl}
                  className="w-48 h-48 object-cover border rounded-lg shadow-sm"
                  alt="Thumbnail preview"
                  onError={(e) => {
                    // Nếu hình ảnh không tải được, hiển thị placeholder
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium">Tóm tắt bài viết:</label>
            <textarea
              value={postData.summary || ""}
              onChange={(e) =>
                setPostData((prev) => ({ ...prev, summary: e.target.value }))
              }
              placeholder="Nhập tóm tắt ngắn gọn..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isEditMode ? "Cập nhật bài viết" : "Đăng bài"}
          </button>
        </div>
      </form>
    </>
  );
}