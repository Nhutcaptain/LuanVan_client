// pages/posts/index.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./styles.css";
import api from "@/lib/axios";
import { title } from "process";
import Swal from "sweetalert2";

interface Post {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    _id: string;
    username: string;
  };
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
        search: searchTerm,
        date: dateFilter,
        sortField,
        sortOrder,
      }).toString();

      const response = await api.get(`/posts/getAllPosts?${queryParams}`);
      const data = await response.data;
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchTerm, dateFilter, sortField, sortOrder]);

  const handleDelete = async (postId: string) => {
    const result = Swal.fire({
      title: "Bạn có chắc chắn muốn xóa bài đăng này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });
    if((await result).isConfirmed) {
      try {
        const res = await api.delete(`/posts/delete/${postId}`);
        if(res.status === 200) {
          Swal.fire("Đã xóa!", "Bài đăng đã được xóa thành công.", "success");
          setPosts(posts.filter(post => post._id !== postId));
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        Swal.fire("Lỗi!", "Không thể xóa bài đăng. Vui lòng thử lại.", "error");
      }
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="post-management-container">
      <div className="log-header">
        <h1>Quản lý Bài đăng</h1>
        <Link href="/admin/dang-bai" className="create-button">
          Tạo bài đăng mới
        </Link>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm bài đăng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setSearchTerm("")}>Xóa</button>
        </div>

        <div className="date-filter">
          <label>Lọc theo ngày:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <button onClick={() => setDateFilter("")}>Xóa</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : posts.length === 0 ? (
        <div className="no-posts">Không có bài đăng nào</div>
      ) : (
        <>
          <table className="posts-table">
            <thead>
              <tr>
                <th>Ảnh đại diện</th>
                <th onClick={() => handleSort("title")}>
                  Tiêu đề {renderSortIcon("title")}
                </th>
                <th>Tóm tắt</th>
                <th onClick={() => handleSort("createdAt")}>
                  Ngày đăng {renderSortIcon("createdAt")}
                </th>
                <th>Tác giả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id}>
                  <td>
                    {post.thumbnailUrl ? (
                      <img
                        src={post.thumbnailUrl}
                        alt={`Thumbnail for ${post.title}`}
                        className="post-thumbnail"
                      />
                    ) : (
                      <div className="no-thumbnail">Không có ảnh</div>
                    )}
                  </td>
                  <td>
                    <Link href={`/tin-tuc/${post.slug}`} className="post-title">
                      {post.title}
                    </Link>
                  </td>
                  <td>{post.summary || "Không có tóm tắt"}</td>
                  <td>
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{post.author?.username || "Ẩn danh"}</td>
                  <td className="actions">
                    <Link
                      href={{
                        pathname: "/admin/dang-bai",
                        query: { id: post._id },
                      }}
                      className="edit-button"
                    >
                      Chỉnh sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="delete-button"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}
