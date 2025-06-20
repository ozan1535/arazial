import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.fullPage && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
  `}
  
  ${props => props.fullWidth && `
    width: 100%;
    padding: 2rem 0;
  `}
`;

const StyledSpinner = styled.div`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
  border: ${props => `${Math.max(2, props.size / 10)}px`} solid rgba(15, 52, 96, 0.1);
  border-top: ${props => `${Math.max(2, props.size / 10)}px`} solid var(--color-primary);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  
  ${props => props.variant === 'accent' && `
    border-top-color: var(--color-accent);
  `}
  
  ${props => props.variant === 'gold' && `
    border-top-color: var(--color-gold);
  `}
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
`;

const LoadingSpinner = ({
  size = 40,
  variant = 'primary',
  fullPage = false,
  fullWidth = false,
  text,
  className,
  ...rest
}) => {
  return (
    <SpinnerContainer 
      fullPage={fullPage} 
      fullWidth={fullWidth}
      className={className}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <StyledSpinner 
          size={size} 
          variant={variant}
          {...rest}
        />
        {text && <LoadingText>{text}</LoadingText>}
      </div>
    </SpinnerContainer>
  );
};

export default LoadingSpinner; 