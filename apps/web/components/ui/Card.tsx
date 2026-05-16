/**
 * Card — surface container using semantic background and border tokens.
 */

import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Elevated variant uses shadow-card-hover */
  elevated?: boolean;
  /** Removes padding for custom content layout */
  noPadding?: boolean;
}

export function Card({
  children,
  elevated = false,
  noPadding = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`
        bg-bg-surface border border-border-default rounded-lg
        ${elevated ? "shadow-card-hover" : "shadow-card"}
        ${noPadding ? "" : "p-6"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
