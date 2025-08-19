'use client'
import api from '@/lib/axios';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import 'ckeditor5/ckeditor5.css';
import './styles.css';
import { div } from 'framer-motion/client';
import Footer from '@/components/FooterComponent/Footer';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function PostDetail({ post: serverPost }: { post: Post }) {
  const params = useParams();
  const slug = params.postSlug as string;
  const [post, setPost] = useState<Post>(serverPost);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Extract headings from content after post is loaded
  useEffect(() => {
    if (post?.content && contentRef.current) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(post.content, 'text/html');
      const headingElements = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      
      const extractedHeadings = headingElements.map((heading) => {
        // Ensure each heading has an ID for anchor linking
        if (!heading.id) {
          heading.id = heading.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
        }
        
        return {
          id: heading.id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName.substring(1))
        };
      });
      
      setHeadings(extractedHeadings);
    }
  }, [post]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close the TOC after selection (optional)
      setTocOpen(false);
    }
  };

  if (!post) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
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

        {/* Beautiful Table of Contents under title */}
        {headings.length > 0 && (
          <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-300">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center transition-colors"
            >
              <span className="font-medium text-gray-800 dark:text-gray-200">
                <svg 
                  className="w-5 h-5 inline-block mr-2 text-blue-600 dark:text-blue-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Mục lục bài viết
              </span>
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${tocOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {tocOpen && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <ul className="space-y-2">
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <button
                        onClick={() => scrollToHeading(heading.id)}
                        className={`w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-start ${
                          heading.level === 1 ? 'font-medium pl-0' : 
                          heading.level === 2 ? 'pl-4' : 
                          'pl-8'
                        }`}
                      >
                        <span className="inline-block w-4 mr-2 text-blue-500 dark:text-blue-400">
                          {heading.level === 1 ? '•' : heading.level === 2 ? '◦' : '▪'}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                          {heading.text}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div 
          ref={contentRef}
          className="tinymce-content" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </article>
      
    </div>
    <footer className="w-full bg-[#d7d7d7ef] py-6 mt-auto h-[500px] flex justify-center">
          <Footer />
        </footer>
    </div>
  );
}