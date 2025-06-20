import styled from 'styled-components';

const InputWrapper = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
  ${props => props.className && ''}
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1.125rem;
  font-size: 1rem;
  border: 1.2px solid ${props => props.error ? 'var(--color-error)' : 'var(--color-text-secondary)'};
  border-opacity: 0.15;
  border-radius: 10px;
  background-color: var(--color-surface);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    border-width: 1.5px;
    box-shadow: 0 0 0 3px rgba(15, 52, 96, 0.1);
  }
  
  &::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.5;
  }
  
  &:disabled {
    background-color: var(--color-surface-secondary);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 0.5rem;
  color: var(--color-error);
  font-size: 0.875rem;
`;

const Input = ({
  id,
  label,
  error,
  className,
  hideLabel = false,
  ...props
}) => {
  return (
    <InputWrapper className={className}>
      {label && !hideLabel && <Label htmlFor={id}>{label}</Label>}
      <StyledInput id={id} error={error} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

export default Input;