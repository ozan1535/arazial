import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import styled from "styled-components";

// Styled wrapper for the button
const ButtonWrapper = styled.a`
  padding: 0.5rem 0.5rem;
  background: var(--color-primary);
  border-radius: 10px;
  cursor: pointer;
`;

function WhatsappButton() {
  const message = `Merhaba, ilan hakkında bilgi almak istiyorum. ${window.location.href}`;

  return (
    <ButtonWrapper
      href={`https://wa.me/+908502419157?text=${encodeURIComponent(message)}`}
    >
      <FaWhatsapp color="white" fontSize={22} />
    </ButtonWrapper>
  );
}

export default WhatsappButton;
