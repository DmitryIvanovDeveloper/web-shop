'use client';

import { useState } from 'react';

interface LoginButtonProps {
  onLoginClick: () => void;
}

export function LoginButton({ onLoginClick }: LoginButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button 
      onClick={onLoginClick}
      className="relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-lg">🔐</span>
      <span>Войти</span>
      {isHovered && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      )}
    </button>
  );
}
