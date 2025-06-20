'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import './styles.css';
import ExaminationForm from '@/components/ExaminationForm/ExaminationFormComponent';
import api from '@/lib/axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


const ExaminationPage = () => {
  const router = useRouter();
  const MySwal = withReactContent(Swal)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
     
      const response = await api.post('/patient/postExamination',data)
      if(response.status === 201) {
        MySwal.fire({
            title: <strong className="text-2xl">Cập nhật hình ảnh</strong>,
            html: <i className="text-xl">Đã cập nhật ảnh đại diện thành công</i>,
            icon: 'success',
            showConfirmButton: true
          });
      }
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-examination-page">
      <div className="page-header">
        <h1>Ghi Nhận Kết Quả Khám Bệnh</h1>
        <button 
          onClick={() => router.back()}
          className="back-button"
        >
          Quay Lại
        </button>
      </div>
      
      <ExaminationForm 

        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default ExaminationPage;