export const OtpInput = styled.input`
  width: 48px;
  height: 48px;
  font-size: 24px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  text-align: center;
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-transparent);
  }

  /* Hide increment/decrement buttons for number input */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* Firefox */
  -moz-appearance: textfield;
`; 