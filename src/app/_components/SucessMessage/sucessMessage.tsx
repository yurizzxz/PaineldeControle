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
    <div className="z-10 fixed bottom-4 right-4 text-[.9rem] bg-[#101010] border border-[#252525] text-white px-4 py-4 rounded-md shadow-md flex items-center justify-between">
      <span>{message}</span>
      <button onClick={onClose} className="ml-8 text-[.8rem] bg-[#202020] border border-[#252525] text-white px-2 py-1 rounded">Fechar</button>
    </div>
  );
};

export default SuccessMessage;
