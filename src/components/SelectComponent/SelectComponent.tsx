import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectComponentProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  name?: string;
  disabled?: boolean;
  required?: boolean;
}

const SelectComponent: React.FC<SelectComponentProps> = ({
  label,
  value,
  onChange,
  options,
  name,
  disabled = false,
  required = false,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-1 font-medium" htmlFor={name}>
          {label}
        </label>
      )}
      <select
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
      >
        <option value="" disabled>
          -- Chọn --
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectComponent;