import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
}

export default function MessageItem({ role, content, isLoading }: Props) {
  if (role === 'user') {
    return (
      <div className="message-item user">
        <div className="message-bubble">{content}</div>
      </div>
    );
  }

  return (
    <div className="message-item ai">
      <div className="ai-response">
        {isLoading ? (
          <div className="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        ) : (
          <ReactMarkdown>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
