export interface HealthRange {
    normal: {min: number, max: number},
    warning: {min: number, max: number},
    danger: {min: number, max: number},
    recommendations: {
        warning: string;
        danger: string;
    }
}

export type HealthRanges = Record<string ,HealthRange>

export const healthRange: HealthRanges = {
  creatinine: {
    normal: { min: 0.6, max: 1.2 },
    warning: { min: 1.3, max: 2.0 },
    danger: { min: 2.1, max: Infinity },
    recommendations: {
      warning: 'Hạn chế protein động vật, uống đủ nước, kiểm tra lại sau 1 tháng',
      danger: 'Cần khám bác sĩ chuyên khoa thận ngay, giảm đạm trong chế độ ăn'
    }
  },
  urea: {
    normal: { min: 15, max: 40 },
    warning: { min: 41, max: 60 },
    danger: { min: 61, max: Infinity },
    recommendations: {
      warning: 'Uống nhiều nước, giảm thực phẩm giàu đạm',
      danger: 'Cần kiểm tra chức năng thận, hạn chế thịt đỏ và muối'
    }
  },
  gfr: {
    normal: { min: 90, max: 120 },
    warning: { min: 60, max: 89 },
    danger: { min: 0, max: 59 },
    recommendations: {
      warning: 'Theo dõi huyết áp thường xuyên, giảm muối trong chế độ ăn',
      danger: 'Cần tư vấn bác sĩ chuyên khoa thận, kiêng rượu bia'
    }
  },
  alt: {
    normal: { min: 0, max: 40 },
    warning: { min: 41, max: 100 },
    danger: { min: 101, max: Infinity },
    recommendations: {
      warning: 'Hạn chế rượu bia, ăn nhiều rau xanh',
      danger: 'Cần kiểm tra viêm gan, tránh đồ ăn nhiều dầu mỡ'
    }
  },
  fasting: {
    normal: { min: 70, max: 99 },
    warning: { min: 100, max: 125 },
    danger: { min: 126, max: Infinity },
    recommendations: {
      warning: 'Giảm đường và tinh bột, tăng cường vận động',
      danger: 'Nguy cơ tiểu đường, cần xét nghiệm HbA1c và khám chuyên khoa'
    }
  },
  hba1c: {
    normal: { min: 0, max: 5.6 },
    warning: { min: 5.7, max: 6.4 },
    danger: { min: 6.5, max: Infinity },
    recommendations: {
      warning: 'Kiểm soát carbohydrate, tập thể dục đều đặn',
      danger: 'Có thể đã mắc tiểu đường, cần điều trị y tế'
    }
  }
}

export const getHealthRangeStatus = (key: string, value: number): 'normal' | 'warning' | 'danger' => {
  const ranges = healthRange[key];

  if(!ranges) return 'normal';
  if(key !== 'gfr') {
    if(value >= ranges.danger.min) return 'danger';
    if(value >= ranges.warning.min) return 'warning';
    if(value >= ranges.normal.min) return 'normal';
  }else {
    if(value <= ranges.danger.max) return 'danger';
    if(value <= ranges.warning.max) return 'warning';
    if(value <= ranges.normal.max) return 'normal';
  }
  return 'danger';
  
}

export const getRecommendation = (key: string, value: number) : string | null => {
  const ranges = healthRange[key];

  if(!ranges) return null;

  const status = getHealthRangeStatus(key, value);
  return status === 'warning' ? ranges.recommendations.warning : status === 'danger' ? ranges.recommendations.danger : null
}
