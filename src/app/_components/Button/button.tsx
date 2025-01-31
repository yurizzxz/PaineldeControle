import React from 'react';

interface Button {
  onClick?: () => void;
  children?: React.ReactNode;
}

const Button: React.FC<Button> = ({ onClick, children   }) => {
  return (
    <button
      onClick={onClick}
      className="bg-[#00BB83] text-white text-sm px-4 py-2 rounded-md hover:bg-[#009966] transition"
    >
      {children}
    </button>
  );
};

export default Button;
