import React from 'react';

// Minimal AntiCopy placeholder — lightweight wrapper used by birthday flow.
// This preserves previous API: accepts `children`, `className`, `enabled`, and `allowSelector` props.
export default function AntiCopy({ children, className, enabled = true }) {
  // Keep behaviour minimal for now to avoid blocking development.
  return (
    <div className={className ? className : ''} data-anticopy-enabled={enabled}>
      {children}
    </div>
  );
}
