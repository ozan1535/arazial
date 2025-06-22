import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async"; // <-- Import Helmet
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import {
  hasUserCompletedDeposit,
  createDeposit,
  getDepositStatus,
} from "../services/depositService";
import {
  sendNewBidNotification,
  sendNewOfferNotification,
} from "../services/smsService";
import CountdownTimer from "../components/CountdownTimer";
import ModernDateDisplay from "../components/ModernDateDisplay";
import Button from "../components/ui/Button";
import { PAYMENT_CONFIG } from "../config/payment";

// Add at the top of the file:
const PAYMENT_PROXY_URL = "https://srv759491.hstgr.cloud:4000/api/pay-request";
const PAYMENT_PROXY_KEY = "arazialcom123123";

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 0;
    width: 100%;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.2s ease;

  @media (max-width: 768px) {
    margin-left: 1rem;
  }

  &:hover {
    color: var(--color-primary-dark);
  }
`;

const AuctionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 0.75rem;

  @media (min-width: 1024px) {
    grid-template-columns: 7fr 3fr;
  }

  @media (max-width: 1023px) {
    display: flex;
    flex-direction: column;
    margin-top: 0;
    gap: 0;
  }
`;

const AuctionTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.2;
  margin: 0.25rem 0 0.25rem 0;

  @media (max-width: 768px) {
    font-size: 1.125rem;
    margin-top: 0;
    margin-bottom: 0.75rem;
  }
`;

const AuctionLocation = styled.div`
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
  background-color: rgba(var(--color-primary-rgb), 0.05);
  padding: 0.35rem 0.75rem;
  border-radius: var(--border-radius-full);

  svg {
    color: var(--color-primary);
    width: 14px;
    height: 14px;
  }
`;

const AuctionMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MetaLabel = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const MetaValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
`;

const AuctionStatus = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  gap: 0.5rem;
  margin-bottom: 0;
  background-color: ${(props) =>
    props.status === "active"
      ? "rgba(5, 150, 105, 0.1)"
      : props.status === "upcoming"
      ? "rgba(37, 99, 235, 0.1)"
      : "rgba(107, 114, 128, 0.1)"};
  color: ${(props) =>
    props.status === "active"
      ? "rgb(5, 150, 105)"
      : props.status === "upcoming"
      ? "rgb(37, 99, 235)"
      : "rgb(107, 114, 128)"};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const TimerWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: rgba(var(--color-primary-rgb), 0.05);
  border-radius: var(--border-radius-lg);
  margin-right: auto;

  @media (max-width: 768px) {
    margin-right: 0;
    width: 100%;
    justify-content: center;
    padding: 0.5rem 1rem;
  }
`;

const TimerLabel = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-right: 0.75rem;
  font-weight: 500;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &:last-child {
    gap: 0;
  }

  @media (max-width: 768px) {
    & > .gallery-card {
      order: 1;
    }

    & > ${MobileBidCard} {
      order: 2;
    }

    & > ${MobileHeader} {
      order: 3;
    }

    & > .details-card,
    & > .description-card {
      order: 4;
      margin-left: 1rem;
      margin-right: 1rem;
      border-radius: 8px;
    }

    & > .description-card {
      order: 5;
      margin-top: 1rem;
    }
  }
`;

const Card = styled.section`
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  margin-bottom: 1.5rem;
  overflow: hidden;

  @media (max-width: 768px) {
    &.gallery-card {
      border-radius: 0;
      margin: 0;
      width: 100%;
      box-shadow: none;
    }

    &.details-card {
      margin: 0;
      border-radius: 0;
      box-shadow: none;
      padding: 0;
    }
  }

  /* Special styling for the bid card on mobile */
  &.bid-card {
    margin-bottom: 0 !important;
    @media (max-width: 1023px) {
      position: static;
      z-index: 1;
      margin-bottom: 0;
      border-radius: 0;
    }
  }

  /* Remove bottom margin for the last card in a column */
  ${Column}:last-child &:last-child {
    margin-bottom: 0;
  }
`;

const CardHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-background);
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: var(--color-primary);
  }
`;

const CardContent = styled.div`
  padding: 1rem;
  padding-bottom: 0.5rem;

  .bid-card & {
    padding-bottom: 0 !important;
  }

  @media (max-width: 768px) {
    .details-card & {
      padding: 0.25rem;
    }
  }
`;

const PropertyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin: 0;
    padding: 0.25rem;
  }
`;

const PropertyItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

const PropertyLabel = styled.label`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  display: block;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const PropertyValue = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const HighlightedValue = styled(PropertyValue)`
  font-size: 1.125rem;
  color: var(--color-primary);
  font-weight: 600;
`;

const Description = styled.div`
  line-height: 1.7;
  color: var(--color-text);
  white-space: pre-line;
`;

// Add these new styled components for the main gallery
const MainGalleryContainer = styled.div`
  position: relative;
  width: 100%;

  @media (max-width: 768px) {
    margin: 0;
    width: 100%;
  }
`;

const MainImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  display: block;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  background-color: #f8f9fa;

  @media (max-width: 768px) {
    max-height: 240px;
    border-radius: 0;
    object-fit: cover;
    width: 100%;
  }
`;

const ImageGallery = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  overflow-x: auto;

  @media (max-width: 768px) {
    padding: 0.25rem 1rem 0;
    background-color: white;
    border-bottom: none;
    margin-bottom: 0;
  }

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 4px;
  }
`;

const ImageThumbnail = styled.div`
  width: 60px;
  height: 45px;
  border-radius: 4px;
  background-position: center;
  background-size: cover;
  cursor: pointer;
  border: 2px solid
    ${(props) => (props.isActive ? "var(--color-primary)" : "transparent")};
`;

const GalleryNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(props) => (props.direction === "left" ? "left: 1rem;" : "right: 1rem;")}
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Lightbox components
const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1500;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  visibility: ${(props) => (props.isVisible ? "visible" : "hidden")};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const LightboxImage = styled.img`
  max-width: 90%;
  max-height: 80vh;
  object-fit: contain;
`;

const LightboxControls = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
`;

const LightboxClose = styled.button`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const LightboxNav = styled.div`
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  transform: translateY(-50%);
`;

const LightboxNavButton = styled.button`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const LightboxThumbnails = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 1rem;
  max-width: 90%;
  margin-top: 1rem;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }
`;

const LightboxThumbnail = styled.div`
  width: 80px;
  height: 60px;
  background-position: center;
  background-size: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  border: 2px solid
    ${(props) => (props.isActive ? "var(--color-primary)" : "transparent")};
  opacity: ${(props) => (props.isActive ? 1 : 0.7)};

  &:hover {
    opacity: 1;
  }
`;

const BidContainer = styled.div`
  background: linear-gradient(
    to bottom,
    rgba(var(--color-primary-rgb), 0.05),
    white
  );
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
`;

const CurrentPrice = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const PriceLabel = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
`;

const PriceAmount = styled.div`
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.1;
`;

const MinimumIncrement = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
  text-align: center;
`;

const BidForm = styled.form`
  margin-top: 1.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: 1.125rem;
  text-align: center;
  font-weight: 600;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 1rem;
  }
`;

const BidButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: var(--color-border);
    cursor: not-allowed;
    transform: none;
  }
`;

const Error = styled.div`
  color: var(--color-error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(var(--color-error-rgb), 0.05);
  border-radius: var(--border-radius-md);
  border-left: 3px solid var(--color-error);
`;

const BidsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 !important;
  padding: 0 !important;

  & > *:last-child {
    margin-bottom: 0 !important;
  }
`;

const BidItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  background-color: var(--color-background);
  position: relative;

  &:nth-child(1) {
    background-color: rgba(255, 215, 0, 0.1);
    border-left: 3px solid gold;
  }

  &:nth-child(2) {
    background-color: rgba(192, 192, 192, 0.1);
    border-left: 3px solid silver;
  }

  &:nth-child(3) {
    background-color: rgba(205, 127, 50, 0.1);
    border-left: 3px solid #cd7f32;
  }
`;

const BidAmount = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);

  ${BidItem}:nth-child(1) & {
    color: var(--color-primary);
    font-size: 1.25rem;
  }

  ${BidItem}:nth-child(2) & {
    color: var(--color-primary-dark);
  }

  ${BidItem}:nth-child(3) & {
    color: var(--color-primary-dark);
  }
`;

const BidTime = styled.div`
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
`;

const ShowMoreButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem;
  margin-bottom: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 0.5rem;
  transition: background-color 0.2s ease;
  border-radius: var(--border-radius-md);

  &:hover {
    background-color: rgba(var(--color-primary-rgb), 0.05);
  }

  svg {
    width: 16px;
    height: 16px;
    margin-left: 0.5rem;
  }
`;

const EmptyBids = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    opacity: 0.4;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;

  svg {
    animation: spin 1.5s linear infinite;
    width: 40px;
    height: 40px;
    color: var(--color-primary);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 1rem;
  color: var(--color-text-secondary);
`;

// Icon components for better UI
const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TimerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const PropertyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BidsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const NoBidsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const LoadingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

// --- Add New Styled Components for Offer Section ---
const OfferInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    margin-bottom: 0;
    font-size: 0.875rem;
    height: 36px;
    width: 100%;
  }
`;

const OfferButton = styled(Button)`
  width: 100%;
  margin-top: 0.5rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-top: 0;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    min-height: 36px;
    width: 100%;
  }
`;

const BuyNowButton = styled(Button)`
  width: 100%;
  margin-top: 0.5rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-top: 0;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    min-height: 36px;
    width: 100%;
  }
`;

const OfferStatusMessage = styled.div`
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  margin-top: 1rem;
  text-align: center;
  line-height: 1.5;
  background-color: ${(props) =>
    props.status === "pending"
      ? "rgba(251, 191, 36, 0.1)"
      : props.status === "accepted"
      ? "rgba(16, 185, 129, 0.1)"
      : props.status === "rejected"
      ? "rgba(239, 68, 68, 0.1)"
      : "var(--color-background)"};
  color: ${(props) =>
    props.status === "pending"
      ? "#D97706"
      : props.status === "accepted"
      ? "#059669"
      : props.status === "rejected"
      ? "#DC2626"
      : "var(--color-text-secondary)"};

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
    border: 1px solid
      ${(props) =>
        props.status === "pending"
          ? "rgba(251, 191, 36, 0.3)"
          : props.status === "accepted"
          ? "rgba(16, 185, 129, 0.3)"
          : props.status === "rejected"
          ? "rgba(239, 68, 68, 0.3)"
          : "var(--color-border)"};
  }
`;

// --- Add New Icon Component ---
const OfferIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="20"
    height="20"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v12m-3-2.818.879.536c.445.272.99.272 1.435 0l.879-.536M7.5 14.25a3 3 0 0 0-3 3h15a3 3 0 0 0-3-3m-10.5-1.5a3 3 0 0 1 3-3h7.5a3 3 0 0 1 3 3"
    />
  </svg>
);

// --- Loading Spinner Component (Add this back) ---
const LoadingSpinner = ({ message }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
      flexDirection: "column",
      gap: "1rem",
    }}
  >
    <LoadingIcon />
    <p>{message || "Yükleniyor..."}</p>
  </div>
);

// Add this to the icon components section
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Create a new integrated header for the main card
const IntegratedHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(
      90deg,
      var(--color-primary),
      var(--color-primary-light)
    );
  }
