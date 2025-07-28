import React, { useState } from 'react';
import { format } from 'date-fns';
import './styles.css';
import { Cholesterol, Glucose, HealthMetric, KidneyFunction, LiverFunction } from '@/interface/HealthStatusInterface';
import { Tooltip } from 'react-tooltip';
import { getTooltipDescription } from '@/utils/getTooltipDescription';
import 'react-tooltip/dist/react-tooltip.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { getHealthRangeStatus, getRecommendation } from '@/utils/healthRange';

interface MetricData {
  [key: string]: HealthMetric<number | string> | undefined;
}

interface Props {
  title: string;
  metrics: KidneyFunction | LiverFunction | Cholesterol | Glucose;
  onUpdate?: (updatedMetrics: any) => void;
}

const HealthMetricSection = (props: Props) => {
  const { title, metrics, onUpdate } = props;
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const metricData = metrics as MetricData;

  const handleEditClick = () => {
    const initialValues: Record<string, string> = {};
    Object.entries(metricData).forEach(([key, metric]) => {
      if (metric?.value) {
        initialValues[key] = typeof metric.value === 'string' 
          ? metric.value 
          : metric.value.toString();
      }
    });
    setEditValues(initialValues);
    setEditing(true);
  };

  const handleSaveClick = () => {
    if (onUpdate) {
      const updatedMetrics: any = {};
      Object.entries(editValues).forEach(([key, value]) => {
        updatedMetrics[key] = {
          value: isNaN(Number(value)) ? value : Number(value),
          testedAt: new Date().toISOString()
        };
      });
      onUpdate(updatedMetrics);
    }
    setEditing(false);
  };

  const handleCancelClick = () => {
    setEditing(false);
  };

  const handleValueChange = (key: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="health-section">
      <div className="health-section-header">
        <h3 className="health-section-title">{title}</h3>
        {onUpdate && (
          <div className="health-section-actions">
            {editing ? (
              <>
                <button className="health-section-save-btn" onClick={handleSaveClick}>
                  Lưu
                </button>
                <button className="health-section-cancel-btn" onClick={handleCancelClick}>
                  Hủy
                </button>
              </>
            ) : (
              <button className="health-section-edit-btn" onClick={handleEditClick}>
                Chỉnh sửa
              </button>
            )}
          </div>
        )}
      </div>
      <div className="health-metrics-grid">
        {Object.entries(metricData).map(([key, metric]) => {
          if (!metric?.value) return null;
          
          const numericValue = typeof metric.value === 'string' 
            ? parseFloat(metric.value.replace(/[^0-9.]/g,''))
            : metric.value;
          const status = getHealthRangeStatus(key, numericValue);
          const recommendation = getRecommendation(key, numericValue);
          const tooltipId = `tooltip-${key}`;
          const tooltipContent = renderToStaticMarkup(
            <>
              {getTooltipDescription(key)}
              {recommendation && (
                <>
                  <hr className='my-2'></hr>
                  <div className={`recommend ${status}`}>
                    <strong>Khuyến nghị:</strong> {recommendation}
                  </div>
                </>
              )}
            </>
          );

          return (
            <div key={key} className={`health-metric-item ${status} ${editing ? 'editing' : ''}`}>
              {editing ? (
                <div className="health-metric-edit-container">
                  <div className="health-metric-header">
                    <span className="health-metric-name">{formatMetricName(key)}</span>
                  </div>
                  <div className="health-metric-edit-input-container">
                    <input
                      type="text"
                      className="health-metric-edit-input"
                      value={editValues[key] || ''}
                      onChange={(e) => handleValueChange(key, e.target.value)}
                    />
                    <span className="health-metric-unit">{getUnit(key)}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="health-metric-header cursor-help"
                    data-tooltip-id={tooltipId}
                    data-tooltip-html={tooltipContent}
                    data-tooltip-class-name='custom-tooltip'
                  >
                    <span className="health-metric-name">{formatMetricName(key)}</span>
                    {metric.testedAt && (
                      <span className="health-metric-date">
                        {format(new Date(metric.testedAt), 'dd/MM/yyyy')}
                      </span>
                    )}
                  </div>
                  <div 
                    className="health-metric-value cursor-help"
                    data-tooltip-id={tooltipId}
                    data-tooltip-html={tooltipContent}
                    data-tooltip-class-name='custom-tooltip'
                  >
                    {typeof metric.value === 'number' 
                      ? metric.value.toLocaleString() 
                      : metric.value}
                    <span className="health-metric-unit">{getUnit(key)}</span>
                  </div>
                  <Tooltip
                    id={tooltipId}
                    place="top"
                    style={{fontSize: 18}}
                  />
                  {status !== 'normal' && (
                    <div className={`status-indicator ${status}`}></div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper functions remain the same
function formatMetricName(key: string): string {
  const names: Record<string, string> = {
    creatinine: 'Creatinine',
    urea: 'Ure',
    gfr: 'GFR',
    alt: 'ALT (GPT)',
    ast: 'AST (GOT)',
    bilirubin: 'Bilirubin',
    total: 'Tổng Cholesterol',
    hdl: 'HDL Cholesterol',
    ldl: 'LDL Cholesterol',
    triglycerides: 'Triglycerides',
    fasting: 'Đường huyết đói',
    hba1c: 'HbA1c'
  };
  return names[key] || key;
}

function getUnit(key: string): string {
  const units: Record<string, string> = {
    creatinine: 'mg/dL',
    urea: 'mg/dL',
    gfr: 'ml/phút/1.73m²',
    alt: 'U/L',
    ast: 'U/L',
    bilirubin: 'mg/dL',
    total: 'mg/dL',
    hdl: 'mg/dL',
    ldl: 'mg/dL',
    triglycerides: 'mg/dL',
    fasting: 'mg/dL',
    hba1c: '%'
  };
  return units[key] || '';
}

export default HealthMetricSection;