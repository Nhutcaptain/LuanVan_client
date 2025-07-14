import { Service } from '@/interface/ServiceInterface'
import { tr } from 'framer-motion/client';
import React from 'react'

interface Props {
    services: Service[];
}

const ServiceList = (props: Props) => {
    const {services} = props;
  return (
    <div className='service-list-container'>
        <table className="services-table">
            <thead>
                <tr>
                    <td>Tên dịch vụ</td>
                    <td className='thread-price'>Giá</td>
                </tr>
            </thead>
        </table>
        <div className="services-table-body">
            <table className="services-table">
                <tbody>
                    {services.map((s) => (
                        <tr key={s._id}>
                            <td>
                                <p className="service-name">{s.name}</p>
                                {s.notes.map((note, index) => (
                                    <p className="service-notes" key={index}>
                                        {note}
                                    </p>
                                ))}
                            </td>
                            <td>{new Intl.NumberFormat('vi-VN').format(s.price) + ' Đ'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default ServiceList