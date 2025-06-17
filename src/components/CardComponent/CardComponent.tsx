import React from 'react'
import './card.css'
import { useInView } from 'react-intersection-observer';
import { MotionConfig, MotionConfigContext } from 'framer-motion';
import { motion } from 'framer-motion';

interface Props {
    imgUri: string;
    title?: string;
    description?: string;
    onClick?: () => void;
    index?: number;
}

const CardComponent = (props: Props) => {
    const { imgUri, title, description, onClick, index } = props;
    const { ref, inView } = useInView({
      threshold: 0.1, // hợp lệ ở đây
      triggerOnce: false,
    });
  return (
   
        <motion.div
          ref={ref}
          className='card-container'
          onClick={onClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.5, delay: index ? index * 0.15 : 0 }}
          >
            <div className="img-container">
                <img src={imgUri} alt="Card Image" className='card-image'/>
            </div>
            <div className="card-title-section">
                {title && <h3 className="card-title">{title}</h3>}
            </div>
            {description && <div className="card-description-section">
                {description && <p className="card-description">{description}</p>}
            </div>}
        </motion.div>
    
  )
}

export default CardComponent