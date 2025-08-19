// pages/posts/index.tsx
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import './styles.css';
import api from '@/lib/axios';

interface Post {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  summary: string;
  createdAt: string;
  slug: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
  });
  const router = useRouter();

  const fetchPosts = async (page: number = 1, query: string = '') => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/getPostList`, {
        params: {
          page,
          limit: 15,
          search: query,
        },
      });
      setPosts(response.data.posts);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalPosts: response.data.totalPosts,
      });
    } catch (err) {
      setError('Failed to fetch posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page, searchQuery);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="posts-container">
      <Head>
        <h1>Danh sách bài viết</h1>
        <meta name="description" content="Danh sách các bài viết" />
      </Head>

      <h1 className="page-title">Danh sách bài viết</h1>

      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Tìm kiếm
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : posts.length === 0 ? (
        <div className="no-posts">Không có bài viết nào được tìm thấy</div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map((post) => (
              <div
                key={post._id}
                className="post-card"
                onClick={() => router.push(`/posts/${post.slug}`)}
              >
                {post.thumbnailUrl && (
                  <div className="post-thumbnail">
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className="thumbnail-image"
                    />
                  </div>
                )}
                <div className="post-content">
                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-summary">{post.summary}</p>
                  <div className="post-meta">
                    <span className="post-date">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              {pagination.currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="pagination-button"
                >
                  Trước
                </button>
              )}

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-button ${
                      page === pagination.currentPage ? 'active' : ''
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {pagination.currentPage < pagination.totalPages && (
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="pagination-button"
                >
                  Sau
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostsPage;