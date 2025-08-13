import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';

interface Props {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  isShowPasswordToggle?: boolean;
  error?: string;
  success?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
}

const InputComponent = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  const {
    label,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    name = '',
    disabled = false,
    required = false,
    isShowPasswordToggle = false,
    error,
    success = false,
    loading = false,
    icon,
    className = '',
    autoFocus = false,
    ...rest
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = isShowPasswordToggle 
    ? showPassword ? 'text' : 'password' 
    : type;

  // Combine refs
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(inputRef.current);
    } else if (ref) {
      ref.current = inputRef.current;
    }
  }, [ref]);

  const hasError = !!error;
  const hasSuccess = success && !hasError && !!value;

  const getInputClasses = () => {
    let classes = [
      'w-full',
      'px-4',
      'py-3',
      'rounded-lg',
      'border',
      'transition-all',
      'duration-200',
      'ease-in-out',
      'focus:outline-none',
      'focus:ring-2',
      'disabled:opacity-70',
      'disabled:cursor-not-allowed',
      'text-gray-800',
      'dark:text-gray-100',
    ];

    if (hasError) {
      classes.push(
        'border-red-500',
        'focus:ring-red-200',
        'focus:border-red-500',
        'bg-red-50/30'
      );
    } else if (hasSuccess) {
      classes.push(
        'border-green-500',
        'focus:ring-green-200',
        'focus:border-green-500',
        'bg-green-50/30'
      );
    } else {
      classes.push(
        'border-gray-300',
        'focus:ring-blue-200',
        'focus:border-blue-500',
        'bg-white',
        'dark:bg-gray-800',
        'dark:border-gray-600'
      );
    }

    if (icon) {
      classes.push('pl-11'); // Thêm padding trái để chừa chỗ cho icon
    }

    if (isShowPasswordToggle || loading) {
      classes.push('pr-10');
    }

    return classes.join(' ');
  };

  return (
    <div className={`mb-4 w-full ${className}`}>
      {/* Label luôn nằm phía trên input */}
      {label && (
        <label
          className={`
            block mb-2 font-medium
            ${hasError ? 'text-red-500' : 'text-gray-700'}
            dark:${hasError ? 'text-red-400' : 'text-gray-300'}
          `}
          htmlFor={name}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Icon nằm bên trái và được căn giữa theo chiều dọc */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400">
            {icon}
          </div>
        )}

        {/* Input field */}
        <input
          ref={inputRef}
          className={getInputClasses()}
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          {...rest}
        />

        {/* Các icon bên phải (loading, password toggle, success/error) */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Loading indicator */}
          {loading && (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
          )}

          {/* Success indicator */}
          {hasSuccess && !loading && (
            <Check className="h-5 w-5 text-green-500 dark:text-green-400" />
          )}

          {/* Error indicator */}
          {hasError && !loading && (
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          )}

          {/* Password toggle */}
          {isShowPasswordToggle && !loading && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {hasError && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}

      {/* Success message (optional) */}
      {hasSuccess && !hasError && (
        <p className="mt-1 text-sm text-green-500 dark:text-green-400 flex items-center">
          <Check className="h-4 w-4 mr-1" />
          Thông tin hợp lệ
        </p>
      )}
    </div>
  );
});

InputComponent.displayName = 'InputComponent';

export default InputComponent;