import React from 'react'
import './cardStyle.css';

interface Props {
    children?: React.ReactNode;
    propStyle?: React.CSSProperties;
}

const ButtonCardComponent = (props: Props) => {
    const { children, propStyle } = props;
  return (
    <div    
        className="button-card-component"
        style={{...propStyle }}>
            {children}
    </div>
  )
}

export default ButtonCardComponent  