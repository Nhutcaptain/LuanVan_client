import React from 'react'
import './newsCardStyle.css'
import { NewsData } from '@/data/news_data';
import {motion} from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Props{
    isMainNews?: boolean;
    isOtherNews?: boolean;
    articles?: NewsData;
    onClick?: () => void;
    index?: number;
}

const NewsCardComponent = (props: Props) => {
    const {isMainNews, isOtherNews, articles, onClick, index} = props;
    const { ref, inView } = useInView({
      threshold: 0.1, // hợp lệ ở đây
      triggerOnce: false,
    });
    const localStyle : React.CSSProperties = {

    }
  return (
    
        <div className={`new-card-container ${isMainNews ? 'main-news' : ''} ${isOtherNews ? 'other-news' : ''}`}>
        <div className={`article-image-container ${isMainNews ? 'main-image' : ''} ${isOtherNews ? 'other-image' : ''}`}>
            <img src={articles?.imageUri} alt="news" className='article-image' style={localStyle}/>
        </div>
       <div className="text">
            <div className="article-title-container">
                <h2 className='article-title'>{articles?.title}</h2>
            </div>
            <div className="article-content-container">
                <p className='article-content'>{articles?.content}</p>
            </div>
       </div>
    </div>
  )
}

export default NewsCardComponent