`;

// Create a minimal header for the content cards
const MinimalHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);
`;

// Add this title styles for minimal header
const MinimalTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.2;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

// Add styled components for mobile/desktop headers
const DesktopHeader = styled.div`
  @media (max-width: 767px) {
    display: none;
  }
`;

const MobileHeader = styled.div`
  margin-bottom: 0.75rem;
  margin-top: 0;
  padding: 0 1rem;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileBidCard = styled.div`
  margin-bottom: 0;
  background-color: white;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  width: 100%;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const DesktopBidCard = styled.div`
  @media (max-width: 1023px) {
    display: none;
  }
`;

const BidCardHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-background);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/* const ShareButton = styled.button`
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  font-size: 0.8rem;
  font-weight: 600;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba(17, 24, 39, 0.9);
    transform: scale(1.05);
  }
`; */

/* 

<ShareButton onClick={handleShare} title="İlanı paylaş">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 100 4.186 2.25 2.25 0 000-4.186zM12 5.25v.01M12 18.75v.01M16.883 10.907a2.25 2.25 0 100 4.186 2.25 2.25 0 000-4.186zM6.117 6.117a2.25 2.25 0 100 4.186 2.25 2.25 0 000-4.186zM12 12.75a2.25 2.25 0 100-4.186 2.25 2.25 0 000 4.186z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.883 6.117a2.25 2.25 0 100 4.186 2.25 2.25 0 000-4.186zM6.117 17.883a2.25 2.25 0 100-4.186 2.25 2.25 0 000 4.186z"
              />
            </svg>
            Paylaş
          </ShareButton>


*/

// --- Add these helper functions after the existing utility functions ---

// Helper function to format number with thousand separators
const formatNumberDisplay = (value) => {
  if (!value) return "";
  // Remove any non-digit characters first
  const cleanValue = value.toString().replace(/\D/g, "");
  if (!cleanValue) return "";
  // Format with dots as thousand separators
  return parseInt(cleanValue).toLocaleString("tr-TR");
};

// Helper function to parse formatted number back to plain number
const parseFormattedNumber = (value) => {
  if (!value) return "";
  // Remove dots and any non-digit characters except the value itself
  return value.toString().replace(/\./g, "").replace(/\D/g, "");
};

// Styled component for formatted currency input
const CurrencyInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  right: 1rem;
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
`;

const IncrementCurrencySymbol = styled.span`
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 500;
  pointer-events: none;
  z-index: 1;

  @media (max-width: 768px) {
    right: 52px;
  }
`;

// Styled components for increment/decrement input
const IncrementInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  overflow: visible;
  min-height: 48px;

  &:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  }

  @media (max-width: 768px) {
    min-height: 40px;
  }
`;

const IncrementButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e7eb;
  border: 1px solid #d1d5db;
  width: 50px;
  min-width: 50px;
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  align-self: stretch;
  z-index: 10;

  &:hover:not(:disabled) {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  &:active:not(:disabled) {
    background-color: #2563eb;
    border-color: #2563eb;
  }

  &:disabled {
    color: #9ca3af;
    cursor: not-allowed;
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }

  @media (max-width: 768px) {
    width: 44px;
    min-width: 44px;
    font-size: 1.25rem;
  }
`;

const IncrementInput = styled.input`
  flex: 1;
  padding: 0.875rem 80px 0.875rem 1rem;
  border: none;
  font-size: 1.125rem;
  text-align: center;
  font-weight: 600;
  background: transparent;
  align-self: stretch;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--color-text-secondary);
    font-weight: 400;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 70px 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
`;

const FormattedInput = styled.input`
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: 1.125rem;
  text-align: left;
  font-weight: 600;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 2.5rem 0.5rem 0.75rem;
    font-size: 0.875rem;
    height: 36px;
  }
`;

const BidAmountInput = styled(FormattedInput)`
  text-align: center;
`;

// Function to calculate dynamic step amount based on current value
const getStepAmount = (currentValue) => {
  const value = parseInt(currentValue) || 0;

  if (value < 10000) {
    return 500; // 0-10,000: increment by 500
  } else if (value < 100000) {
    return 5000; // 10,000-100,000: increment by 5,000
  } else if (value < 1000000) {
    return 25000; // 100,000-1,000,000: increment by 25,000
  } else {
    return 50000; // 1,000,000+: increment by 50,000
  }
};

// Custom increment/decrement currency input component for offers
const IncrementCurrencyInput = ({
  value,
  onChange,
  placeholder,
  disabled,
  style,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // Update display value when value prop changes
  useEffect(() => {
    if (value) {
      setDisplayValue(formatNumberDisplay(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleIncrement = () => {
    if (disabled) return;

    const currentValue = parseInt(value) || 0;
    const stepAmount = getStepAmount(currentValue);
    const newValue = currentValue + stepAmount;

    onChange({ target: { value: newValue.toString() } });
  };

  const handleDecrement = () => {
    if (disabled) return;

    const currentValue = parseInt(value) || 0;
    const stepAmount = getStepAmount(currentValue);
    const newValue = Math.max(0, currentValue - stepAmount);

    onChange({ target: { value: newValue.toString() } });
  };

  return (
    <IncrementInputContainer style={style} className={className}>
      <IncrementButton
        type="button"
        onClick={handleDecrement}
        disabled={disabled || parseInt(value) <= 0}
      >
        −
      </IncrementButton>
      <IncrementInput
        type="text"
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly
      />
      <IncrementCurrencySymbol>₺</IncrementCurrencySymbol>
      <IncrementButton
        type="button"
        onClick={handleIncrement}
        disabled={disabled}
      >
        +
      </IncrementButton>
    </IncrementInputContainer>
  );
};

// Custom formatted currency input component (original for bids)
const CurrencyInput = ({
  value,
  onChange,
  placeholder,
  disabled,
  style,
  className,
  isBidInput = false,
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // Update display value when value prop changes
  useEffect(() => {
    if (value) {
      setDisplayValue(formatNumberDisplay(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    // Allow empty input
    if (inputValue === "") {
      setDisplayValue("");
      onChange({ target: { value: "" } });
      return;
    }

    // Parse and format the input
    const cleanValue = parseFormattedNumber(inputValue);
    if (cleanValue) {
      const formattedDisplay = formatNumberDisplay(cleanValue);
      setDisplayValue(formattedDisplay);
      // Pass the clean number value to parent
      onChange({ target: { value: cleanValue } });
    }
  };

  const InputComponent = isBidInput ? BidAmountInput : FormattedInput;

  return (
    <CurrencyInputContainer style={style} className={className}>
      <InputComponent
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      <CurrencySymbol>₺</CurrencySymbol>
    </CurrencyInputContainer>
  );
};

const StartTimeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  gap: 0.5rem;
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.1) 0%,
    rgba(59, 130, 246, 0.15) 100%
  );
  color: rgb(37, 99, 235);
  border: 1px solid rgba(37, 99, 235, 0.2);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    background: linear-gradient(
      135deg,
      rgba(37, 99, 235, 0.15) 0%,
      rgba(59, 130, 246, 0.2) 100%
    );
  }

  svg {
    width: 16px;
    height: 16px;
    color: rgb(37, 99, 235);
  }
`;

const getStatusIcon = (status) => {
  // Using same icons for simplicity, could be customized for offers
  switch (status) {
    case "active":
      return <TimerIcon />;
    case "upcoming":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          width="16"
          height="16"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    case "ended":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          width="16"
          height="16"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    default:
      return null;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "active":
      return "Aktif";
    case "ended":
      return "Sona Erdi";
    default:
      return "";
  }
};

