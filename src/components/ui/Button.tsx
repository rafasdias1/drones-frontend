import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      {...props}
    >
      {children}
    </button>
  );
};
