// Card.tsx
import React from 'react';

interface CardProps {
  image: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ image, className }) => {
  return (
    <div 
      className={`inline-block w-20 h-20 sm:w-24 sm:h-24 m-0.5 border border-gray-700 bg-dark-blue bg-center bg-contain bg-no-repeat ${className}`}
      style={{ backgroundImage: `url(${image})` }}
    />
  );
};

export default Card;