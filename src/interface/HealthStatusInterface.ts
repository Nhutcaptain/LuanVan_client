export interface HealthMetric<T = number> {
  value?: T;
  testedAt?: string;
}

// Không còn index signature → chỉ có các chỉ số định nghĩa sẵn
export interface KidneyFunction {
  creatinine?: HealthMetric;
  urea?: HealthMetric;
  gfr?: HealthMetric;
}

export interface LiverFunction {
  alt?: HealthMetric;
  ast?: HealthMetric;
  bilirubin?: HealthMetric;
}

export interface Cholesterol {
  total?: HealthMetric;
  hdl?: HealthMetric;
  ldl?: HealthMetric;
  triglycerides?: HealthMetric;
}

export interface Glucose {
  fasting?: HealthMetric;
  hba1c?: HealthMetric;
}

export interface HealthStatus {
  userId: string;
  weight?: HealthMetric;
  height?: HealthMetric;
  heartRate?: HealthMetric;
  bloodPressure?: HealthMetric<string>;
  diabetes?: HealthMetric<string>;
  blood?: HealthMetric<string>;
  kidneyFunction?: KidneyFunction;
  liverFunction?: LiverFunction;
  cholesterol?: Cholesterol;
  glucose?: Glucose;
  note?: string;
  createdAt?: string;
}
