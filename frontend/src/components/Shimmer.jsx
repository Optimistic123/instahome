import React from 'react';

/**
 * Base Shimmer Component
 * Provides shimmer animation effect for loading states
 */
export const Shimmer = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`shimmer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Shimmer Box - A simple rectangular shimmer placeholder
 */
export const ShimmerBox = ({ width = '100%', height = '1rem', className = '', rounded = true }) => {
  return (
    <Shimmer
      className={`${rounded ? 'rounded' : ''} ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Shimmer Circle - A circular shimmer placeholder
 */
export const ShimmerCircle = ({ size = '1rem', className = '' }) => {
  return (
    <Shimmer
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

/**
 * Shimmer Text - Multiple lines of text shimmer
 */
export const ShimmerText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerBox
          key={i}
          height="0.875rem"
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
};

export default Shimmer;

