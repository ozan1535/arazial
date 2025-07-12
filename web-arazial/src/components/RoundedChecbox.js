import React from "react";
import styled from "styled-components";

const CheckboxWrapper = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  display: none;
`;

const StyledCheckbox = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%; /* makes it circular */
  border: 2px solid #ccc;
  background: ${(props) => (props.checked ? "green" : "white")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  svg {
    opacity: ${(props) => (props.checked ? 1 : 0)};
    color: white;
    width: 14px;
    height: 14px;
    transition: opacity 0.2s;
  }
`;

const LabelText = styled.span`
  font-size: 1rem;
  margin-left: 0.5rem;
  font-weight: 600;
  color: white;
`;

const Wrapper = styled.div`
  background: ${(props) =>
    props.checked ? "var(--color-primary)" : "var(--color-primary-light)"};
  padding: 1rem;
  border-radius: 15px;
  margin: 0.5rem auto;
  transition: background 0.3s ease;
  cursor: pointer;
  &:hover {
    background: var(--color-primary);
  }
`;

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const RoundedCheckbox = ({ checked, onClick, label }) => {
  return (
    <Wrapper checked={checked} onClick={onClick}>
      <CheckboxWrapper>
        <HiddenCheckbox checked={checked} />
        <StyledCheckbox checked={checked}>
          <CheckIcon />
        </StyledCheckbox>
        {label && <LabelText>{label}</LabelText>}
      </CheckboxWrapper>
    </Wrapper>
  );
};
