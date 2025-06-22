import React from "react";
import styled, { css } from "styled-components";

const elevations = {
  flat: css`
    box-shadow: none;
    border: 1px solid rgba(75, 85, 99, 0.15);
  `,
  low: css`
    box-shadow: var(--shadow-sm);
  `,
  medium: css`
    box-shadow: var(--shadow-md);
  `,
  high: css`
    box-shadow: var(--shadow-lg);
  `,
  premium: css`
    box-shadow: var(--shadow-premium);
  `,
};

const CardContainer = styled.div`
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  position: relative;
  ${(props) => elevations[props.elevation || "medium"]}

  ${(props) =>
    props.interactive &&
    css`
      cursor: pointer;
      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-xl);
      }
    `}
  
  ${(props) =>
    props.highlight &&
    css`
      border: 1px solid var(--color-accent);
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background-color: var(--color-accent);
      }
    `}
  
  ${(props) =>
    props.premium &&
    css`
      border: 1px solid var(--color-gold);
      background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(
          90deg,
          var(--color-gold-dark) 0%,
          var(--color-gold) 50%,
          var(--color-gold-light) 100%
        );
      }
    `}
  
  ${(props) => props.className && ""}
`;

const CardHeader = styled.div`
  padding: ${(props) => (props.noPadding ? "0" : "1.5rem 1.5rem 0.75rem")};
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${(props) =>
    props.bordered &&
    css`
      border-bottom: 1px solid rgba(75, 85, 99, 0.08);
      padding-bottom: 1rem;
      margin-bottom: 0.5rem;
    `}

  ${(props) =>
    props.center &&
    css`
      justify-content: center;
      text-align: center;
    `}
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);

  ${(props) =>
    props.premium &&
    css`
      color: var(--color-primary-dark);
      font-weight: 700;
      letter-spacing: -0.02em;
    `}
`;

const CardSubtitle = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const CardBody = styled.div`
  padding: ${(props) => (props.noPadding ? "0" : "1.5rem")};

  ${(props) =>
    props.dense &&
    css`
      padding: 1rem 1.5rem;
    `}
`;

const CardFooter = styled.div`
  padding: ${(props) => (props.noPadding ? "0" : "0.75rem 1.5rem 1.5rem")};

  ${(props) =>
    props.bordered &&
    css`
      border-top: 1px solid rgba(75, 85, 99, 0.08);
      padding-top: 1rem;
      margin-top: 0.5rem;
    `}

  ${(props) =>
    props.actions &&
    css`
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      align-items: center;
    `}
`;

const Card = ({
  children,
  header,
  headerTitle,
  headerSubtitle,
  footer,
  interactive = false,
  highlight = false,
  premium = false,
  headerBordered = false,
  footerBordered = false,
  noPadding = false,
  elevation = "medium",
  className,
  ...rest
}) => {
  return (
    <CardContainer
      interactive={interactive}
      highlight={highlight}
      premium={premium}
      elevation={elevation}
      className={className}
      {...rest}
    >
      {(header || headerTitle) && (
        <CardHeader bordered={headerBordered} noPadding={noPadding}>
          {header || (
            <>
              <CardTitle premium={premium}>{headerTitle}</CardTitle>
              {headerSubtitle && <CardSubtitle>{headerSubtitle}</CardSubtitle>}
            </>
          )}
        </CardHeader>
      )}

      <CardBody noPadding={noPadding}>{children}</CardBody>

      {footer && (
        <CardFooter
          bordered={footerBordered}
          noPadding={noPadding}
          actions={typeof footer === "object"}
        >
          {footer}
        </CardFooter>
      )}
    </CardContainer>
  );
};

export default Card;
