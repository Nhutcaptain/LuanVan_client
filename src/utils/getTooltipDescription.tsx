import React, { ReactNode } from 'react';

// Kiểu nội dung tooltip có thể là ReactNode (JSX) hoặc chuỗi fallback
type TooltipContent = ReactNode;

export const getTooltipDescription = (key: string): TooltipContent => {
  const tooltips: Record<string, ReactNode> = {
    creatinine: (
      <>
        <strong>Creatinine</strong><br />
        Là sản phẩm từ chuyển hóa cơ bắp, được lọc qua thận.<br />
        Tăng cao có thể phản ánh suy giảm chức năng thận.
      </>
    ),
    urea: (
      <>
        <strong>Urea</strong><br />
        Chất thải do gan tạo ra khi phân hủy protein.<br />
        Chỉ số cao cũng cảnh báo chức năng thận kém.
      </>
    ),
    gfr: (
      <>
        <strong>GFR</strong><br />
        Tốc độ lọc cầu thận — chỉ số quan trọng để đánh giá chức năng thận.<br />
        GFR thấp cảnh báo bệnh thận mãn tính.
      </>
    ),
    alt: (
      <>
        <strong>ALT (GPT)</strong><br />
        Enzyme gan, tăng khi tế bào gan bị tổn thương như viêm gan.
      </>
    ),
    ast: (
      <>
        <strong>AST (GOT)</strong><br />
        Tương tự ALT nhưng cũng có trong tim — tăng khi gan hoặc tim bị ảnh hưởng.
      </>
    ),
    bilirubin: (
      <>
        <strong>Bilirubin</strong><br />
        Chất chuyển hóa của hemoglobin, tăng cao có thể dẫn đến vàng da.
      </>
    ),
    total: (
      <>
        <strong>Tổng Cholesterol</strong><br />
        Chỉ tổng lượng cholesterol trong máu — cao dễ dẫn đến xơ vữa động mạch.
      </>
    ),
    hdl: (
      <>
        <strong>HDL Cholesterol</strong><br />
        Cholesterol "tốt" giúp giảm nguy cơ bệnh tim.
      </>
    ),
    ldl: (
      <>
        <strong>LDL Cholesterol</strong><br />
        Cholesterol "xấu" gây tích tụ mỡ trong mạch máu.
      </>
    ),
    triglycerides: (
      <>
        <strong>Triglycerides</strong><br />
        Dạng chất béo lưu trữ trong cơ thể, cao có thể gây bệnh tim.
      </>
    ),
    fasting: (
      <>
        <strong>Đường huyết đói</strong><br />
        Đo sau nhịn ăn 8 tiếng. Cao có thể là dấu hiệu tiền tiểu đường.
      </>
    ),
    hba1c: (
      <>
        <strong>HbA1c</strong><br />
        Phản ánh đường huyết trung bình 2–3 tháng gần nhất.<br />
        Dùng để chẩn đoán và theo dõi tiểu đường.
      </>
    )
  };

  return tooltips[key] ?? 'Không có mô tả cho chỉ số này.';
};
