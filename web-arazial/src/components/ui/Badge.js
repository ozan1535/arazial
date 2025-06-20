import React from 'react';
import styled, { css } from 'styled-components';

const variantStyles = {
  primary: css`
    background-color: var(--color-primary);
    color: white;
  `,
  secondary: css`
    background-color: rgba(15, 52, 96, 0.05);
    color: var(--color-primary);
    border: 1px solid rgba(15, 52, 96, 0.1);
  `,
  success: css`
    background-color: var(--color-success);
    color: white;
  `,
  warning: css`
    background-color: var(--color-warning);
    color: white;
  `,
  error: css`
    background-color: var(--color-error);
    color: white;
  `,
  accent: css`
    background-color: var(--color-accent);
    color: white;
  `,
  gold: css`
    background-color: var(--color-gold);
    color: white;
  `,
  outline: css`
    background-color: transparent;
    color: var(--color-text);
    border: 1px solid rgba(75, 85, 99, 0.2);
  `,
};

const sizeStyles = {
  small: css`
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
  `,
  medium: css`
    padding: 0.35rem 0.75rem;
    font-size: 0.875rem;
  `,
  large: css`
    padding: 0.5rem 1rem;
    font-size: 1rem;
  `,
};

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.3px;
  white-space: nowrap;
  
  ${props => variantStyles[props.variant || 'primary']}
  ${props => sizeStyles[props.size || 'medium']}
  
  ${props => props.pill && css`
    border-radius: 999px;
  `}
  
  ${props => props.className && ''}
`;

const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  pill = false,
  className,
  ...rest 
}) => {
  return (
    <StyledBadge 
      variant={variant} 
      size={size}
      pill={pill}
      className={className}
      {...rest}
    >
      {children}
    </StyledBadge>
  );
};

export default Badge; 