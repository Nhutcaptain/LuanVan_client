// src/app/components/HealthStatusCard/index.tsx
import React from 'react';
import { format } from 'date-fns';
import './styles.css';

interface HealthStatusItem {
  label: string;
  value: string;
  date?: string;
}

interface HealthStatusCardProps {
  title: string;
  items: HealthStatusItem[];
}

const HealthStatusCard: React.FC<HealthStatusCardProps> = ({ title, items }) => {
  return (
    <div className="health-card">
      <h3 className="health-card-title">{title}</h3>
      <ul className="health-card-list">
        {items.map((item, index) => (
          <li key={index} className="health-card-item">
            <span className="health-card-label">{item.label}:</span>
            <span className="health-card-value">{item.value}</span>
            {item.date && (
              <span className="health-card-date">
                {format(new Date(item.date), 'dd/MM/yyyy')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthStatusCard;