import React from "react";
import { FaPhone } from "react-icons/fa";
import styled from "styled-components";

// Styled wrapper for the button
const ButtonWrapper = styled.a`
  padding: 0.25rem 0.5rem;
  background: var(--color-primary);
  border-radius: 10px;
  cursor: pointer;
`;

function PhoneButton() {
  return (
    <ButtonWrapper href="tel:+908502419157">
      <FaPhone color="white" />
    </ButtonWrapper>
  );
}

export default PhoneButton;
