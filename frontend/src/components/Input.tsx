import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2" htmlFor={props.id}>
        {label}
      </label>
      <input
        className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
        {...props}
      />
    </div>
  );
};
