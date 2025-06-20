import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { completeAuction } from '../services/auctionService';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const TimerContainer = styled.div`
  display: inline-flex;
  align-items: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 600;
  padding: ${props => props.compact ? '0.5rem 0.75rem' : '1rem 1.5rem'};
  background: ${props => {
    if (props.isExpiring) {
      return 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.15) 100%)';
    }
    return 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.08) 0%, rgba(var(--color-primary-rgb), 0.12) 100%)';
  }};
  color: ${props => props.isExpiring ? 'rgb(220, 38, 38)' : 'var(--color-text)'};
  border-radius: ${props => props.compact ? '0.75rem' : '1rem'};
  font-size: ${props => props.compact ? '0.875rem' : '1rem'};
  line-height: 1.25;
  letter-spacing: 0.025em;
  border: 1px solid ${props => {
    if (props.isExpiring) {
      return 'rgba(220, 38, 38, 0.2)';
    }
    return 'rgba(var(--color-primary-rgb), 0.15)';
  }};
  box-shadow: ${props => {
    if (props.isExpiring) {
      return '0 4px 12px rgba(220, 38, 38, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
    }
    return '0 4px 12px rgba(var(--color-primary-rgb), 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)';
  }};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  overflow: hidden;
  
  ${props => props.isExpiring && `
    animation: ${pulse} 2s infinite;
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      if (props.isExpiring) {
        return '0 8px 24px rgba(220, 38, 38, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)';
      }
      return '0 8px 24px rgba(var(--color-primary-rgb), 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)';
    }};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => {
      if (props.isExpiring) {
        return 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, transparent 50%)';
      }
      return 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, transparent 50%)';
    }};
    pointer-events: none;
  }
`;

const TimerIcon = styled.span`
  margin-right: 0.75rem;
  display: ${props => props.compact ? 'none' : 'inline-flex'};
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.isExpiring ? 'rgba(220, 38, 38, 0.2)' : 'rgba(var(--color-primary-rgb), 0.2)'};
  color: ${props => props.isExpiring ? 'rgb(220, 38, 38)' : 'var(--color-primary)'};
  font-size: 12px;
`;

const TimeDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-variant-numeric: tabular-nums;
`;

const TimeUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: ${props => props.compact ? '2rem' : '2.5rem'};
`;

const TimeValue = styled.span`
  font-size: ${props => props.compact ? '1.125rem' : '1.5rem'};
  font-weight: 700;
  line-height: 1;
  color: ${props => props.isExpiring ? 'rgb(220, 38, 38)' : 'var(--color-text)'};
