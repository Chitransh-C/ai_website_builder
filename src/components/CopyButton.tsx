// src/components/CopyButton.tsx
'use client'

import { useState } from 'react'

interface CopyButtonProps {
  textToCopy: string;
}

export const CopyButton = ({ textToCopy }: CopyButtonProps) => {
  const [buttonText, setButtonText] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setButtonText('Copied!');
      setTimeout(() => {
        setButtonText('Copy');
      }, 2000); // Reset back to 'Copy' after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setButtonText('Failed!');
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700"
    >
      {buttonText}
    </button>
  );
};