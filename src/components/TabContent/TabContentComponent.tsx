import React from 'react'
import './styles.css'

interface TabContentProps {
  content?: string;
  loading: boolean;
}

const TabContent = ({ content, loading }: TabContentProps) => {
  if (loading) {
    return <div className="loading-spinner">Đang tải dữ liệu...</div>;
  }

  if (!content) {
    return <div className="no-content">Nội dung đang được cập nhật</div>;
  }

  return (
    <div 
      className="tinymce-content" 
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
};

export default TabContent