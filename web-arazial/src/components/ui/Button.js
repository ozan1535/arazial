import styled, { css } from 'styled-components';

const variants = {
  primary: css`
    background-color: var(--color-primary);
    color: white;
    box-shadow: 0 2px 8px rgba(15, 52, 96, 0.25);
    border: 1px solid var(--color-primary-dark);
    
    &:hover {
      background-color: var(--color-primary-dark);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 52, 96, 0.35);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(15, 52, 96, 0.2);
    }
    
    &:disabled {
      background-color: var(--color-primary-light);
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `,
  secondary: css`
    background-color: transparent;
    color: var(--color-primary);
    border: 1.5px solid var(--color-primary);
    box-shadow: 0 2px 4px rgba(15, 52, 96, 0.1);
    
    &:hover {
      background-color: var(--color-primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 52, 96, 0.2);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(15, 52, 96, 0.1);
    }
    
    &:disabled {
      border-color: var(--color-text-light);
      color: var(--color-text-light);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `,
  outline: css`
    background-color: transparent;
    color: var(--color-primary);
    border: 1.5px solid var(--color-primary);
    box-shadow: 0 1px 3px rgba(15, 52, 96, 0.1);
    
    &:hover {
      background-color: rgba(15, 52, 96, 0.05);
      transform: translateY(-2px);
      box-shadow: 0 3px 10px rgba(15, 52, 96, 0.15);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(15, 52, 96, 0.1);
    }
    
    &:disabled {
      border-color: var(--color-text-light);
      color: var(--color-text-light);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `,
  accent: css`
    background-color: var(--color-accent);
    color: white;
    box-shadow: 0 2px 8px rgba(233, 69, 96, 0.25);
    border: 1px solid #d13551;
    
    &:hover {
      background-color: #d13551;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(233, 69, 96, 0.35);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(233, 69, 96, 0.2);
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `,
  gold: css`
    background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 50%, var(--color-gold) 100%);
    color: white;
    box-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
    border: 1px solid var(--color-gold-dark);
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    
    &:hover {
      background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold) 50%, var(--color-gold-dark) 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 5px rgba(212, 175, 55, 0.25);
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `,
  text: css`
    background-color: transparent;
    color: var(--color-primary);
    padding: 0.5rem;
    box-shadow: none;
    
    &:hover {
      text-decoration: none;
      background-color: rgba(15, 52, 96, 0.05);
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      color: var(--color-text-light);
      cursor: not-allowed;
      transform: none;
    }
  `,
  secondaryOnPrimary: css`
    background-color: white;
    color: var(--color-primary);
    border: none;
    font-weight: 700;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.9);
      color: var(--color-primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `,
  premium: css`
    background: linear-gradient(135deg, #B89328 0%, var(--color-gold) 50%, #DFBD45 100%);
    color: white;
    box-shadow: 0 2px 15px rgba(212, 175, 55, 0.4);
    border: 1px solid #A67C00;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    z-index: 1;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
      transition: left 0.7s ease;
      z-index: -1;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.5);
      
      &::before {
        left: 100%;
      }
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
    }
  `
};

const sizes = {
  small: css`
    padding: 0.5rem 1.25rem;
    font-size: 0.875rem;
    min-height: 36px;
  `,
  medium: css`
    padding: 0.75rem 1.75rem;
    font-size: 1rem;
    min-height: 44px;
  `,
  large: css`
    padding: 1rem 2.25rem;
    font-size: 1.125rem;
    min-height: 54px;
  `,
};

const Button = styled.button`
  display: ${props => props.fullWidth ? 'block' : 'inline-flex'};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  align-items: center;
  justify-content: center;
  font-weight: 600;
  text-align: center;
  border: none;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  cursor: pointer;
  letter-spacing: 0.5px;
  min-width: ${props => props.minWidth || '120px'};
  position: relative;
  overflow: hidden;
  
  ${props => variants[props.variant || 'primary']}
  ${props => sizes[props.size || 'medium']}
  
  ${props => props.loading && css`
    opacity: 0.7;
    cursor: wait;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin-top: -10px;
      margin-left: -10px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s infinite linear;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}
  
  ${props => props.className && ''}
  
  ${props => props.hasIcon && css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    svg {
      width: 18px;
      height: 18px;
    }
  `}
`;

export default Button;