// Add BidCard component
const BidCard = ({
  isOfferListing,
  currentStatus,
  user,
  authLoading,
  getMinimumBidAmount,
  bidError,
  submitLoading,
  handleSubmitBid,
  formatPrice,
  bids,
  isExpanded,
  setIsExpanded,
  formatDate,
  userActiveOffer,
  showRejectedMessage,
  offerAmount,
  setOfferAmount,
  offerError,
  handleSubmitOffer,
  showOfferForm,
  auction,
  handleTimerComplete,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showAuthLoading, setShowAuthLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  // Handle share functionality
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = auction?.title || "Arazi İlanı";

    // Use the appropriate price based on listing type
    let priceText;
    if (isOfferListing) {
      priceText = `${formatPrice(
        auction?.price ||
          auction?.starting_price ||
          auction?.startingPrice ||
          auction?.final_price ||
          auction?.finalPrice ||
          0
      )} fiyatıyla!`;
    } else {
      priceText = `${formatPrice(getMinimumBidAmount())} başlangıç fiyatıyla!`;
    }

    const shareText = `${shareTitle} - ${priceText}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareMessage("");
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setShareMessage("Link panoya kopyalandı!");
        setTimeout(() => setShareMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      setShareMessage("");
    }
  };

  // Add delay before showing auth loading message
  useEffect(() => {
    let timer;
    if (authLoading) {
      timer = setTimeout(() => {
        setShowAuthLoading(true);
      }, 750); // Only show loading message after 750ms
    } else {
      setShowAuthLoading(false);
    }

    return () => clearTimeout(timer);
  }, [authLoading]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: isMobile ? "8px 8px 0 0" : "8px",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* <BidCardHeader>
        {isOfferListing && (
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "var(--color-text)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: 0,
              paddingRight: "0.5rem",
            }}
          >
            <OfferIcon /> Teklif Yap
          </h2>
        )}
        {(currentStatus === "active" || currentStatus === "upcoming") && (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleShare();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(var(--color-primary-rgb), 0.1)",
              color: "var(--color-primary)",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Paylaş
          </button>
        )}
      </BidCardHeader> */}

      <div
        style={{
          padding: isMobile ? "0.6rem 1rem" : "1rem 1rem 0 1rem",
          display: "flex",
          flexDirection: "column",
          paddingBottom: 0,
        }}
      >
        {/* AUCTION BIDDING UI */}
        {!isOfferListing && (
          <>
            {/* Bid Form for Active Auctions */}
            {currentStatus === "active" && (
              <form
                onSubmit={handleSubmitBid}
               /*  style={{ marginBottom: isMobile ? "0.5rem" : "1rem" }} */
              >
                {!user && !authLoading && (
                  <p
                    style={{
                      textAlign: "center",
                      marginBottom: isMobile ? "0.5rem" : "1rem",
                    }}
                  >
                    Teklif vermek için <a href="/login">giriş yapın</a>.
                  </p>
                )}
                {user && (
                  <>
                    <div
                      style={{
                        backgroundColor: "rgba(var(--color-primary-rgb), 0.05)",
                        borderRadius: "var(--border-radius-md)",
                        border: "1px solid rgba(var(--color-primary-rgb), 0.1)",
                        marginBottom: "0.75rem",
                        overflow: "hidden",
                      }}
                    >
                      <OfferButton
                        type="submit"
                        disabled={submitLoading || authLoading}
                        style={{ width: "100%", marginTop: 0 }}
                      >
                        {submitLoading ? <LoadingIcon /> : "Teklif Ver"}
                      </OfferButton>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          padding: "1rem",
                        }}
                      >
                        {!isOfferListing && (
                          <>
                            {/* Bid Form for Active Auctions */}
                            {currentStatus === "active" && (
                              <form
                                onSubmit={handleSubmitBid}
                               /*  style={{
                                  marginBottom: isMobile ? "0.5rem" : "1rem",
                                }} */
                              >
                                {!user && !authLoading && (
                                  <p
                                    style={{
                                      textAlign: "center",
                                      marginBottom: isMobile
                                        ? "0.5rem"
                                        : "1rem",
                                    }}
                                  >
                                    Teklif vermek için{" "}
                                    <a href="/login">giriş yapın</a>.
                                  </p>
                                )}
                                {user && (
                                  <>
                                    <div
                                      style={{
                                        backgroundColor:
                                          "rgba(var(--color-primary-rgb), 0.05)",
                                        borderRadius: "var(--border-radius-md)",
                                        border:
                                          "1px solid rgba(var(--color-primary-rgb), 0.1)",
                                        marginBottom: "0.75rem",
                                        overflow: "hidden",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "0.5rem",
                                          alignItems: "center",
                                          padding: "0.75rem 1rem 0.5rem 1rem",
                                          fontSize: "0.75rem",
                                          position: "relative",
                                        }}
                                      >
                                        <div
                                          style={{
                                            position: "absolute",
                                            left: 0,
                                            top: "10px",
                                            flex: 1,
                                            textAlign: "left",
                                          }}
                                        >
                                          Güncel Teklif:{" "}
                                          <span style={{ fontWeight: "bold" }}>
                                            {formatPrice(getMinimumBidAmount())}
                                          </span>
                                        </div>
                                        <div
                                          style={{
                                            position: "absolute",
                                            right: 0,
                                            top: "10px",
                                            textAlign: "left",

                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          Teminat Tutarı:{" "}
                                          <span style={{ fontWeight: "bold" }}>
                                            {formatPrice(
                                              auction.deposit_amount || 0
                                            )}
                                          </span>
                                        </div>
                                      </div>

                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "0.5rem",
                                          alignItems: "center",
                                          padding: "0.75rem 1rem 0.5rem 1rem",
                                        }}
                                      >
                                        <div
                                          style={{
                                            flex: 1,
                                            textAlign: "left",
                                          }}
                                        >
                                          Minimum Artış:{" "}
                                          <span style={{ fontWeight: "bold" }}>
                                            {formatPrice(
                                              auction.minIncrement ||
                                                auction.min_increment
                                            )}
                                          </span>
                                        </div>
                                      </div>

                                      {/*  <div
                                        style={{
                                          display: "flex",
                                          gap: "0.5rem",
                                          alignItems: "center",
                                          borderTop:
                                            "1px dashed rgba(var(--color-primary-rgb), 0.15)",
                                          padding: "0.5rem 1rem 0.75rem 1rem",
                                          justifyContent: "space-between",
                                        }}
                                      > */}
                                      {/*  <div
                                          style={{
                                            textAlign: "left",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          Teminat Tutarı:{" "}
                                          <span style={{ fontWeight: "bold" }}>
                                            {formatPrice(
                                              auction.deposit_amount || 0
                                            )}
                                          </span>
                                        </div> */}

                                      {/* <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleShare();
                                          }}
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            backgroundColor:
                                              "rgba(var(--color-primary-rgb), 0.1)",
                                            color: "var(--color-primary)",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "0.5rem 0.75rem",
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <circle
                                              cx="18"
                                              cy="5"
                                              r="3"
                                            ></circle>
                                            <circle
                                              cx="6"
                                              cy="12"
                                              r="3"
                                            ></circle>
                                            <circle
                                              cx="18"
                                              cy="19"
                                              r="3"
                                            ></circle>
                                            <line
                                              x1="8.59"
                                              y1="13.51"
                                              x2="15.42"
                                              y2="17.49"
                                            ></line>
                                            <line
                                              x1="15.41"
                                              y1="6.51"
                                              x2="8.59"
                                              y2="10.49"
                                            ></line>
                                          </svg>
                                          Paylaş
                                        </button> */}
                                      {/* </div> */}
                                    </div>
                                    {bidError && (
                                      <p
                                        style={{
                                          color: "red",
                                          fontSize: "0.875rem",
                                          marginTop: "0.5rem",
                                          marginBottom: "0",
                                        }}
                                      >
                                        {bidError}
                                      </p>
                                    )}
                                  </>
                                )}
                              </form>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* <OfferButton
                      type="submit"
                      disabled={submitLoading || authLoading}
                      style={{ width: "100%", marginTop: 0 }}
                    >
                      {submitLoading ? <LoadingIcon /> : "Teklif Ver"}
                    </OfferButton> */}
                    {shareMessage && (
                      <div
                        style={{
                          textAlign: "center",
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          color: "rgb(5, 150, 105)",
                          padding: "0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                          marginTop: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {shareMessage}
                      </div>
                    )}
                    {bidError && (
                      <p
                        style={{
                          color: "red",
                          fontSize: "0.875rem",
                          marginTop: "0.5rem",
                          marginBottom: "0",
                        }}
                      >
                        {bidError}
                      </p>
                    )}
                  </>
                )}
              </form>
            )}
            {/* Countdown Timer for active auctions */}
            {currentStatus === "active" && (
              <div
                style={{
                  //marginTop: "1.5rem",
                  textAlign: "center",
                  padding: "0 1.5rem",
                  background:
                    "linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.03) 0%, rgba(var(--color-primary-rgb), 0.08) 100%)",
                  borderRadius: "1rem",
                  border: "1px solid rgba(var(--color-primary-rgb), 0.1)",
                  boxShadow: "0 4px 12px rgba(var(--color-primary-rgb), 0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "var(--color-text)",
                      margin: 0,
                    }}
                  >
                    ⏰ İhale bitimine kalan süre:
                  </div>
                  <CountdownTimer
                    endTime={auction.end_time}
                    compact={false}
                    onComplete={handleTimerComplete}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                  className="mobile-layout"
                >
                  {auction.end_time && (
                    <StartTimeBadge>
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
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                      </svg>
                      <span className="date-label">Bitiş Tarihi:</span>{" "}
                      <ModernDateDisplay
                        date={auction.end_time}
                        compact={true}
                        showIcon={false}
                      />
                    </StartTimeBadge>
                  )}
                </div>
              </div>
            )}

            {/* Messages for non-active auctions */}
            {auction.listing_type === "auction" &&
              currentStatus !== "active" && (
                <>
                  {/* Price and Deposit Info for non-active auctions */}
                  <div
                    style={{
                      backgroundColor: "rgba(var(--color-primary-rgb), 0.05)",
                      borderRadius: "var(--border-radius-md)",
                      border: "1px solid rgba(var(--color-primary-rgb), 0.1)",
                      marginBottom: "1rem",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "0.875rem",
                          }}
                        >
                          {currentStatus === "active"
                            ? "Güncel Teklif:"
                            : "Başlangıç Fiyatı:"}
                        </span>
                        <strong
                          style={{
                            fontSize: "1.125rem",
                            color: "var(--color-text)",
                          }}
                        >
                          {formatPrice(getMinimumBidAmount())}
                        </strong>
                      </div>
                      {auction.minIncrement > 0 ||
                        (auction.min_increment > 0 &&
                          auction.listing_type === "auction" && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  color: "var(--color-text-secondary)",
                                  fontSize: "0.875rem",
                                }}
                              >
                                Minimum Artış:
                              </span>
                              <strong
                                style={{
                                  fontSize: "1.125rem",
                                  color: "var(--color-text)",
                                }}
                              >
                                {formatPrice(
                                  auction.minIncrement || auction.min_increment
                                )}
                              </strong>
                            </div>
                          ))}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "0.875rem",
                          }}
                        >
                          Teminat Tutarı:
                        </span>
                        <strong
                          style={{
                            fontSize: "1.125rem",
                            color: "var(--color-text)",
                          }}
                        >
                          {formatPrice(auction.deposit_amount || 0)}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="mobile-layout">
                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <AuctionStatus status={currentStatus}>
                        {getStatusIcon(currentStatus)}
                        {getStatusText(currentStatus)}
                      </AuctionStatus>

                      {auction.listing_type === "auction" &&
                        (currentStatus === "active"
                          ? auction.end_time && (
                              <StartTimeBadge>
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
                                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                  />
                                </svg>
                                <span className="date-label">
                                  Bitiş Tarihi:
                                </span>{" "}
                                <ModernDateDisplay
                                  date={auction.end_time}
                                  compact={true}
                                  showIcon={false}
                                />
                              </StartTimeBadge>
                            )
                          : auction.start_time && (
                              <StartTimeBadge>
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
                                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                  />
                                </svg>
                                <span className="date-label">
                                  Başlangıç Tarihi:
                                </span>{" "}
                                <ModernDateDisplay
                                  date={auction.start_time}
                                  compact={true}
                                  showIcon={false}
                                />
                              </StartTimeBadge>
                            ))}
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div
                    style={{
                      marginTop: "0",
                      textAlign: "center",
                      padding: "1.5rem",
                      background:
                        "linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.03) 0%, rgba(var(--color-primary-rgb), 0.08) 100%)",
                      borderRadius: "1rem",
                      border: "1px solid rgba(var(--color-primary-rgb), 0.1)",
                      boxShadow:
                        "0 4px 12px rgba(var(--color-primary-rgb), 0.08)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "var(--color-text)",
                          margin: 0,
                        }}
                      >
                        {currentStatus === "active"
                          ? "⏰ İhale bitimine kalan süre:"
                          : "📅 İhale başlamasına kalan süre:"}
                      </div>
                      <CountdownTimer
                        endTime={
                          currentStatus === "active"
                            ? auction.end_time
                            : auction.start_time
                        }
                        compact={false}
                        onComplete={handleTimerComplete}
                      />
                    </div>
                  </div>
                </>
              )}
          </>
        )}
        {(currentStatus === "active" || currentStatus === "upcoming") && (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleShare();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(var(--color-primary-rgb), 0.1)",
              color: "var(--color-primary)",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              margin: "1rem 0",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Paylaş
          </button>
        )}
      </div>
    </div>
  );
};

// Add new styled components for payment modal
const PaymentModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  visibility: ${(props) => (props.isVisible ? "visible" : "hidden")};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  @media (max-width: 768px) {
    align-items: flex-start;
    padding: 0;
  }
`;

const PaymentModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  max-width: 90%;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  padding: 0;
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }
`;

const PaymentModalHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-background);
  border-radius: 8px 8px 0 0;
  
  @media (max-width: 768px) {
    border-radius: 0;
    padding: 1rem;
    flex-shrink: 0;
  }
`;

const PaymentModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const PaymentModalBody = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
`;

const PaymentModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  background-color: var(--color-background);
  border-radius: 0 0 8px 8px;
  
  @media (max-width: 768px) {
    border-radius: 0;
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    flex-shrink: 0;
    gap: 0.5rem;
  }
`;

const PaymentWarning = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: rgba(251, 191, 36, 0.1);
  border-left: 4px solid #f59e0b;
  border-radius: 4px;
  color: #92400e;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    padding: 0.75rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    p {
      font-size: 0.875rem;
      line-height: 1.4;
    }
  }
`;

const PaymentInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const PaymentAmount = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  background-color: rgba(var(--color-primary-rgb), 0.05);
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    padding: 0.75rem;
  }
`;

