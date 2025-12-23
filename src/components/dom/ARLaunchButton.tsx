'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompatibilityWarning } from './CompatibilityWarning';

export interface ARLaunchButtonProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Button component that checks browser compatibility before launching AR experience
 * Wraps any button/link and shows compatibility warning if needed
 */
export const ARLaunchButton = ({
  children,
  className,
  style,
}: ARLaunchButtonProps) => {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Always show warning for feature detection
    setShowWarning(true);
  };

  const handleProceed = () => {
    setShowWarning(false);
    router.push('/ar');
  };

  const handleCancel = () => {
    setShowWarning(false);
  };

  return (
    <>
      <button onClick={handleClick} className={className} style={style}>
        {children}
      </button>

      {showWarning && (
        <CompatibilityWarning
          onProceed={handleProceed}
          onCancel={handleCancel}
          showOnlyIfIncompatible={false}
        />
      )}
    </>
  );
};

/**
 * Link-style variant that preserves anchor semantics
 */
export const ARLaunchLink = ({
  children,
  className,
  style,
}: ARLaunchButtonProps) => {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowWarning(true);
  };

  const handleProceed = () => {
    setShowWarning(false);
    router.push('/ar');
  };

  const handleCancel = () => {
    setShowWarning(false);
  };

  return (
    <>
      <a href="/ar" onClick={handleClick} className={className} style={style}>
        {children}
      </a>

      {showWarning && (
        <CompatibilityWarning
          onProceed={handleProceed}
          onCancel={handleCancel}
          showOnlyIfIncompatible={false}
        />
      )}
    </>
  );
};
