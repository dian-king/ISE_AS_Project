import React from 'react';

interface SchoolCrestProps {
  className?: string;
}

export const SchoolCrest: React.FC<SchoolCrestProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Excella International School crest">
    {/* Shield outline */}
    <path d="M30 2L4 14V38C4 53 17 64 30 68C43 64 56 53 56 38V14L30 2Z" fill="#4DB8E8" />
    {/* Shield inner */}
    <path d="M30 7L8 18V38C8 51 20 61 30 65C40 61 52 51 52 38V18L30 7Z" fill="#E8731A" />
    {/* Horizontal divider */}
    <path d="M13 32H47" stroke="#4DB8E8" strokeWidth="1.5" />
    {/* Top: open book icon */}
    <path d="M22 24C22 24 26 22 30 23C34 22 38 24 38 24V29C38 29 34 27 30 28C26 27 22 29 22 29V24Z" fill="#4DB8E8" opacity="0.9" />
    <line x1="30" y1="23" x2="30" y2="29" stroke="#4DB8E8" strokeWidth="0.8" />
    {/* Bottom: EIS initials */}
    <text x="30" y="45" textAnchor="middle" fill="#4DB8E8" fontSize="10" fontWeight="bold" fontFamily="Georgia, serif" letterSpacing="1">EIS</text>
  </svg>
);
