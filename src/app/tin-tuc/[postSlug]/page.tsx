
'use client'
import api from '@/lib/axios';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import './styles.css';
import { useParams, useRouter } from 'next/navigation';
import 'ckeditor5/ckeditor5.css';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function PostDetail({ post: serverPost }: { post: Post }) {
  const params = useParams();
  const slug = params.postSlug as string;
  const [post, setPost] = useState<Post>(serverPost);

  // Fetch data client-side if not using SSR
  useEffect(() => {
    if (!serverPost) {
      const fetchPost = async () => {
        try {
          const response = await api.get(`/posts/get/${slug}`);
          setPost(response.data);
        } catch (error) {
          console.error('Error fetching post:', error);
        }
      };
      fetchPost();
    }
  }, [slug]);

  if (!post) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Head>
        <title>{post.title} | My Blog</title>
        <meta name="description" content={`Bài viết: ${post.title}`} />
      </Head>

      <article className="prose lg:prose-xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <div className="text-gray-500">
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString('vi-VN')}
            </time>
          </div>
        </header>

        <div 
          className="ck-content" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </article>
    </div>
  );
}