const PaymentAmountLabel = styled.span`
  font-weight: 500;
  color: var(--color-text);
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const PaymentAmountValue = styled.span`
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-primary);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const PaymentMessage = styled.p`
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
  font-size: 0.875rem;
  background-color: ${(props) =>
    props.type === "success"
      ? "rgba(16, 185, 129, 0.1)"
      : props.type === "error"
      ? "rgba(239, 68, 68, 0.1)"
      : "transparent"};
  color: ${(props) =>
    props.type === "success"
      ? "rgb(5, 150, 105)"
      : props.type === "error"
      ? "rgb(220, 38, 38)"
      : "inherit"};
`;

const AgreementSection = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: #f9f9f9;
  
  @media (max-width: 768px) {
    margin: 1rem 0;
    padding: 0.75rem;
  }
`;

const AgreementText = styled.div`
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-text);
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;

  h4 {
    margin: 0.75rem 0 0.5rem 0;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-primary);
  }

  p {
    margin: 0.5rem 0;
  }

  strong {
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    max-height: 150px;
    font-size: 0.7rem;
    
    h4 {
      font-size: 0.75rem;
    }
    
    p {
      margin: 0.4rem 0;
    }
  }
`;

const AgreementCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  input[type="checkbox"] {
    margin-top: 0.25rem;
    min-width: 16px;
    height: 16px;
    cursor: pointer;
  }

  label {
    font-size: 0.875rem;
    cursor: pointer;
    color: var(--color-text);
    line-height: 1.4;
  }
  
  @media (max-width: 768px) {
    label {
      font-size: 0.8rem;
    }
  }
`;

