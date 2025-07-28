import React, { useState } from "react";
import { format } from "date-fns";
import "./styles.css";

interface HealthStatusItem {
  label: string;
  value: string;
  date?: string;
  fieldName?: string;
}

interface HealthStatusCardProps {
  title: string;
  items: HealthStatusItem[];
  onUpdate?: (field: string, value: string) => void;
}

const HealthStatusCard: React.FC<HealthStatusCardProps> = ({
  title,
  items,
  onUpdate,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Check if we have both weight and height to calculate BMI
  const weightItem = items.find((item) => item.fieldName === "weight");
  const heightItem = items.find((item) => item.fieldName === "height");

  const calculateBMI = (): HealthStatusItem | null => {
    if (weightItem && heightItem) {
      try {
        // Extract numeric values
        const weight = parseFloat(weightItem.value.replace(/[^0-9.]/g, ""));
        const height =
          parseFloat(heightItem.value.replace(/[^0-9.]/g, "")) / 100; // convert cm to m

        if (weight > 0 && height > 0) {
          const bmiValue = (weight / (height * height)).toFixed(1);

          const bmiNumber = parseFloat(bmiValue);
          let bmiStatus = "";

          if (bmiNumber < 18.5) bmiStatus = " (Thiếu cân)";
          else if (bmiNumber < 23) bmiStatus = " (Bình thường)";
          else if (bmiNumber < 25) bmiStatus = " (Tiền béo phì)";
          else if (bmiNumber < 30) bmiStatus = " (Béo phì độ I)";
          else bmiStatus = " (Béo phì độ II)";

          return {
            label: "BMI",
            value: `${bmiValue}${bmiStatus}`,
            date: weightItem.date || heightItem.date,
          };
        }
      } catch (e) {
        console.error("Error calculating BMI:", e);
      }
    }
    return null;
  };

  const bmiItem = calculateBMI();
  const displayItems = bmiItem ? [...items, bmiItem] : items;

  const handleEditClick = (field: string, currentValue: string) => {
    setEditingField(field);
    const numericValue = currentValue.replace(/[^0-9.]/g, "");
    setEditValue(numericValue);
  };

  const handleSaveClick = (field: string) => {
    if (onUpdate && editValue) {
      onUpdate(field, editValue);
    }
    setEditingField(null);
  };

  const handleCancelClick = () => {
    setEditingField(null);
  };

  return (
    <div className="health-card">
      <div className="health-card-header">
        <h3 className="health-card-title">{title}</h3>
      </div>
      <ul className="health-card-list">
        {displayItems.map((item, index) => {
          const fieldName = item.fieldName ?? "";
          const isBMI = item.label === "BMI";

          return (
            <li
              key={index}
              className={`health-card-item ${isBMI ? "bmi-item" : ""}`}
            >
              <span className="health-card-label">{item.label}:</span>

              {editingField === fieldName ? (
                <div className="health-card-edit-container">
                  <input
                    type="text"
                    className="health-card-edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                  <span className="health-card-unit">
                    {item.value.split(" ").pop()}
                  </span>
                  <div className="health-card-edit-buttons">
                    <button
                      className="health-card-save-btn"
                      onClick={() => handleSaveClick(fieldName)}
                    >
                      <i className="icon-check"></i> Lưu
                    </button>
                    <button
                      className="health-card-cancel-btn"
                      onClick={handleCancelClick}
                    >
                      <i className="icon-close"></i> Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span
                    className={`health-card-value ${isBMI ? "bmi-value" : ""}`}
                  >
                    {item.value}
                  </span>
                  {onUpdate && fieldName && !isBMI && (
                    <button
                      className="health-card-edit-btn"
                      onClick={() => handleEditClick(fieldName, item.value)}
                    >
                      <i className="icon-edit"></i> Chỉnh sửa
                    </button>
                  )}
                </>
              )}

              {item.date && (
                <span className="health-card-date">
                  {format(new Date(item.date), "dd/MM/yyyy")}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default HealthStatusCard;
