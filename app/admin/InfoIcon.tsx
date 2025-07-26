import React from "react";

const InfoIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="#2563eb" fill="#eff6ff" />
    <line x1="12" y1="16" x2="12" y2="12" stroke="#2563eb" />
    <circle cx="12" cy="8" r="1" fill="#2563eb" />
  </svg>
);

export default InfoIcon;
