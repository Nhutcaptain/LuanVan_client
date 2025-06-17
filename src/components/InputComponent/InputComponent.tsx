import React from 'react';

interface Props {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
}

const InputComponent = (props: Props) => {
  const {
    label,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    name = '',
    disabled = false,
    required = false,
  } = props;
  return (
    <div className="mb-4 w-full"> 
      {label && (
        <label className="block mb-1 font-medium text-lg" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400 text-lg"
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </div>
  );
};

export default InputComponent;