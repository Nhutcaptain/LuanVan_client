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
  department?: {
    _id: string;
    name: string;
    contentId?: string;
  };
};

export default function PostEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const departmentId = searchParams.get("departmentId");
  const postId = searchParams.get("id");
  

  const [mode, setMode] = useState<"create" | "edit" | "department">("create");
  const [postData, setPostData] = useState<PostData>({
    title: "",
    content: "",
    thumbnailUrl: "",
    summary: "",
  });
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine mode and fetch data if needed
  useEffect(() => {
    if(!departmentId) return;
    const fetchData = async () => {
      try {
        if (departmentId) {
          setMode("department");
          // Fetch department info
          const res = await api.get(`/department/getById/${departmentId}`);
          const departmentData = res.data;
          
          // If department has contentId, fetch the associated post
          if (departmentData.contentId) {
            const postResponse = await api.get(`/posts/getById/${departmentData.contentId}`);
            setPostData({
              title: `${departmentData.name} - Giới thiệu`,
              content: postResponse.data.content,
              thumbnailUrl: postResponse.data.thumbnailUrl,
              summary: postResponse.data.summary,
              department: {
                _id: departmentData._id,
                name: departmentData.name,
                contentId: departmentData.contentId
              }
            });
            setCurrentImages(postResponse.data.contentImages || []);
            setUploadedImages(postResponse.data.contentImages || []);
          } else {
            setPostData({
              title: `${departmentData.name} - Giới thiệu`,
              content: "",
              department: {
                _id: departmentData._id,
                name: departmentData.name
              }
            });
          }
        } else if (postId) {
          setMode("edit");
          const response = await api.get(`/posts/getById/${postId}`);
          setPostData(response.data);
          setCurrentImages(response.data.contentImages || []);
          setUploadedImages(response.data.contentImages || []);
        } else {
          setMode("create");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Lỗi", "Không thể tải dữ liệu", "error");
        // router.back();
      }
    };

    fetchData();
  }, [departmentId, postId, router]);

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For regular posts, require thumbnail and summary
    if (mode !== "department" && !postData.thumbnailUrl) {
      Swal.fire("Lỗi", "Vui lòng chọn ảnh thumbnail!", "error");
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
      if (
        postData.thumbnailUrl?.startsWith("data:image/") &&
        fileInputRef.current?.files?.[0]
      ) {
        const { url } = await uploadImageToCloudinary(
          fileInputRef.current.files[0]
        );
        finalThumbnailUrl = url;
      }

      // Delete images that were removed from content
      const imagesToDelete = uploadedImages.filter(
        (publicId) => !currentImages.includes(publicId)
      );

      await Promise.all(
        imagesToDelete.map((publicId) => deleteImageFromCloudinary(publicId))
      );

      let response;
      let createdPostId;

      if (mode === "department") {
        // For department, first create/update the post
        const postPayload = {
          title: postData.title,
          content: postData.content,
          thumbnailUrl: finalThumbnailUrl,
          summary: postData.summary || `Giới thiệu về khoa ${postData.department?.name}`,
          contentImages: currentImages,
          isDepartmentContent: true
        };

        if (postData.department?.contentId) {
          // Update existing post
          response = await api.put(`/posts/update/${postData.department.contentId}`, postPayload);
          createdPostId = postData.department.contentId;
        } else {
          // Create new post
          response = await api.post("/posts/post", postPayload);
          createdPostId = response.data._id;
        }

        // Then update department with contentId
        await api.put(`/department/updateDepartment/${departmentId}`, {
          contentId: createdPostId
        });
      } else if (mode === "edit") {
        // Update existing post
        response = await api.put(`/posts/${postId}`, {
          ...postData,
          thumbnailUrl: finalThumbnailUrl,
          contentImages: currentImages,
        });
      } else {
        // Create new post
        response = await api.post("/posts", {
          ...postData,
          thumbnailUrl: finalThumbnailUrl,
          contentImages: currentImages,
        });
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          title: "Thành công!",
          text:
            mode === "department"
              ? "Thông tin khoa đã được cập nhật"
              : mode === "edit"
              ? "Bài viết đã được cập nhật"
              : "Bài viết đã được đăng thành công",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          if (mode === "department") {
            router.back();
          } else if (mode === "edit") {
            // router.push(`/posts/${postId}`);
          } else {
            // router.push("/posts");
          }
        });
      } else {
        throw new Error("Lỗi từ phía server");
      }
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Đã có lỗi xảy ra khi lưu dữ liệu",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      <Head>
        <title>
          {mode === "department"
            ? "Giới thiệu khoa"
            : mode === "edit"
            ? "Chỉnh sửa bài viết"
            : "Tạo bài viết mới"}
        </title>
      </Head>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">
          {mode === "department"
            ? `Giới thiệu khoa ${postData.department?.name || ""}`
            : mode === "edit"
            ? "Chỉnh sửa bài viết"
            : "Tạo bài viết mới"}
        </h1>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Tiêu đề:</label>
          <input
            type="text"
            value={postData.title}
            onChange={(e) =>
              setPostData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder={
              mode === "department" ? "Tiêu đề giới thiệu" : "Tiêu đề bài viết"
            }
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={mode === "department"}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Nội dung:</label>
          <TinyMCEEditor
            value={postData.content}
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

        {mode !== "department" && (
          <div className="mb-6 p-6 border rounded-lg bg-gray-50">
            <h3 className="font-bold mb-4 text-lg">Thiết lập bài viết</h3>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Ảnh thumbnail:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                required={mode === "create"}
              />

              <button
                type="button"
                onClick={triggerFileInput}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg mb-3 transition-colors"
              >
                {postData.thumbnailUrl ? "Thay đổi ảnh" : "Chọn ảnh từ máy tính"}
              </button>

              {postData.thumbnailUrl && (
                <div className="mt-3">
                  <img
                    src={postData.thumbnailUrl}
                    className="w-48 h-48 object-cover border rounded-lg shadow-sm"
                    alt="Thumbnail preview"
                  />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="block mb-2 font-medium">Tóm tắt bài viết:</label>
              <textarea
                value={postData.summary || ""}
                onChange={(e) =>
                  setPostData((prev) => ({ ...prev, summary: e.target.value }))
                }
                placeholder="Nhập tóm tắt ngắn gọn..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required={(mode as string) !== "department"}
              />
            </div>
          </div>
        )}

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
            {mode === "department"
              ? "Lưu thông tin"
              : mode === "edit"
              ? "Cập nhật bài viết"
              : "Đăng bài"}
          </button>
        </div>
      </form>
    </>
  );
}