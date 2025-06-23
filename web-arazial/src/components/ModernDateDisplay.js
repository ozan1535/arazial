import React from "react";
import styled from "styled-components";

const DateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb), 0.05) 0%,
    rgba(var(--color-primary-rgb), 0.08) 100%
  );
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.12);
  }
`;

const DateIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-primary);

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DateContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DateLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DateValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.2;
`;

/* 
padding: 0.5rem 0.75rem;
*/
const CompactDateContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text);

  svg {
    width: 14px;
    height: 14px;
    color: var(--color-primary);
  }
`;

const ModernDateDisplay = ({
  date,
  label,
  compact = false,
  showIcon = true,
  className,
  canHavePadding = true,
}) => {
  if (!date) return null;
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);

      // Removes first 0(zero) on the date in mobile
      // return date.toLocaleString("tr-TR", {
      //   day: "numeric",
      //   month: "numeric",
      //   year: "numeric",
      //   hour: "2-digit",
      //   minute: "2-digit",
      // });

      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();
      const hour = String(date.getUTCHours()).padStart(2, "0");
      const minute = String(date.getUTCMinutes()).padStart(2, "0");
      // Return the formatted date
      return `${day}.${month}.${year} ${hour}:${minute}`;
    } catch (e) {
      return "Geçersiz Tarih";
    }
  };

  const CalendarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  );

  const ClockIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );

  if (compact) {
    return (
      <CompactDateContainer
        className={className}
        style={{ padding: canHavePadding ? "0.5rem 0.75rem" : "" }}
      >
        {showIcon && <ClockIcon />}
        {formatDate(date)}
      </CompactDateContainer>
    );
  }

  return (
    <DateContainer className={className}>
      {showIcon && (
        <DateIcon>
          <CalendarIcon />
        </DateIcon>
      )}
      <DateContent>
        {label && <DateLabel>{label}</DateLabel>}
        <DateValue>{formatDate(date)}</DateValue>
      </DateContent>
    </DateContainer>
  );
};

export default ModernDateDisplay;
