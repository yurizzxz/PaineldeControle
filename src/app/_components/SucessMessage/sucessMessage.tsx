"use client";
import React, { useEffect, useState } from "react";

interface SuccessMessageProps {
  message: string;
  onClose: () => void; 
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="z-10 fixed bottom-4 right-4 bg-[#00BB83] text-white px-4 py-2 rounded-md shadow-md">
      {message}
    </div>
  );
};

export default SuccessMessage;
