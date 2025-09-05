import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Loader2 } from 'lucide-react';
import './messageItem.css'

interface Props {
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
  avatar?: string;
  timestamp?: Date;
}

// Định nghĩa interface cho props của component code
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function MessageItem({ role, content, isLoading, avatar, timestamp }: Props) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (role === 'user') {
    return (
      <div className="message-item user-message">
        <div className="message-content">
          <div className="message-header">
            <span className="message-user-name">Bạn</span>
            {timestamp && <span className="message-time">{formatTime(timestamp)}</span>}
          </div>
          <div className="message-bubble user-bubble">
            <div className="message-text">{content}</div>
          </div>
        </div>
        {/* <div className="message-avatar">
          {avatar ? (
            <img src={avatar} alt="User avatar" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder user-avatar">
              <User size={16} />
            </div>
          )}
        </div> */}
      </div>
    );
  }

  return (
    <div className="message-item ai-message">
      <div className="message-avatar">
        <div className="avatar-placeholder ai-avatar">
          <Bot size={16} />
        </div>
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="ai-name">AI Y tế</span>
          {timestamp && <span className="message-time">{formatTime(timestamp)}</span>}
        </div>
        <div className="message-bubble ai-bubble">
          {isLoading ? (
            <div className="loading-indicator">
              <Loader2 className="spinner" size={18} />
              <span>Đang trả lời...</span>
            </div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="markdown-h1" {...props} />,
                  h2: ({node, ...props}) => <h2 className="markdown-h2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="markdown-h3" {...props} />,
                  p: ({node, ...props}) => <p className="markdown-p" {...props} />,
                  ul: ({node, ...props}) => <ul className="markdown-ul" {...props} />,
                  ol: ({node, ...props}) => <ol className="markdown-ol" {...props} />,
                  li: ({node, ...props}) => <li className="markdown-li" {...props} />,
                  a: ({node, ...props}) => <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props} />,
                  // Sửa lỗi TypeScript cho component code
                  code: ({className, children, ...props}: CodeProps) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && props.inline;
                    
                    return isInline ? (
                      <code className="markdown-inline-code" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="markdown-code-block">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  blockquote: ({node, ...props}) => <blockquote className="markdown-blockquote" {...props} />,
                  table: ({node, ...props}) => <div className="markdown-table-container"><table className="markdown-table" {...props} /></div>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}