`;

const TimeLabel = styled.span`
  font-size: ${props => props.compact ? '0.625rem' : '0.75rem'};
  font-weight: 500;
  color: ${props => props.isExpiring ? 'rgba(220, 38, 38, 0.7)' : 'var(--color-text-secondary)'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Separator = styled.span`
  font-size: ${props => props.compact ? '1rem' : '1.25rem'};
  font-weight: 600;
  color: ${props => props.isExpiring ? 'rgba(220, 38, 38, 0.5)' : 'var(--color-text-secondary)'};
  margin: 0 0.25rem;
`;

const ExpiredMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(107, 114, 128);
  font-weight: 600;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CountdownTimer = ({ 
  endTime, 
  onComplete, 
  compact = false,
  alwaysVisible = true,
  showSeconds = true,
  auctionId = null
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });
  
  useEffect(() => {
    let intervalId;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endTime);
      const difference = end - now;
      
      if (difference <= 0) {
        clearInterval(intervalId);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        
        // If an auction ID is provided, try to complete the auction
        if (auctionId) {
          console.log(`Auction timer ended for auction ${auctionId}, completing auction...`);
          completeAuction(auctionId)
            .then(result => {
              console.log('Auction completion result:', result);
              if (result.success) {
                console.log(`Auction ${auctionId} completed successfully`);
              } else {
                console.error(`Failed to complete auction ${auctionId}:`, result.error);
              }
            })
            .catch(err => {
              console.error(`Error in auction completion for ${auctionId}:`, err);
            });
        }
        
        if (onComplete) onComplete();
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        total: difference
      });
    };
    
    calculateTimeLeft();
    intervalId = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(intervalId);
  }, [endTime, onComplete, auctionId]);
  
  // Show nothing if there's no time left
  if (timeLeft.total <= 0 && !alwaysVisible) {
    return null;
  }
  
  // Determine if time is running out (less than 5 minutes)
  const isExpiring = timeLeft.total > 0 && timeLeft.total < 5 * 60 * 1000;
  
  const renderTimeDisplay = () => {
    if (timeLeft.total <= 0) {
      return (
        <ExpiredMessage>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Süre doldu
        </ExpiredMessage>
      );
    }
    
    const { days, hours, minutes, seconds } = timeLeft;
    
    if (days > 0) {
      return (
        <TimeDisplay>
          <TimeUnit compact={compact}>
            <TimeValue compact={compact} isExpiring={isExpiring}>{days}</TimeValue>
            <TimeLabel compact={compact} isExpiring={isExpiring}>Gün</TimeLabel>
          </TimeUnit>
          <Separator compact={compact}>:</Separator>
          <TimeUnit compact={compact}>
            <TimeValue compact={compact} isExpiring={isExpiring}>{hours.toString().padStart(2, '0')}</TimeValue>
            <TimeLabel compact={compact} isExpiring={isExpiring}>Saat</TimeLabel>
          </TimeUnit>
          <Separator compact={compact}>:</Separator>
          <TimeUnit compact={compact}>
            <TimeValue compact={compact} isExpiring={isExpiring}>{minutes.toString().padStart(2, '0')}</TimeValue>
            <TimeLabel compact={compact} isExpiring={isExpiring}>Dakika</TimeLabel>
          </TimeUnit>
          {showSeconds && (
            <>
              <Separator compact={compact}>:</Separator>
              <TimeUnit compact={compact}>
                <TimeValue compact={compact} isExpiring={isExpiring}>{seconds.toString().padStart(2, '0')}</TimeValue>
                <TimeLabel compact={compact} isExpiring={isExpiring}>Saniye</TimeLabel>
              </TimeUnit>
            </>
          )}
        </TimeDisplay>
      );
    }
    
    return (
      <TimeDisplay>
        <TimeUnit compact={compact}>
          <TimeValue compact={compact} isExpiring={isExpiring}>{hours.toString().padStart(2, '0')}</TimeValue>
          <TimeLabel compact={compact} isExpiring={isExpiring}>Saat</TimeLabel>
        </TimeUnit>
        <Separator compact={compact}>:</Separator>
        <TimeUnit compact={compact}>
          <TimeValue compact={compact} isExpiring={isExpiring}>{minutes.toString().padStart(2, '0')}</TimeValue>
          <TimeLabel compact={compact} isExpiring={isExpiring}>Dakika</TimeLabel>
        </TimeUnit>
        {showSeconds && (
          <>
            <Separator compact={compact}>:</Separator>
            <TimeUnit compact={compact}>
              <TimeValue compact={compact} isExpiring={isExpiring}>{seconds.toString().padStart(2, '0')}</TimeValue>
              <TimeLabel compact={compact} isExpiring={isExpiring}>Saniye</TimeLabel>
            </TimeUnit>
          </>
        )}
      </TimeDisplay>
    );
  };
  
  return (
    <TimerContainer 
      compact={compact} 
      isExpiring={isExpiring}
      alwaysVisible={alwaysVisible}
    >
      <TimerIcon compact={compact} isExpiring={isExpiring}>
        {isExpiring ? '⏰' : '⏱️'}
      </TimerIcon>
      {renderTimeDisplay()}
    </TimerContainer>
  );
};

export default CountdownTimer; 