const AuctionDetail = () => {
  // Version check to help with debugging cache issues
  const CODE_VERSION = "2024-12-20-v2";
  console.log("AuctionDetail code version:", CODE_VERSION);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, profile, isAuthenticated } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // --- New State for Offers ---
  const [userOffers, setUserOffers] = useState([]);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerError, setOfferError] = useState(null);

  // Initialize offer amount with listing price for offer-type listings
  useEffect(() => {
    if (auction && auction.listing_type === "offer" && !offerAmount) {
      const listingPrice =
        auction?.price ||
        auction?.starting_price ||
        auction?.startingPrice ||
        0;
      if (listingPrice > 0) {
        setOfferAmount(listingPrice.toString());
      }
    }
  }, [auction, offerAmount]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- Add state for current URL ---
  const [currentUrl, setCurrentUrl] = useState("");

  // --- Add new state for payment handling ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasDeposit, setHasDeposit] = useState(false);
  const [hasPendingDeposit, setHasPendingDeposit] = useState(false);
  const [depositInfo, setDepositInfo] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentMessageType, setPaymentMessageType] = useState("");
  const [actionType, setActionType] = useState("bid"); // 'bid' or 'offer'
  const [paymentStep, setPaymentStep] = useState("info"); // 'info' or 'payment'

  // --- Add state for card info ---
  const [cardNumber, setCardNumber] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardOwner, setCardOwner] = useState("");

  // --- Add state for agreement checkbox ---
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  // Enhanced card number formatting and validation
  const handleCardNumberChange = (e) => {
    const inputValue = e.target.value;
    // Remove all non-digits
    let value = inputValue.replace(/\D/g, "");
    // Limit to 19 digits max
    value = value.substring(0, 19);
    // Format with spaces every 4 digits
    const formatted = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);

    // Clear previous payment errors when user types
    if (paymentMessage) {
      setPaymentMessage("");
      setPaymentMessageType("");
    }
  };

  // Enhanced CVV validation
  const handleCvvChange = (e) => {
    const inputValue = e.target.value;
    // Only allow 3 digits
    const value = inputValue.replace(/\D/g, "").substring(0, 3);
    setCardCvv(value);

    // Clear previous payment errors when user types
    if (paymentMessage) {
      setPaymentMessage("");
      setPaymentMessageType("");
    }
  };

  // Enhanced card owner validation
  const handleCardOwnerChange = (e) => {
    const inputValue = e.target.value;
    // Only allow letters, spaces, and common name characters
    const value = inputValue.replace(/[^a-zA-ZçğıöşüÇĞIİÖŞÜ\s]/g, "");
    setCardOwner(value);

    // Clear previous payment errors when user types
    if (paymentMessage) {
      setPaymentMessage("");
      setPaymentMessageType("");
    }
  };

  // Function to handle expiry date formatting with enhanced validation
  const handleExpiryChange = (e) => {
    const inputValue = e.target.value;
    let value = inputValue.replace(/\D/g, ""); // Remove non-digits

    // Handle deletion - if user deletes the slash, remove the last digit too
    if (
      inputValue.length < cardExpiry.length &&
      cardExpiry.includes("/") &&
      !inputValue.includes("/")
    ) {
      value = value.slice(0, -1);
    }

    // Format with slash
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }

    // Limit to 5 characters max (MM/YY)
    if (value.length <= 5) {
      setCardExpiry(value);

      // Update individual month/year states for backend compatibility
      const digits = value.replace(/\D/g, "");
      if (digits.length >= 2) {
        const month = digits.substring(0, 2);
        const monthNum = parseInt(month, 10);
        // Validate month range
        if (monthNum >= 1 && monthNum <= 12) {
          setCardMonth(month);
        } else {
          setCardMonth("");
          if (monthNum > 12) {
            setPaymentMessage("Geçersiz ay. Ay 01-12 arasında olmalıdır.");
            setPaymentMessageType("error");
          }
        }
      } else if (digits.length === 1) {
        setCardMonth(digits);
      } else {
        setCardMonth(""); // Only clear if completely empty
      }

      if (digits.length >= 4) {
        const year = digits.substring(2, 4);
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(digits.substring(0, 2), 10);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        // Check if date is in the future
        if (
          yearNum < currentYear ||
          (yearNum === currentYear && monthNum < currentMonth)
        ) {
          setPaymentMessage("Kartınızın son kullanma tarihi geçmiş.");
          setPaymentMessageType("error");
          setCardYear("");
        } else {
          setCardYear(year);
          // Clear error if date is valid
          if (paymentMessage && paymentMessage.includes("son kullanma")) {
            setPaymentMessage("");
            setPaymentMessageType("");
          }
        }
      } else if (digits.length === 3) {
        setCardYear(digits.substring(2, 3));
      } else {
        setCardYear("");
      }
    }

    // Clear previous payment errors when user types (except date-specific ones)
    if (
      paymentMessage &&
      !paymentMessage.includes("ay") &&
      !paymentMessage.includes("son kullanma")
    ) {
      setPaymentMessage("");
      setPaymentMessageType("");
    }
  };

  useEffect(() => {
    // Set the current URL when the component mounts
    setCurrentUrl(window.location.href);
  }, []);

  // Debug auth state for AuctionDetail
  useEffect(() => {
    console.log("[AuctionDetail] Auth state:", {
      userId: user?.id,
      isAuthenticated,
      authLoading,
    });
  }, [user, isAuthenticated, authLoading]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setBidError(null);
    setOfferError(null);
    setUserOffers([]);

    try {
      // 1. Fetch Auction Details
      const { data: auctionData, error: auctionError } = await supabase
        .from("auctions")
        .select(
          `
          *,
          profiles (
            full_name,
            avatar_url
          )
        `
        )
        .eq("id", id)
        .single();

      if (auctionError || !auctionData) {
        setError(auctionError?.message || "İlan bulunamadı.");
        return;
      }

      console.log("AUCTION DATA FETCHED:", {
        id: auctionData.id,
        title: auctionData.title,
        price: auctionData.price,
        hasPrice: !!auctionData.price,
        listingType: auctionData.listing_type,
      });

      setAuction(auctionData);

      // 2. Fetch Bids OR Offers based on type
      if (auctionData.listing_type === "auction") {
        const { data, error } = await supabase
          .from("bids")
          .select("*, profiles ( full_name, avatar_url )")
          .eq("auction_id", auctionData.id)
          .order("amount", { ascending: false });

        if (error) {
          console.error("Error refreshing bids:", error);
          return;
        }
        setBids(data || []);
        setIsExpanded(false);
      } else if (auctionData.listing_type === "offer") {
        // Fetch user's offers for THIS listing if logged in
        if (user?.id) {
          const { data: offersData, error: offersError } = await supabase
            .from("offers")
            .select("*")
            .eq("auction_id", id)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (offersError) {
            console.error("Error fetching user's offers:", offersError);
          } else {
            setUserOffers(offersData || []);
          }
        } else {
          // Not logged in, cannot fetch or make offers
          setUserOffers([]);
        }
      }

      // 3. Check if user has already made a deposit for this auction
      if (user?.id) {
        const depositStatus = await getDepositStatus(id, user.id);
        setHasDeposit(depositStatus.hasCompleted);
        setHasPendingDeposit(depositStatus.hasPending);
        setDepositInfo(depositStatus.deposit);
      } else {
        setHasDeposit(false);
        setHasPendingDeposit(false);
        setDepositInfo(null);
      }
    } catch (err) {
      console.error("Error fetching auction details:", err);
      setError(err.message || "İlan detayları yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data when app becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab became visible, refreshing auction details...");
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchData]);

  const refreshBids = async () => {
    if (!auction || auction.listing_type !== "auction") return;
    try {
      const { data, error } = await supabase
        .from("bids")
        .select("*, profiles ( full_name, avatar_url )")
        .eq("auction_id", auction.id)
        .order("amount", { ascending: false });
      if (error) {
        console.error("Error refreshing bids:", error);
        return;
      }
      setBids(data || []);
      setIsExpanded(false);
    } catch (error) {
      console.error("Error refreshing bids:", error);
      return;
    }
  };

  const handleSubmitBid = async (e) => {
    console.log("--- Executing handleSubmitBid ---");
    e.preventDefault();
    if (!isAuthenticated) {
      setBidError("Teklif vermek için giriş yapmalısınız.");
      return;
    }
    if (!auction || auction.listing_type !== "auction") {
      setBidError("Bu ilana teklif verilemez.");
      return;
    }

    // Check if the user has paid the deposit
    if (!hasDeposit) {
      if (hasPendingDeposit) {
        setBidError(
          "Depozito ödemeniz henüz tamamlanmamış. Lütfen ödemeyi tamamlayın veya yeni bir ödeme başlatın."
        );
      }
      setActionType("bid");
      setShowPaymentModal(true);
      return;
    }

    // For auctions, automatically use the minimum bid amount
    const amount = getMinimumBidAmount();

    if (amount <= 0) {
      setBidError("Geçerli bir teklif miktarı bulunamadı.");
      return;
    }

    const currentStatus = getAuctionStatus();
    if (currentStatus !== "active") {
      setBidError("Teklif verme süresi dolmuş veya henüz başlamamıştır.");
      return;
    }

    setSubmitLoading(true);
    setBidError(null);

    try {
      if (!user?.id) {
        setBidError(
          "Kullanıcı bilgisi bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin."
        );
        return;
      }

      const { error: insertError } = await supabase.from("bids").insert({
        auction_id: auction.id,
        bidder_id: user.id,
        amount: amount,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          // Unique violation
          setBidError(
            "Kısa süre içinde birden fazla teklif veremezsiniz veya teklifiniz çok düşük."
          );
        } else {
          setBidError(
            insertError.message || "Teklif gönderilirken bir hata oluştu."
          );
        }
        return;
      }

      await refreshBids();

      // Send SMS notifications to other users who have been outbid
      try {
        console.log("Sending SMS notifications for new bid");
        const notificationResult = await sendNewBidNotification({
          auctionId: auction.id,
          newBidAmount: amount,
          newBidUserId: user.id,
        });

        if (notificationResult.success) {
          console.log(
            "SMS notifications sent successfully:",
            notificationResult.message
          );
        } else {
          console.error(
            "Failed to send SMS notifications:",
            notificationResult.error
          );
        }
      } catch (smsError) {
        console.error("Exception sending SMS notifications:", smsError);
        // Don't fail the bid submission if SMS fails
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      setBidError(error.message || "Teklif gönderilirken bir hata oluştu.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const refreshOffers = useCallback(async () => {
    if (!auction || auction.listing_type !== "offer" || !user?.id) return;
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("auction_id", auction.id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error refreshing user's offers:", error);
        return;
      }
      setUserOffers(data || []);
    } catch (error) {
      console.error("Error refreshing user's offers:", error);
    }
  }, [auction, user?.id]);

  const handleSubmitOffer = async (e) => {
    console.log("--- Executing handleSubmitOffer ---");
    e.preventDefault();
    if (!user) {
      setOfferError("Teklif vermek için giriş yapmalısınız.");
      return;
    }
    if (!auction || auction.listing_type !== "offer") {
      setOfferError("Bu ilana teklif verilemez.");
      return;
    }

    // Check if the user has paid the deposit
    if (!hasDeposit) {
      if (hasPendingDeposit) {
        setOfferError(
          "Depozito ödemeniz henüz tamamlanmamış. Lütfen ödemeyi tamamlayın veya yeni bir ödeme başlatın."
        );
      }
      setActionType("offer");
      setShowPaymentModal(true);
      return;
    }

    // For offer-type listings, use the auction price. For auctions, use the entered amount.
    let amount;
    if (auction.listing_type === "offer") {
      // Use the listing price for "Buy Now" functionality
      amount = parseFloat(auction.price);
    } else {
      // Clean the input string by removing dots (thousand separators)
      const cleanedAmountString = String(offerAmount).replace(/\./g, "");

      // Parse the cleaned string
      amount = parseFloat(cleanedAmountString);

      if (isNaN(amount) || amount <= 0) {
        setOfferError("Lütfen geçerli bir teklif miktarı girin.");
        return;
      }
    }

    // Double-check if user already has a pending or accepted offer just before submitting
    const { data: existingOffers, error: checkError } = await supabase
      .from("offers")
      .select("id, status")
      .eq("auction_id", auction.id)
      .eq("user_id", user.id)
      .in("status", ["pending", "accepted"])
      .limit(1);

    if (checkError) {
      console.error(
        "Error checking existing offers before submit:",
        checkError
      );
      setOfferError(
        "Teklif durumu kontrol edilirken hata oluştu. Lütfen tekrar deneyin."
      );
      return;
    }

    if (existingOffers && existingOffers.length > 0) {
      const existingOffer = existingOffers[0];
      setOfferError(
        `Zaten ${
          existingOffer.status === "pending"
            ? "beklemede olan"
            : "kabul edilmiş"
        } bir teklifiniz var.`
      );
      await refreshOffers(); // Refresh state to be sure
      return;
    }

    setSubmitLoading(true);
    setOfferError(null);

    try {
      const { error: insertError } = await supabase.from("offers").insert({
        auction_id: auction.id,
        user_id: user.id,
        amount: amount,
        // status defaults to 'pending' in the database
      });

      if (insertError) {
        if (insertError.code === "23505") {
          // Unique violation code for unique_pending_offer_per_user_auction
          setOfferError(
            "Bu ilan için zaten beklemede olan bir teklifiniz var. Sayfayı yenileyin."
          );
        } else {
          setOfferError(
            insertError.message || "Teklif gönderilirken bir hata oluştu."
          );
        }
        return;
      }

      setOfferAmount(""); // Clear input
      await refreshOffers(); // Refresh offers to show the new pending one
    } catch (error) {
      console.error("Error submitting offer:", error);
      setOfferError(error.message || "Teklif gönderilirken bir hata oluştu.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Format price with Turkish Lira (₺) symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0 ₺";
    return `${parseFloat(price).toLocaleString("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} ₺`;
  };

  // Format number with thousand separators (for area, etc.)
  const formatNumber = (number) => {
    if (number === undefined || number === null) return "";
    return parseFloat(number).toLocaleString("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Geçersiz Tarih";
    }
  };

  const getAuctionStatus = useCallback(() => {
    if (!auction) return "loading";
    // For 'offer' type, status might be less relevant, but we keep the date logic for consistency
    const now = new Date();
    const startTime = new Date(auction.start_time);
    const endTime = new Date(auction.end_time);

    if (now < startTime) return "upcoming";
    if (now > endTime) return "ended";
    return "active"; // Even offers can be considered 'active' during their listing window
  }, [auction]);

  /* const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "ended":
        return "Sona Erdi";
      default:
        return "";
    }
  }; */

  /* const getStatusIcon = (status) => {
    // Using same icons for simplicity, could be customized for offers
    switch (status) {
      case "active":
        return <TimerIcon />;
      case "upcoming":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            width="16"
            height="16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        );
      case "ended":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            width="16"
            height="16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        );
      default:
        return null;
    }
  }; */

  // Only relevant for auctions
  const getMinimumBidAmount = useCallback(() => {
    if (!auction || auction.listing_type !== "auction") return 0;
    const highestBid = bids[0]?.amount || 0;
    const startPrice = auction.starting_price || 0;
    const minIncrement = auction.min_increment || 1;

    // If there are no bids, return the start price
    if (highestBid === 0) {
      return startPrice;
    }

    // Otherwise, return highest bid + minimum increment
    return highestBid + minIncrement;
  }, [auction, bids]);

  const handleTimerComplete = useCallback(() => {
    console.log("Timer completed, refetching data...");
    fetchData();
  }, [fetchData]);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    // Prevent scrolling when lightbox is open
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    // Re-enable scrolling
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    if (!auction || !auction.images || auction.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % auction.images.length);
  };

  const prevImage = () => {
    if (!auction || !auction.images || auction.images.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? auction.images.length - 1 : prev - 1
    );
  };

  // Add keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen]);

  // Debug the bid card's DOM structure
  useEffect(() => {
    if (!loading && auction) {
      console.log("Debugging bid card structure:");
      const bidCard = document.querySelector(".bid-card");
      if (bidCard) {
        console.log("Bid card found:", bidCard);
        console.log(
          "Bid card computed style:",
          window.getComputedStyle(bidCard)
        );
        console.log("Bid card children:", bidCard.children);

        // Log all children with computed heights
        Array.from(bidCard.querySelectorAll("*")).forEach((el) => {
          const style = window.getComputedStyle(el);
          console.log(el.tagName, {
            marginBottom: style.marginBottom,
            paddingBottom: style.paddingBottom,
            height: style.height,
            content: el.textContent?.substring(0, 20) + "...",
          });
        });
      }
    }
  }, [loading, auction]);

  // Setup auto-refresh when the page becomes visible
  useEffect(() => {
    // Immediately fetch bids
    refreshBids();

    // Set up visibility change handler for auto-refreshing bids
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[AuctionDetail] Page became visible, refreshing bids");
        refreshBids();
      }
    };

    // Add visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id]);

  // Setup real-time subscription for bids
  useEffect(() => {
    if (!auction?.id || auction.listing_type !== "auction") return;

    console.log(
      `[AuctionDetail] Setting up real-time subscription for auction ${auction.id}`
    );

    // Set up real-time subscription for bids
    const channel = supabase
      .channel(`auction-${auction.id}-bids`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `auction_id=eq.${auction.id}`,
        },
        (payload) => {
          console.log(
            "[AuctionDetail] New bid received via real-time:",
            payload
          );
          // Refresh bids to get the latest data with profile information
          refreshBids();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bids",
          filter: `auction_id=eq.${auction.id}`,
        },
        (payload) => {
          console.log("[AuctionDetail] Bid updated via real-time:", payload);
          // Refresh bids to get the latest data
          refreshBids();
        }
      )
      .subscribe((status) => {
        console.log(`[AuctionDetail] Real-time subscription status: ${status}`);
      });

    // Cleanup function
    return () => {
      console.log(
        `[AuctionDetail] Cleaning up real-time subscription for auction ${auction.id}`
      );
      supabase.removeChannel(channel);
    };
  }, [auction?.id, auction?.listing_type]);

  // --- Utility to get client IP ---
  const getClientIp = async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip;
    } catch {
      return "";
    }
  };

  // --- Replace handleRealPayment to use the payment proxy ---
  const handleRealPayment = async () => {
    if (!user?.id || !auction) return;

    // Comprehensive card validation before proceeding
    if (!cardOwner.trim()) {
      setPaymentMessage("Kart sahibi adı gereklidir.");
      setPaymentMessageType("error");
      return;
    }

    if (cardOwner.trim().length < 2) {
      setPaymentMessage("Kart sahibi adı en az 2 karakter olmalıdır.");
      setPaymentMessageType("error");
      return;
    }

    // Card number validation
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (!cleanCardNumber) {
      setPaymentMessage("Kart numarası gereklidir.");
      setPaymentMessageType("error");
      return;
    }

    if (!/^\d+$/.test(cleanCardNumber)) {
      setPaymentMessage("Kart numarası sadece rakam içermelidir.");
      setPaymentMessageType("error");
      return;
    }

    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      setPaymentMessage("Kart numarası 13-19 rakam arasında olmalıdır.");
      setPaymentMessageType("error");
      return;
    }

    // Luhn algorithm check for card number
    const isValidCardNumber = (number) => {
      let sum = 0;
      let isEven = false;
      for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i]);
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
      }
      return sum % 10 === 0;
    };

    if (!isValidCardNumber(cleanCardNumber)) {
      setPaymentMessage(
        "Geçersiz kart numarası. Lütfen kartınızı kontrol ediniz."
      );
      setPaymentMessageType("error");
      return;
    }

    // Month validation
    if (!cardMonth || cardMonth.length !== 2) {
      setPaymentMessage("Son kullanma ayı gereklidir (MM formatında).");
      setPaymentMessageType("error");
      return;
    }

    const monthNum = parseInt(cardMonth, 10);
    if (monthNum < 1 || monthNum > 12) {
      setPaymentMessage("Geçersiz ay. Ay 01-12 arasında olmalıdır.");
      setPaymentMessageType("error");
      return;
    }

    // Year validation
    if (!cardYear || cardYear.length !== 2) {
      setPaymentMessage("Son kullanma yılı gereklidir (YY formatında).");
      setPaymentMessageType("error");
      return;
    }

    const yearNum = parseInt(cardYear, 10);
    const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of current year
    const currentMonth = new Date().getMonth() + 1; // 1-based month

    if (
      yearNum < currentYear ||
      (yearNum === currentYear && monthNum < currentMonth)
    ) {
      setPaymentMessage(
        "Kartınızın son kullanma tarihi geçmiş. Lütfen geçerli bir kart kullanınız."
      );
      setPaymentMessageType("error");
      return;
    }

    if (yearNum > currentYear + 20) {
      setPaymentMessage("Geçersiz son kullanma yılı. Lütfen kontrol ediniz.");
      setPaymentMessageType("error");
      return;
    }

    // CVV validation
    if (!cardCvv) {
      setPaymentMessage("CVV kodu gereklidir.");
      setPaymentMessageType("error");
      return;
    }

    if (!/^\d{3}$/.test(cardCvv)) {
      setPaymentMessage("CVV kodu 3 rakamdan oluşmalıdır.");
      setPaymentMessageType("error");
      return;
    }

    setPaymentProcessing(true);
    setPaymentMessage("");
    setPaymentMessageType("");

    try {
      const clientIp = await getClientIp();

      // Generate a shorter OrderId that's guaranteed to be under 64 chars
      const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

      // Create a much shorter OrderId using just essential info
      const shortAuctionId = auction.id.replace(/-/g, "").substring(0, 8); // First 8 chars of auction ID without dashes
      const shortUserId = user.id.replace(/-/g, "").substring(0, 8); // First 8 chars of user ID without dashes
      const orderId =
        `a${shortAuctionId}u${shortUserId}t${timestamp}`.substring(0, 50); // Limit to 50 chars for safety

      // Convert TL amount to kuruş (cents) by multiplying by 100
      const amountInKurus = Math.round((auction.deposit_amount || 0) * 100);

      // Create a deposit record before initiating payment
      const depositRecord = await createDeposit({
        auction_id: auction.id,
        user_id: user.id,
        amount: auction.deposit_amount || 0,
        payment_id: orderId,
      });

      console.log("Deposit record created:", depositRecord);

      // Prepare the payload for the payment-proxy-server
      const payload = {
        ReturnUrl:
          window.location.origin + "/payment-callback?orderId=" + orderId,
        OrderId: orderId,
        ClientIp: clientIp,
        Installment: 1,
        Amount: amountInKurus, // Amount in kuruş (cents)
        Is3D: true,
        IsAutoCommit: true,
        CardInfo: {
          CardOwner: cardOwner,
          CardNo: cardNumber.replace(/\s/g, ""),
          Month: cardMonth,
          Year: cardYear,
          Cvv: cardCvv,
        },
        CustomerInfo: {
          Name: profile?.full_name || user.email || "",
          Phone: profile?.phone_number || "",
          Email: user.email || "",
          Address: profile?.address || "",
          Description: `Auction deposit for auction #${auction.id}`,
        },
        Products: [
          {
            Name: auction.title,
            Count: 1,
            UnitPrice: amountInKurus, // Unit price in kuruş (cents)
          },
        ],
      };

      console.log("Payment request payload:", {
        ...payload,
        CardInfo: {
          ...payload.CardInfo,
          CardNo: "****",
          Cvv: "***",
          Month: payload.CardInfo.Month, // Show actual month for debugging
          Year: payload.CardInfo.Year, // Show actual year for debugging
        },
      });

      // Extra debugging for card month issue
      console.log("Card form state before payment:", {
        cardExpiry,
        cardMonth,
        cardYear,
        cardMonthLength: cardMonth?.length,
        cardYearLength: cardYear?.length,
      });

      // Call the Supabase Edge Function using invoke
      const { data, error } = await supabase.functions.invoke("payment-proxy", {
        body: payload,
      });

      console.log("Edge function response:", { data, error });

      if (error) {
        // If payment initiation fails, update deposit status to failed using Edge Function
        try {
          await supabase.functions.invoke("update-deposit-status", {
            body: {
              payment_id: orderId,
              status: "failed",
            },
          });
        } catch (updateError) {
          console.error("Could not mark deposit as failed:", updateError);
        }

        // Maximum defensive error handling - avoid Error constructor entirely
        let errorMessage = "Ödeme işlemi başlatılırken hata oluştu";
        try {
          if (error) {
            if (typeof error === "string") {
              errorMessage = error;
            } else if (
              error &&
              error.message &&
              typeof error.message === "string"
            ) {
              errorMessage = error.message;
            } else if (error && typeof error.toString === "function") {
              errorMessage = error.toString();
            } else {
              errorMessage = JSON.stringify(error);
            }
          }
        } catch (parseError) {
          console.error("Error parsing error object:", parseError);
          errorMessage = "Bilinmeyen hata oluştu";
        }

        // Create error-like object without using Error constructor
        const paymentErrorText =
          "Edge function error: " + String(errorMessage || "Bilinmeyen hata");
        const errorObj = {
          name: "PaymentError",
          message: paymentErrorText,
          toString: function () {
            return this.message;
          },
        };

        console.error("Payment error:", paymentErrorText);
        setPaymentMessage(paymentErrorText);
        setPaymentMessageType("error");
        return; // Don't throw, just set the error message
      }

      if (!data) {
        // If payment initiation fails, update deposit status to failed using Edge Function
        try {
          await supabase.functions.invoke("update-deposit-status", {
            body: {
              payment_id: orderId,
              status: "failed",
            },
          });
        } catch (updateError) {
          console.error("Could not mark deposit as failed:", updateError);
        }

        console.error("No response from edge function");
        setPaymentMessage("No response from edge function");
        setPaymentMessageType("error");
        return;
      }

      if (data.error) {
        // If payment initiation fails, update deposit status to failed using Edge Function
        try {
          await supabase.functions.invoke("update-deposit-status", {
            body: {
              payment_id: orderId,
              status: "failed",
            },
          });
        } catch (updateError) {
          console.error("Could not mark deposit as failed:", updateError);
        }
        // If there's a raw response in the error, it might be HTML
        if (data.rawResponse) {
          console.error("Raw error response:", data.rawResponse);
          setPaymentMessage(
            "Ödeme servisi yanıtı işlenemedi. Lütfen daha sonra tekrar deneyin."
          );
          setPaymentMessageType("error");
          return;
        }

        console.error("Data error:", data.error);
        setPaymentMessage(String(data.error));
        setPaymentMessageType("error");
        return;
      }

      if (!data.paymentLink) {
        // If payment initiation fails, update deposit status to failed using Edge Function
        try {
          await supabase.functions.invoke("update-deposit-status", {
            body: {
              payment_id: orderId,
              status: "failed",
            },
          });
        } catch (updateError) {
          console.error("Could not mark deposit as failed:", updateError);
        }
        console.error("Invalid payment response:", data);
        setPaymentMessage("Ödeme linki alınamadı");
        setPaymentMessageType("error");
        return;
      }

      // Payment initiation successful, redirect to PaymentLink
      window.location.href = data.paymentLink;
    } catch (error) {
      console.error("Payment error details:", error);
      setPaymentMessage(
        error.message || "Ödeme işlemi sırasında bir hata oluştu."
      );
      setPaymentMessageType("error");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // --- Update closePaymentModal to reset card info ---
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentMessage("");
    setPaymentMessageType("");
    setPaymentStep("info");
    setCardNumber("");
    setCardMonth("");
    setCardYear("");
    setCardCvv("");
    setCardOwner("");
    setAgreementAccepted(false);
    // Clear bid/offer errors when modal is closed
    setBidError(null);
    setOfferError(null);
  };

  // Function to proceed to payment form
  const proceedToPayment = () => {
    setPaymentStep("payment");
  };

  // Add payment modal component
  const renderPaymentModal = () => {
    if (!auction) return null;

    return (
      <PaymentModalOverlay
        isVisible={showPaymentModal}
        onClick={closePaymentModal}
      >
        <PaymentModalContent onClick={(e) => e.stopPropagation()}>
          <PaymentModalHeader>
            <PaymentModalTitle>
              {paymentStep === "info"
                ? "Katılım Teminatı"
                : "Katılım Teminatı Ödemesi"}
            </PaymentModalTitle>
            <button
              onClick={closePaymentModal}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
              }}
            >
              <CloseIcon />
            </button>
          </PaymentModalHeader>

          <PaymentModalBody>
            {paymentStep === "info" ? (
              // Initial information step
              <>
                <PaymentWarning>
                  {hasPendingDeposit ? (
                    <>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 500,
                          textAlign: "center",
                          color: "orange",
                        }}
                      >
                        Açık artırma otomatik teklif sistemiyle ilerlemektedir
                      </p>
                      <p style={{ marginBottom: 0, textAlign: "center" }}>
                        Her teklif verdiğinizde sistem otomatik olarak{" "}
                        {formatPrice(auction.min_increment || 0)} teklif
                        vermektedir.
                      </p>
                      <p style={{ marginBottom: 0, textAlign: "center" }}>
                        Açık artırmayı kazanamamanız durumunda, yatırmış
                        olduğunuz teminat tutarı yedi (7) iş günü içerisinde
                        sistemde kayıtlı banka hesabınıza eksiksiz olarak iade
                        edilecektir.
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 500,
                          textAlign: "center",
                        }}
                      >
                        Açık artırma otomatik teklif sistemiyle ilerlemektedir
                      </p>
                      <p style={{ marginBottom: 0, textAlign: "center" }}>
                        Her teklif verdiğinizde sistem otomatik olarak{" "}
                        {formatPrice(auction.min_increment || 0)} teklif
                        vermektedir.
                      </p>
                      <p style={{ marginBottom: 0, textAlign: "center" }}>
                        Açık artırmayı kazanamamanız durumunda, yatırmış
                        olduğunuz teminat tutarı yedi (7) iş günü içerisinde
                        sistemde kayıtlı banka hesabınıza eksiksiz olarak iade
                        edilecektir.
                      </p>
                    </>
                  )}
                </PaymentWarning>

                <PaymentAmount>
                  <PaymentAmountLabel>Ödenecek Tutar:</PaymentAmountLabel>
                  <PaymentAmountValue>
                    {formatPrice(auction.deposit_amount || 0)}
                  </PaymentAmountValue>
                </PaymentAmount>

                <AgreementSection>
                  <AgreementText>
                    <p>
                      <strong>
                        Aşağıda detayları belirtilen hizmete ilişkin
                        siparişinizi onaylayarak ilgili hizmeti aşağıdaki fiyat
                        ve koşullarla satın almayı kabul etmektesiniz.
                      </strong>
                    </p>

                    <h4>HİZMET BİLGİLERİ:</h4>

                    <p>
                      Hizmet Türü: Katılımcılar ile gayrimenkul
                      sahipleri/satıcılar arasında ileride
                      gerçekleştirilebilecek satış sözleşmesinde uygulanabilecek
                      bedelin belirlenmesi amacıyla gerçekleştirilen, en yüksek
                      teklifi veren katılımcının belirlendiği, detayları Site
                      üzerinden yayınlanan içerikler ile belirlenen sisteme
                      ("Açık Arttırma") katılım imkanı ve buna ilişkin gerekli
                      altyapının sağlanması
                    </p>

                    <p>
                      Hizmet Açıklaması: Hizmet kapsamında, gayrimenkul
                      satışlarına ilişkin Açık Arttırmalar'ın
                      gerçekleştirilebilmesine ve Site Üyelik Sözleşmesi
                      çerçevesinde Site üzerinden yayınlanan gayrimenkul satış
                      ilanlarının incelenmesi sonrasında uygun görülmesi halinde
                      Site üzerinden gerçekleştirilen Açık Arttırmalar'a katılım
                      sağlanmasına yönelik altyapı hizmetleri sağlanmaktadır.
                    </p>

                    <p>
                      Hizmet Bedeli/Fiyatı (KDV ve her türlü masraf dâhil) :{" "}
                      {formatPrice(auction.deposit_amount || 0)}
                    </p>

                    <p>
                      Hizmete ilişkin Hizmet Alan Tarafından Karşılanacak Diğer
                      Masraflar: [________]
                    </p>

                    <p>Ödeme şekli: Kredi Kartı</p>

                    <p>Fatura Adresi:</p>

                    <h4>CAYMA HAKKI:</h4>

                    <p>
                      Hizmet Alan, işbu sözleşmenin akdedilmesini takip eden on
                      dört gün içerisinde hiçbir hukuki ve cezai sorumluluk
                      üstlenmeksizin ve hiçbir gerekçe göstermeksizin
                      sözleşmeden cayma hakkına sahiptir. Hizmet Alan, bahsi
                      geçen süre içerisinde cayma hakkını kullanmak istediğini,
                      işbu sözleşme ekinde yer alan örnek cayma hakkı formunu
                      doldurarak veya sair açık bir bildirimi ile işbu
                      sözleşmede belirtilen iletişim yöntemlerinden herhangi
                      biri ile Hizmet Veren'e bildirecektir. Hizmet Veren,
                      ilgili bildirimin kendisine ulaşmasını takip eden on dört
                      gün içerisinde kendisine yapılmış ödemeleri Hizmet Alan'a
                      iade edecektir.
                    </p>

                    <p>
                      Hizmet Alan; cayma hakkı süresi sona ermeden önce kendi
                      onayı ile hizmetin ifasına başlanan hizmet sözleşmelerinde
                      cayma hakkının kullanılamayacağını bilmekte olup bu
                      kapsamda Açık Arttırma tarihinin yukarıda belirtilen cayma
                      hakkı süresi içerisine denk gelmesi halinde Açık Arttırma
                      tarihi itibariyle ek bir onay gerekmeksizin hizmete
                      başlanmış olacağını ve bu kapsamda cayma hakkının ortadan
                      kalkacağını kabul eder.
                    </p>

                    <p>
                      Hizmet Alan, Mesafeli Sözleşmeler Yönetmeliği gereği cayma
                      hakkına ilişkin bilgilendirmenin gereği gibi yapıldığını
                      kabul eder.
                    </p>
                  </AgreementText>

                  <AgreementCheckbox>
                    <input
                      type="checkbox"
                      id="agreement-checkbox"
                      checked={agreementAccepted}
                      onChange={(e) => setAgreementAccepted(e.target.checked)}
                    />
                    <label htmlFor="agreement-checkbox">
                      Yukarıdaki tüm şartları okudum, anladım ve kabul ediyorum.
                    </label>
                  </AgreementCheckbox>
                </AgreementSection>
              </>
            ) : (
              // Payment form step
              <>
                <PaymentAmount>
                  <PaymentAmountLabel>Ödenecek Tutar:</PaymentAmountLabel>
                  <PaymentAmountValue>
                    {formatPrice(auction.deposit_amount || 0)}
                  </PaymentAmountValue>
                </PaymentAmount>

                {/* Mock form fields for payment - to be replaced with actual payment processor later */}
                <div style={{ 
                  marginBottom: "1.5rem",
                  "@media (max-width: 768px)": {
                    marginBottom: "1rem"
                  }
                }}>
                  <InputGroup>
                    <InputLabel>Kart Sahibi</InputLabel>
                    <Input
                      type="text"
                      placeholder="Ad Soyad"
                      value={cardOwner}
                      onChange={handleCardOwnerChange}
                      disabled={paymentProcessing}
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <InputLabel>Kart Numarası</InputLabel>
                    <Input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      disabled={paymentProcessing}
                      required
                    />
                  </InputGroup>
                  <div style={{ 
                    display: "flex", 
                    gap: "1rem",
                    "@media (max-width: 768px)": {
                      flexDirection: "column",
                      gap: "0.75rem"
                    }
                  }}>
                    <InputGroup style={{ 
                      flex: 1,
                      "@media (max-width: 768px)": {
                        flex: "none"
                      }
                    }}>
                      <InputLabel>Son Kullanma Tarihi</InputLabel>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        disabled={paymentProcessing}
                        required
                        maxLength={5}
                      />
                    </InputGroup>
                    <InputGroup style={{ 
                      flex: 1,
                      "@media (max-width: 768px)": {
                        flex: "none"
                      }
                    }}>
                      <InputLabel>CVV</InputLabel>
                      <Input
                        type="text"
                        placeholder="123"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        disabled={paymentProcessing}
                        required
                      />
                    </InputGroup>
                  </div>
                </div>
                {paymentMessage && (
                  <PaymentMessage type={paymentMessageType}>
                    {paymentMessage}
                  </PaymentMessage>
                )}
              </>
            )}
          </PaymentModalBody>

          <PaymentModalFooter>
            {paymentStep === "info" ? (
              // Initial step buttons
              <>
                <Button
                  onClick={closePaymentModal}
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-border)",
                    "@media (max-width: 768px)": {
                      flex: 1,
                      fontSize: "0.875rem",
                      padding: "0.75rem 1rem"
                    }
                  }}
                >
                  İptal
                </Button>
                <Button
                  onClick={proceedToPayment}
                  style={{
                    minWidth: "140px",
                    opacity: agreementAccepted ? 1 : 0.5,
                    cursor: agreementAccepted ? "pointer" : "not-allowed",
                    "@media (max-width: 768px)": {
                      flex: 1,
                      fontSize: "0.875rem",
                      padding: "0.75rem 1rem"
                    }
                  }}
                  disabled={!agreementAccepted}
                >
                  Teminatı Yatır
                </Button>
              </>
            ) : (
              // Payment step buttons
              <>
                <Button
                  onClick={() => setPaymentStep("info")}
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-border)",
                    "@media (max-width: 768px)": {
                      flex: 1,
                      fontSize: "0.875rem",
                      padding: "0.75rem 1rem"
                    }
                  }}
                  disabled={paymentProcessing}
                >
                  Geri
                </Button>
                <Button
                  onClick={handleRealPayment}
                  style={{ 
                    minWidth: "120px",
                    "@media (max-width: 768px)": {
                      flex: 1,
                      fontSize: "0.875rem",
                      padding: "0.75rem 1rem"
                    }
                  }}
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.5rem",
                        "@media (max-width: 768px)": {
                          fontSize: "0.875rem"
                        }
                      }}
                    >
                      <LoadingIcon /> Ödeniyor...
                    </div>
                  ) : (
                    "Ödeme Yap"
                  )}
                </Button>
              </>
            )}
          </PaymentModalFooter>
        </PaymentModalContent>
      </PaymentModalOverlay>
    );
  };

  if (loading && !auction) {
    return (
      <PageContainer>
        <LoadingSpinner message="İlan yükleniyor..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <p style={{ color: "red" }}>Hata: {error}</p>
      </PageContainer>
    );
  }

  if (!auction) {
    return (
      <PageContainer>
        <p>İlan bulunamadı.</p>
      </PageContainer>
    );
  }

  const currentStatus = getAuctionStatus();
  const isOfferListing = auction.listing_type === "offer";

  // Determine offer state for rendering
  const userActiveOffer = isOfferListing
    ? userOffers.find((o) => o.status === "pending" || o.status === "accepted")
    : null;
  const showOfferForm =
    isOfferListing && user && !authLoading && !userActiveOffer;
  const showRejectedMessage =
    isOfferListing &&
    user &&
    !authLoading &&
    userOffers.find((o) => o.status === "rejected") &&
    !userActiveOffer;

  // Prepare meta tag content
  const pageTitle = auction?.title || "İlan Detayı";
  const pageDescription =
    auction?.description?.substring(0, 150) ||
    "Arazial.com üzerinde yer alan ilanı inceleyin.";
  // Use the first image or a default fallback image
  const imageUrl =
    auction?.images?.[0] || "https://default.com/placeholder.jpg"; // Replace with your actual default image URL

  // Modify the bid form section to include deposit check
  const renderBidForm = () => {
    if (!user) {
      return (
        <MessageBox>
          Teklif vermek için{" "}
          <LoginLink onClick={handleLoginClick}>giriş yapın</LoginLink>
        </MessageBox>
      );
    }

    return (
      <BidForm onSubmit={handleSubmitBid}>
        {/* ... existing bid form code ... */}
      </BidForm>
    );
  };
  /* 
  const StartTimeBadge = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    gap: 0.5rem;
    background: linear-gradient(
      135deg,
      rgba(37, 99, 235, 0.1) 0%,
      rgba(59, 130, 246, 0.15) 100%
    );
    color: rgb(37, 99, 235);
    border: 1px solid rgba(37, 99, 235, 0.2);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
      background: linear-gradient(
        135deg,
        rgba(37, 99, 235, 0.15) 0%,
        rgba(59, 130, 246, 0.2) 100%
      );
    }

    svg {
      width: 16px;
      height: 16px;
      color: rgb(37, 99, 235);
    }
  `; */

  return (
    <PageContainer>
      {/* --- Add Helmet for Meta Tags --- */}
      <Helmet>
        <title>{`${pageTitle} - Arazial`}</title>
        <meta name="description" content={pageDescription} />

        {/* Open Graph Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
        {/* You could use 'article' if it fits better */}

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
        {/* Add twitter:site if you have a Twitter handle */}
        {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */}
      </Helmet>

      <BackButton onClick={() => navigate(-1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>{" "}
        Geri Dön
      </BackButton>

      {/* Title and Status section - only visible on desktop */}
      <DesktopHeader>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <AuctionStatus status={currentStatus}>
            {getStatusIcon(currentStatus)}
            {getStatusText(currentStatus)}
          </AuctionStatus>

          {auction.listing_type === "auction" &&
            (currentStatus === "active"
              ? auction.end_time && (
                  <StartTimeBadge>
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
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                    <span className="date-label">Bitiş Tarihi:</span>{" "}
                    <ModernDateDisplay
                      date={auction.end_time}
                      compact={true}
                      showIcon={false}
                    />
                  </StartTimeBadge>
                )
              : auction.start_time && (
                  <StartTimeBadge>
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
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                    <span className="date-label">Başlangıç Tarihi:</span>{" "}
                    <ModernDateDisplay
                      date={auction.start_time}
                      compact={true}
                      showIcon={false}
                    />
                  </StartTimeBadge>
                ))}
        </div>

        <AuctionTitle>{auction.title}</AuctionTitle>

        <AuctionLocation>
          <LocationIcon />{" "}
          {auction.location?.split(",").reverse().join(", ").trim() ||
            "Konum belirtilmemiş"}
        </AuctionLocation>
      </DesktopHeader>

      {/* MOBILE LAYOUT - Different structure than desktop */}
      <div
        className="mobile-layout"
        style={{ display: "none", flexDirection: "column", width: "100%" }}
      >
        {/* 1. IMAGES */}
        <div
          className="mobile-gallery"
          style={{ width: "100%", marginBottom: "0" }}
        >
          <MainGalleryContainer style={{ marginBottom: "0" }}>
            <MainImage
              src={auction.images[currentImageIndex]}
              alt={auction.title}
              onClick={() => openLightbox(currentImageIndex)}
              style={{ width: "100%", maxWidth: "none" }}
            />

            <GalleryNavButton
              direction="left"
              onClick={prevImage}
              disabled={auction.images.length <= 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </GalleryNavButton>

            <GalleryNavButton
              direction="right"
              onClick={nextImage}
              disabled={auction.images.length <= 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </GalleryNavButton>
          </MainGalleryContainer>

          <ImageGallery>
            {auction.images.map((img, index) => (
              <ImageThumbnail
                key={index}
                style={{ backgroundImage: `url(${img})` }}
                title={`Resim ${index + 1}`}
                isActive={index === currentImageIndex}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </ImageGallery>
        </div>

        {/* 2. TEKLIF YAP - Now placed directly under the image instead of fixed at bottom */}
        <div
          className="mobile-bid-section"
          style={{
            width: "100%",
            backgroundColor: "white",
            margin: 0,
            padding: 0,
            boxShadow: "none",
          }}
        >
          <BidCard
            isOfferListing={isOfferListing}
            currentStatus={currentStatus}
            user={user}
            authLoading={authLoading}
            getMinimumBidAmount={getMinimumBidAmount}
            bidError={bidError}
            submitLoading={submitLoading}
            handleSubmitBid={handleSubmitBid}
            formatPrice={formatPrice}
            bids={bids}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            formatDate={formatDate}
            userActiveOffer={userActiveOffer}
            showRejectedMessage={showRejectedMessage}
            offerAmount={offerAmount}
            setOfferAmount={setOfferAmount}
            offerError={offerError}
            handleSubmitOffer={handleSubmitOffer}
            showOfferForm={showOfferForm}
            auction={auction}
            handleTimerComplete={handleTimerComplete}
          />
        </div>

        {/* 3. TITLE AND DETAILS */}
        <div
          className="mobile-header-section"
          style={{ padding: "0.75rem 1rem", marginTop: 0 }}
        >
          {/*   <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <AuctionStatus status={currentStatus}>
              {getStatusIcon(currentStatus)}
              {getStatusText(currentStatus)}
            </AuctionStatus>

            {auction.listing_type === "auction" &&
              (currentStatus === "active"
                ? auction.end_time && (
                    <StartTimeBadge>
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
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                      </svg>
                      <span className="date-label">Bitiş Tarihi:</span>{" "}
                      <ModernDateDisplay
                        date={auction.end_time}
                        compact={true}
                        showIcon={false}
                      />
                    </StartTimeBadge>
                  )
                : auction.start_time && (
                    <StartTimeBadge>
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
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                      </svg>
                      <span className="date-label">Başlangıç Tarihi:</span>{" "}
                      <ModernDateDisplay
                        date={auction.start_time}
                        compact={true}
                        showIcon={false}
                      />
                    </StartTimeBadge>
                  ))} 
          </div>*/}

          <AuctionTitle>{auction.title}</AuctionTitle>

          <AuctionLocation>
            <LocationIcon />{" "}
            {auction.location?.split(",").reverse().join(", ").trim() ||
              "Konum belirtilmemiş"}
          </AuctionLocation>
        </div>

        {/* 4. PROPERTY DETAILS */}
        <div
          className="mobile-details-section"
          style={{ padding: 0, margin: 0 }}
        >
          <Card className="details-card">
            <CardContent>
              <PropertyGrid>
                <PropertyItem>
                  <PropertyLabel>Ada No</PropertyLabel>
                  <PropertyValue>{auction.ada_no || "-"}</PropertyValue>
                </PropertyItem>
                <PropertyItem>
                  <PropertyLabel>Parsel No</PropertyLabel>
                  <PropertyValue>{auction.parsel_no || "-"}</PropertyValue>
                </PropertyItem>
                <PropertyItem>
                  <PropertyLabel>Emlak Tipi</PropertyLabel>
                  <PropertyValue>{auction.emlak_tipi || "-"}</PropertyValue>
                </PropertyItem>
                <PropertyItem>
                  <PropertyLabel>Alan (m²)</PropertyLabel>
                  <PropertyValue>
                    {auction.area_size
                      ? `${formatNumber(auction.area_size)} ${
                          auction.area_unit || "m²"
                        }`
                      : "-"}
                  </PropertyValue>
                </PropertyItem>
                <PropertyItem>
                  <PropertyLabel>İlan Sahibi</PropertyLabel>
                  <PropertyValue>
                    {auction.ilan_sahibi ||
                      auction.profiles?.full_name ||
                      "Bilinmiyor"}
                  </PropertyValue>
                </PropertyItem>
                <PropertyItem>
                  <PropertyLabel>İlan Tarihi</PropertyLabel>
                  <PropertyValue>
                    <ModernDateDisplay
                      date={auction.created_at}
                      compact={true}
                      showIcon={false}
                    />
                  </PropertyValue>
                </PropertyItem>
                {/* Show Auction Times only for Auctions */}
                {!isOfferListing && (
                  <>
                    <PropertyItem>
                      <PropertyLabel>Başlangıç Zamanı</PropertyLabel>
                      <PropertyValue>
                        <ModernDateDisplay
                          date={auction.start_time}
                          compact={true}
                          showIcon={false}
                        />
                      </PropertyValue>
                    </PropertyItem>
                    <PropertyItem>
                      <PropertyLabel>Bitiş Zamanı</PropertyLabel>
                      <PropertyValue>
                        <ModernDateDisplay
                          date={auction.end_time}
                          compact={true}
                          showIcon={false}
                        />
                      </PropertyValue>
                    </PropertyItem>
                  </>
                )}
              </PropertyGrid>
            </CardContent>
          </Card>
        </div>

        {/* 5. DESCRIPTION */}
        <div
          className="mobile-description-section"
          style={{
            padding: "0 1rem",
            marginTop: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <Card className="description-card">
            <CardContent>
              <Description>
                {auction.description || "Açıklama girilmemiş."}
              </Description>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DESKTOP LAYOUT - Original structure */}
      <AuctionContainer className="desktop-layout">
        {/* --- Left Column (Details) --- */}
        <Column>
          {/* Image Gallery - always visible */}
          <Card className="gallery-card">
            <MainGalleryContainer>
              <MainImage
                src={auction.images[currentImageIndex]}
                alt={auction.title}
                onClick={() => openLightbox(currentImageIndex)}
              />

              <GalleryNavButton
                direction="left"
                onClick={prevImage}
                disabled={auction.images.length <= 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </GalleryNavButton>

              <GalleryNavButton
                direction="right"
                onClick={nextImage}
                disabled={auction.images.length <= 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </GalleryNavButton>
            </MainGalleryContainer>

            <ImageGallery>
              {auction.images.map((img, index) => (
                <ImageThumbnail
                  key={index}
                  style={{ backgroundImage: `url(${img})` }}
                  title={`Resim ${index + 1}`}
                  isActive={index === currentImageIndex}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </ImageGallery>
          </Card>

          {/* Property Details Card */}
          <Card className="details-card">
            <CardContent>
              <PropertyGrid>
                <PropertyItem>
                  <PropertyLabel>Ada No</PropertyLabel>
                  <PropertyValue>{auction.ada_no || "-"}</PropertyValue>
                </PropertyItem>
                <PropertyItem>
                  <PropertyLabel>Parsel No</PropertyLabel>
                  <PropertyValue>{auction.parsel_no || "-"}</PropertyValue>
                </PropertyItem>
                <PropertyItem>
                  <PropertyLabel>Emlak Tipi</PropertyLabel>
                  <PropertyValue>{auction.emlak_tipi || "-"}</PropertyValue>
                </PropertyItem>
                <PropertyItem>
                  <PropertyLabel>Alan (m²)</PropertyLabel>
                  <PropertyValue>
                    {auction.area_size
                      ? `${formatNumber(auction.area_size)} ${
                          auction.area_unit || "m²"
                        }`
                      : "-"}
                  </PropertyValue>
                </PropertyItem>
                <PropertyItem>
                  <PropertyLabel>İlan Sahibi</PropertyLabel>
                  <PropertyValue>
                    {auction.ilan_sahibi ||
                      auction.profiles?.full_name ||
                      "Bilinmiyor"}
                  </PropertyValue>
                </PropertyItem>
                <PropertyItem>
                  <PropertyLabel>İlan Tarihi</PropertyLabel>
                  <PropertyValue>
                    <ModernDateDisplay
                      date={auction.created_at}
                      compact={true}
                      showIcon={false}
                    />
                  </PropertyValue>
                </PropertyItem>
                {/* Show Auction Times only for Auctions */}
                {!isOfferListing && (
                  <>
                    <PropertyItem>
                      <PropertyLabel>Başlangıç Zamanı</PropertyLabel>
                      <PropertyValue>
                        <ModernDateDisplay
                          date={auction.start_time}
                          compact={true}
                          showIcon={false}
                        />
                      </PropertyValue>
                    </PropertyItem>
                    <PropertyItem>
                      <PropertyLabel>Bitiş Zamanı</PropertyLabel>
                      <PropertyValue>
                        <ModernDateDisplay
                          date={auction.end_time}
                          compact={true}
                          showIcon={false}
                        />
                      </PropertyValue>
                    </PropertyItem>
                  </>
                )}
              </PropertyGrid>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card className="description-card">
            <CardContent>
              <Description>
                {auction.description || "Açıklama girilmemiş."}
              </Description>
            </CardContent>
          </Card>
        </Column>

        {/* --- Right Column (Actions) --- */}
        <Column
          style={{
            position: "sticky",
            top: "2rem",
            height: "min-content",
            marginBottom: 0,
            padding: 0,
          }}
        >
          {/* Action Card (Bids or Offers) - Desktop version */}
          <DesktopBidCard>
            <BidCard
              isOfferListing={isOfferListing}
              currentStatus={currentStatus}
              user={user}
              authLoading={authLoading}
              getMinimumBidAmount={getMinimumBidAmount}
              bidError={bidError}
              submitLoading={submitLoading}
              handleSubmitBid={handleSubmitBid}
              formatPrice={formatPrice}
              bids={bids}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              formatDate={formatDate}
              userActiveOffer={userActiveOffer}
              showRejectedMessage={showRejectedMessage}
              offerAmount={offerAmount}
              setOfferAmount={setOfferAmount}
              offerError={offerError}
              handleSubmitOffer={handleSubmitOffer}
              showOfferForm={showOfferForm}
              auction={auction}
              handleTimerComplete={handleTimerComplete}
            />
          </DesktopBidCard>
        </Column>
      </AuctionContainer>

      {/* CSS to manage layout visibility */}
      <style>
        {`
          @media (max-width: 767px) {
            .desktop-layout {
              display: none !important;
            }
            .mobile-layout {
              display: flex !important;
            }
          }
          
          @media (min-width: 768px) {
            .mobile-layout {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Lightbox */}
      {lightboxOpen && auction?.images?.length > 0 && (
        <LightboxOverlay isVisible={lightboxOpen}>
          <LightboxControls>
            <LightboxClose onClick={closeLightbox}>
              <CloseIcon />
            </LightboxClose>
          </LightboxControls>

          <LightboxImage
            src={auction.images[currentImageIndex]}
            alt={`Resim ${currentImageIndex + 1}`}
          />

          <LightboxNav>
            <LightboxNavButton onClick={prevImage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </LightboxNavButton>
            <LightboxNavButton onClick={nextImage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </LightboxNavButton>
          </LightboxNav>

          <LightboxThumbnails>
            {auction.images.map((img, index) => (
              <LightboxThumbnail
                key={index}
                style={{ backgroundImage: `url(${img})` }}
                isActive={index === currentImageIndex}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </LightboxThumbnails>
        </LightboxOverlay>
      )}

      {/* Add Payment Modal */}
      {renderPaymentModal()}
    </PageContainer>
  );
};

export default AuctionDetail;
