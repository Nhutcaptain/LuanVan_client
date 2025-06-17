import { h2 } from 'framer-motion/client'
import React from 'react'

interface Props {
    title: string;
}

const TitleComponent = (props: Props) => {
    const { title } = props;
    const localStyle: React.CSSProperties = {
        color: '#3D90D7',
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    }
  return (
    <>
        <h2 style={{...localStyle}}>{title}</h2>
    </>
  )
}

export default TitleComponent