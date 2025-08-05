import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchAuctions, fetchNegotiations } from '../services/auctionService';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import Button from '../components/ui/Button';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
    width: 100%;
    overflow-x: hidden;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2.5rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1.25rem;
    left: 0;
    width: 80px;
    height: 4px;
    background: var(--color-primary);
    border-radius: 2px;
  }
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const PageDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: 1.25rem;
  max-width: 800px;
  line-height: 1.6;
`;

// Update the FiltersAndContentWrapper layout
const FiltersAndContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

// Update the FiltersPanel to appear inline instead of sidebar
const FiltersPanel = styled.aside`
  background-color: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
  
  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterSectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  letter-spacing: 0.05em;
`;

const FilterGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  color: var(--color-text);
  background-color: var(--color-background);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
  }
  
  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236E6E6E' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
  }
`;

const PriceRangeInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  align-items: center;
`;

const RangeSeparator = styled.span`
  text-align: center;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const MainContentArea = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  
  @media (max-width: 768px) {
    overflow-x: hidden;
  }
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
    padding: 0 0.75rem;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  position: relative;
  width: 100%;
  padding: 0 1rem;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 768px) {
    margin: 0 -0.75rem 1.5rem -0.75rem;
    padding: 0 0.75rem;
    width: calc(100% + 1.5rem);
    justify-content: flex-start;
    
    &::after {
      display: none;
    }
  }
`;

const TabButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$isActive ? 'var(--color-primary)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: fit-content;
  
  &:hover {
    color: var(--color-primary);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    text-align: center;
  }
`;

const SubTabsContainer = styled(TabsContainer)`
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    margin: 0.5rem -0.75rem 1rem -0.75rem;
    padding: 0 0.75rem;
    width: calc(100% + 1.5rem);
    justify-content: flex-start;
    gap: 0.5rem;
  }
`;

const SubTabButton = styled(TabButton)`
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  min-width: fit-content;
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
    white-space: nowrap;
  }
`;

const TabCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${props => props.$isActive ? 'var(--color-primary)' : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.$isActive ? 'white' : 'var(--color-text-secondary)'};
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
  padding: 0 0.5rem;
  transition: all 0.25s ease;
  
  @media (max-width: 768px) {
    min-width: 18px;
    height: 18px;
    font-size: 0.65rem;
    margin-left: 0;
    padding: 0 0.25rem;
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const SortLabel = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const SortSelect = styled.select`
  padding: 0.65rem 2rem 0.65rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.875rem;
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236E6E6E' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  
  @media (max-width: 768px) {
    flex: 1;
    max-width: none;
  }
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
  }
`;

const ResultsCount = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  padding: 0.5rem 0;
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const ViewToggleButton = styled.button`
  padding: 0.5rem 0.75rem;
  background-color: ${props => props.active ? 'var(--color-primary)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--color-text-secondary)'};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  &:hover {
    background-color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-background-hover)'};
  }
  
  &:focus {
    outline: none;
    box-shadow: ${props => props.active ? 'inset 0 0 0 2px rgba(255, 255, 255, 0.5)' : 'none'};
  }
`;

const AuctionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin: 0 -0.75rem;
    width: calc(100% + 1.5rem);
  }
`;

const GridItemWrapper = styled.div`
  width: 100%;
  
  @media (min-width: 769px) {
    max-width: 380px;
    justify-self: center;
  }
  
  @media (max-width: 768px) {
    max-width: none;
    padding: 0 0.75rem;
  }
`;

const AuctionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 3rem;
  width: 100%;
  
  @media (max-width: 768px) {
    gap: 1rem;
    margin: 0 -0.75rem;
    width: calc(100% + 1.5rem);
  }
`;

const AuctionCard = styled.div`
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.03);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    border-color: var(--color-primary-light);
    
    @media (max-width: 768px) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    opacity: 0;
    border-radius: 16px;
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15);
    transition: opacity 0.3s ease-in-out;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const AuctionListItem = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.03);
  display: grid;
  grid-template-columns: 180px 1fr auto;
  overflow: hidden;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    border-color: var(--color-primary-light);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    width: 100%;
    margin: 0 auto;
  }
  
  @media (min-width: 769px) and (max-width: 1200px) {
    grid-template-columns: 140px 1fr auto;
  }
`;

const ListItemImage = styled.div`
  background-color: var(--color-background);
  height: 100%;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.2) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }
  
  ${AuctionListItem}:hover &::before {
    opacity: 1;
  }
  
  svg {
    width: 3rem;
    height: 3rem;
    color: var(--color-primary);
    opacity: 0.5;
  }
  
  @media (max-width: 768px) {
    height: 200px;
    width: 100%;
  }
`;

const ListItemContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ListItemActions = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-top: 1px solid var(--color-border);
    background-color: rgba(0, 0, 0, 0.01);
  }
`;

const AuctionImage = styled.div`
  height: 180px;
  background-color: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 1400px) {
    height: 160px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.2) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }
  
  ${AuctionCard}:hover &::before {
    opacity: 1;
  }
  
  svg {
    width: 3.5rem;
    height: 3.5rem;
    color: var(--color-primary);
    opacity: 0.5;
  }
`;

const PropertyTypeTag = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const AuctionContent = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const AuctionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text);
  line-height: 1.4;
  
  ${AuctionCard}:hover &, ${AuctionListItem}:hover & {
    color: var(--color-primary);
  }
`;

const AuctionLocation = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  
  svg {
    width: 1rem;
    height: 1rem;
    margin-right: 0.375rem;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }
`;

const AuctionDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
`;

const AuctionPrice = styled.p`
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1.125rem;
`;

const AuctionStatus = styled.span`
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background-color: ${props => 
    props.status === 'active' ? 'rgba(5, 150, 105, 0.1)' : 
    props.status === 'upcoming' ? 'rgba(37, 99, 235, 0.1)' : 
    props.status === 'offer' ? 'rgba(217, 119, 6, 0.1)' : 
    'rgba(107, 114, 128, 0.1)'
  };
  color: ${props => 
    props.status === 'active' ? 'rgb(5, 150, 105)' : 
    props.status === 'upcoming' ? 'rgb(37, 99, 235)' : 
    props.status === 'offer' ? 'rgb(217, 119, 6)' : 
    'rgb(107, 114, 128)'
  };
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;

const ListItemPriceAndStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const CountdownWrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
`;

const PropertyInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 0.75rem 0;
  
  @media (max-width: 1200px) {
    gap: 0.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
`;

const PropertyInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  
  svg {
    width: 1rem;
    height: 1rem;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }
`;

const EmptyState = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px dashed var(--color-border);
  margin: 1rem 0 3rem;
`;

const EmptyStateIcon = styled.div`
  margin-bottom: 2rem;
  
  svg {
    width: 5rem;
    height: 5rem;
    color: var(--color-text-secondary);
    opacity: 0.3;
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
`;

const EmptyStateMessage = styled.p`
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  max-width: 500px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const RefreshButton = styled.button`
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 auto;
  color: var(--color-text);
  
  &:hover {
    background-color: var(--color-background-hover);
    border-color: var(--color-text-secondary);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`;

const ApplyFiltersButton = styled(Button)`
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.25);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(var(--color-primary-rgb), 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ClearFiltersButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  margin-top: 0.75rem;
  width: 100%;
  padding: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    text-decoration: underline;
    color: var(--color-primary-dark);
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 3rem;
`;

const PageButton = styled.button`
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.active ? 'var(--color-primary)' : 'var(--color-border)'};
  background-color: ${props => props.active ? 'var(--color-primary)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--color-text)'};
  border-radius: 10px;
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--color-primary);
    color: ${props => props.active ? 'white' : 'var(--color-primary)'};
    background-color: ${props => props.active ? 'var(--color-primary)' : 'rgba(var(--color-primary-rgb), 0.05)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: var(--color-border);
    color: var(--color-text-secondary);
    background-color: white;
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const PaginationEllipsis = styled.span`
  color: var(--color-text-secondary);
  padding: 0 0.5rem;
  font-weight: 600;
`;

const MultiSelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const MultiSelectBox = styled.div`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 50px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
  }
`;

const MobileFilterButton = styled.div`
  display: none;
  width: 100%;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMultiSelectWrapper = styled(MultiSelectWrapper)`
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MobileMultiSelectBox = styled(MultiSelectBox)`
  @media (max-width: 768px) {
    background-color: white;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    min-height: 44px;
    padding: 0.5rem 1rem;
  }
`;

const MobileFilterOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: ${props => props.isOpen ? 'block' : 'none'};
  backdrop-filter: blur(4px);
  transition: opacity 0.3s ease;
  opacity: ${props => props.isOpen ? 1 : 0};
`;

const MobileFilterPanel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 1.75rem;
  z-index: 101;
  max-height: 85vh;
  overflow-y: auto;
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(100%)'};
  transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15);
`;

const MobileFilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
`;

const MobileFilterTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  border-radius: 50%;
  transition: all 0.2s ease;
  
  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  &:hover {
    color: var(--color-text);
    background-color: var(--color-background-hover);
  }
`;

const MobileFilterActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  position: sticky;
  bottom: 0;
  background-color: white;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
`;

const BadgeCount = styled.span`
  background-color: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  min-width: 1.5rem;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  
  &:after {
    content: " ";
    display: block;
    border-radius: 50%;
    width: 0;
    height: 0;
    margin: 8px;
    box-sizing: border-box;
    border: 32px solid var(--color-primary);
    border-color: var(--color-primary) transparent var(--color-primary) transparent;
    animation: spinner 1.2s infinite;
  }
  
  @keyframes spinner {
    0% {
      transform: rotate(0);
      animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const RangeSlider = styled.div`
  margin: 2rem 0 1rem;
  position: relative;
`;

const SliderTrack = styled.div`
  height: 6px;
  background-color: var(--color-background);
  border-radius: 3px;
  position: relative;
`;

const SliderRange = styled.div`
  position: absolute;
  height: 6px;
  background-color: var(--color-primary);
  border-radius: 3px;
`;

const SliderThumb = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid var(--color-primary);
  position: absolute;
  top: -7px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(1.15);
  }
`;

const SliderValues = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

// Icon components for better UI
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const GridViewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ListViewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AreaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18v18H3z"/>
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"></polyline>
    <polyline points="23 20 23 14 17 14"></polyline>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
  </svg>
);

// Turkish cities list in alphabetical order
const turkishCities = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir',
  'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
  'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

const DesktopFilterContainer = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }
`;

const SelectedCities = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 95%;
`;

const CityTag = styled.span`
  background-color: rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-primary-dark);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: 0.25rem;
    color: var(--color-primary);
    
    &:hover {
      color: var(--color-primary-dark);
    }
    
    svg {
      width: 0.9rem;
      height: 0.9rem;
    }
  }
`;

const DropdownIcon = styled.div`
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.2s ease;
  display: flex;
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const CityDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.95rem;
  background-color: white;
  
  &:focus {
    outline: none;
  }
`;

const CityOption = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: var(--color-background-hover);
  }
  
  input {
    margin-right: 0.75rem;
  }
`;

const MobileFiltersButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileFiltersPanel = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileFiltersPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
`;

const MobileFiltersPanelTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
`;

const MobileFiltersPanelClose = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  
  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const ContentControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    padding: 0 0.75rem;
  }
`;

// Function to get formatted location with city first
const getFormattedLocation = (auction) => {
  // If location is an object with city and district
  if (auction.location && typeof auction.location === 'object') {
    const city = auction.location.city;
    const district = auction.location.district;
    if (city && district) return `${city}, ${district}`;
    if (city) return city;
  }
  
  // If location is a string and has commas, assume district/city format and reverse it
  if (auction.location && typeof auction.location === 'string' && auction.location.includes(',')) {
    return auction.location.split(',').reverse().join(', ').trim();
  }
  
  // If just a string without commas, return as is
  if (auction.location && typeof auction.location === 'string') {
    return auction.location;
  }
  
  // If separate city/district fields
  if (auction.city || auction.district) {
    const parts = [];
    if (auction.city) parts.push(auction.city);
    if (auction.district) parts.push(auction.district);
    return parts.join(', ');
  }
  
  return 'Konum bilgisi yok';
};

const Auctions = () => {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState('new'); // 'auction', 'offer', or 'new'
  const [auctionStatus, setAuctionStatus] = useState('active'); // 'active', 'upcoming', or 'ended'
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    active: 0,
    upcoming: 0,
    ended: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and sorting state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    location: '',
    cities: [],
    minPrice: '',
    maxPrice: '',
    status: 'all'
  });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // City dropdown state
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [mobileCityDropdownOpen, setMobileCityDropdownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [mobileCitySearch, setMobileCitySearch] = useState('');
  
  // Filter cities based on search
  const filteredCities = citySearch 
    ? turkishCities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()))
    : turkishCities;
    
  const filteredMobileCities = mobileCitySearch 
    ? turkishCities.filter(city => city.toLowerCase().includes(mobileCitySearch.toLowerCase()))
    : turkishCities;
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 12 : 8;
  
  // Get active filter count
  const getActiveFilterCount = () => {
    return filters.cities.length > 0 ? 1 : 0;
  };
  
  // Function to load auctions
  const loadListings = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      let data, error;

      if (listingType === 'auction') {
        const result = await fetchAuctions(forceRefresh);
        data = result.data;
        error = result.error;
      } else if (listingType === 'offer') {
        const result = await fetchNegotiations(forceRefresh);
        data = result.data;
        error = result.error;
      } else if (listingType === 'new') {
        // For "Yeni Eklenenler", fetch both auctions and offers
        const auctionsResult = await fetchAuctions(forceRefresh);
        const offersResult = await fetchNegotiations(forceRefresh);
        
        if (auctionsResult.error || offersResult.error) {
          error = auctionsResult.error || offersResult.error;
        } else {
          // Explicitly tag auction and offer items
          const taggedAuctions = auctionsResult.data?.map(auction => ({
            ...auction,
            _source_type: 'auction',
            _display_type: 'auction',
            listing_type: 'auction'
          })) || [];
          
          const taggedOffers = offersResult.data?.map(offer => ({
            ...offer,
            _source_type: 'offer',
            _display_type: 'offer',
            listing_type: 'offer'
          })) || [];
          
          // Combine both data sets
          data = [...taggedAuctions, ...taggedOffers];
          
          // Filter for new listings (within the last 7 days)
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          data = data.filter(listing => {
            const createdAt = new Date(listing.created_at);
            return createdAt >= oneWeekAgo;
          });
          
          // Log counts for debugging
          console.log("Yeni Eklenenler counts:", {
            auctions: taggedAuctions.length,
            offers: taggedOffers.length,
            combined_filtered: data.length
          });
          
          // Sort by created_at date, newest first
          data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
      }

      if (error) throw error;

      if (listingType === 'auction') {
        // Calculate counts for each status
        const now = new Date();
        const counts = {
          active: 0,
          upcoming: 0,
          ended: 0
        };

        data.forEach(auction => {
          const startTime = new Date(auction.start_time || auction.startTime);
          const endTime = new Date(auction.end_time || auction.endTime);
          
          if (now >= startTime && now <= endTime) {
            counts.active++;
          } else if (now < startTime) {
            counts.upcoming++;
          } else {
            counts.ended++;
          }
        });

        setStatusCounts(counts);
      }

      setListings(data || []);
      // For offer type, don't apply status filtering
      if (listingType === 'auction') {
        applyFiltersAndSort(data || []);
      } else {
        setFilteredListings(data || []);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to filter auctions by status
  const filterAuctionsByStatus = (auctions, status) => {
    const now = new Date();
    
    return auctions.filter(auction => {
      const startTime = new Date(auction.start_time || auction.startTime);
      const endTime = new Date(auction.end_time || auction.endTime);
      
      switch (status) {
        case 'active':
          return now >= startTime && now <= endTime;
        case 'upcoming':
          return now < startTime;
        case 'ended':
          return now > endTime;
        default:
          return true;
      }
    });
  };
  
  // Function to apply filters and sort
  const applyFiltersAndSort = (listingsList) => {
    if (!listingsList || !Array.isArray(listingsList)) {
      console.error('Invalid listingsList in applyFiltersAndSort:', listingsList);
      setFilteredListings([]);
      return;
    }
    
    setIsFiltering(true);
    
    try {
      // First, filter by status if needed
      let filtered = [...listingsList];
      
      if (listingType === 'auction') {
        filtered = filterAuctionsByStatus(filtered, auctionStatus);
      }
      
      // Then apply location filters
      if (filters.cities && filters.cities.length > 0) {
        filtered = filtered.filter(listing => {
          // Check if listing location contains any of the selected cities
          if (!listing.location) return false;
          return filters.cities.some(city => 
            listing.location.toLowerCase().includes(city.toLowerCase())
          );
        });
      }
      
      // Apply sorting
      if (sortOption === 'priceAsc') {
        filtered.sort((a, b) => {
          const aPrice = a.starting_price || a.startingPrice || 0;
          const bPrice = b.starting_price || b.startingPrice || 0;
          return aPrice - bPrice;
        });
      } else if (sortOption === 'priceDesc') {
        filtered.sort((a, b) => {
          const aPrice = a.starting_price || a.startingPrice || 0;
          const bPrice = b.starting_price || b.startingPrice || 0;
          return bPrice - aPrice;
        });
      } else if (sortOption === 'newest') {
        filtered.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
      } else if (sortOption === 'endingSoon' && listingType === 'auction') {
        const now = new Date();
        filtered.sort((a, b) => {
          const aEndTime = new Date(a.end_time || a.endTime);
          const bEndTime = new Date(b.end_time || b.endTime);
          
          // Only sort active auctions by end time
          const aIsActive = now <= aEndTime;
          const bIsActive = now <= bEndTime;
          
          if (aIsActive && bIsActive) {
            return aEndTime - bEndTime;
          } else if (aIsActive) {
            return -1;
          } else if (bIsActive) {
            return 1;
          } else {
            // Default to newest for non-active auctions
            return new Date(b.created_at) - new Date(a.created_at);
          }
        });
      }
      
      setFilteredListings(filtered);
      setCurrentPage(1); // Reset to first page after filtering
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsFiltering(false);
    }
  };
  
  // Functions to handle city selection
  const handleCitySelect = (city) => {
    setFilters(prev => {
      // If city is already selected, remove it
      if (prev.cities.includes(city)) {
        return {
          ...prev,
          cities: prev.cities.filter(c => c !== city)
        };
      }
      // Otherwise add it
      return {
        ...prev,
        cities: [...prev.cities, city]
      };
    });
  };
  
  const handleRemoveCity = (city) => {
    setFilters(prev => ({
      ...prev,
      cities: prev.cities.filter(c => c !== city)
    }));
  };
  
  // Function to clear all cities
  const clearSelectedCities = () => {
    setFilters(prev => ({
      ...prev,
      cities: []
    }));
    setCitySearch('');
    setMobileCitySearch('');
  };
  
  // Function to handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Function to apply filters
  const applyFilters = () => {
    applyFiltersAndSort(listings);
    setMobileFiltersOpen(false);
  };
  
  // Function to clear all filters
  const clearFilters = () => {
    setFilters({
      ...filters,
      cities: []
    });
    
    setCitySearch('');
    setMobileCitySearch('');
    
    // Apply the cleared filters
    setTimeout(() => {
      applyFiltersAndSort(listings);
    }, 0);
  };
  
  // Get paginated auctions
  const getPaginatedListings = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredListings.slice(startIndex, endIndex);
  };
  
  // Get total pages
  const getTotalPages = () => {
    return Math.ceil(filteredListings.length / itemsPerPage);
  };
  
  // Inside the Auctions component
  useEffect(() => {
    // Load auctions on mount
    loadListings();
    
    // Set up visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastRefreshTime = parseInt(localStorage.getItem('auctions_last_refresh') || '0', 10);
        const now = Date.now();
        
        // If it's been more than a minute since last refresh when tab becomes visible
        if (now - lastRefreshTime > 60 * 1000) {
          console.log('[Auctions] Page became visible, refreshing data');
          loadListings(true);
        }
      }
    };
    
    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Effect to update filtered auctions when active tab or filters change
  useEffect(() => {
    if (listings) {
      // Only apply status filtering for auction type
      if (listingType === 'auction') {
        applyFiltersAndSort(listings);
      } else {
        // For offer type, just apply regular filters without status filtering
        setFilteredListings(listings);
      }
    }
  }, [sortOption, auctionStatus]); // Add auctionStatus back to dependencies
  
  // Effect to reload listings when listing type changes
  useEffect(() => {
    loadListings(true); // Force refresh when switching types
  }, [listingType]);
  
  // Render filter panel for the horizontal layout
  const renderFilterPanel = () => {
    return (
      <FiltersPanel>
        <div style={{ flex: 1, maxWidth: '600px' }}>
          <FilterGroup style={{ marginBottom: 0 }}>
            <FilterLabel htmlFor="city-select">Şehir Seçiniz</FilterLabel>
            <MultiSelectWrapper className="city-dropdown">
              <MultiSelectBox 
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              >
                <SelectedCities>
                  {filters.cities.length === 0 ? (
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Tüm Şehirler</span>
                  ) : (
                    filters.cities.map(city => (
                      <CityTag key={city}>
                        {city}
                        <button onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCity(city);
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </CityTag>
                    ))
                  )}
                </SelectedCities>
                <DropdownIcon isOpen={cityDropdownOpen}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </DropdownIcon>
              </MultiSelectBox>
              
              <CityDropdown isOpen={cityDropdownOpen} className="city-dropdown">
                <SearchInput 
                  placeholder="Şehir ara..." 
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredCities.map(city => (
                    <CityOption key={city} onClick={(e) => {
                      e.stopPropagation();
                      handleCitySelect(city);
                    }}>
                      <input 
                        type="checkbox" 
                        checked={filters.cities.includes(city)}
                        onChange={() => {}} // Handled by the parent click
                      />
                      {city}
                    </CityOption>
                  ))}
                  {filteredCities.length === 0 && (
                    <div style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>
                      Sonuç bulunamadı
                    </div>
                  )}
                </div>
              </CityDropdown>
            </MultiSelectWrapper>
          </FilterGroup>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <ApplyFiltersButton 
            onClick={applyFilters} 
            variant="primary" 
            style={{ 
              marginTop: 0, 
              width: 'auto', 
              minWidth: '150px', 
              height: '50px'
            }}
          >
            Filtreleri Uygula
          </ApplyFiltersButton>
          
          {filters.cities.length > 0 && (
            <ClearFiltersButton 
              onClick={clearFilters} 
              style={{ 
                marginTop: 0, 
                marginBottom: '9px',
                padding: '0.75rem',
                height: 'auto'
              }}
            >
              Temizle
            </ClearFiltersButton>
          )}
        </div>
      </FiltersPanel>
    );
  };

  // Handle tab switch
  const handleTabSwitch = (tab) => {
    setListingType(tab);
  };
  
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0 ₺';
    
    // If price is already a string with currency formatting, return it
    if (typeof price === 'string' && price.includes('₺')) {
      // Convert old format (₺ on left) to new format (₺ on right)
      if (price.startsWith('₺')) {
        return price.substring(1).trim() + ' ₺';
      }
      return price;
    }
    
    // Convert to number if it's a string number
    if (typeof price === 'string') {
      price = parseFloat(price);
    }
    
    // Handle NaN
    if (isNaN(price)) return '0 ₺';
    
    // Format the number with ₺ on the right
    return new Intl.NumberFormat('tr-TR', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(price) + ' ₺';
  };
  
  const handleAuctionClick = (auctionId) => {
    navigate(`/auctions/${auctionId}`);
  };
  
  const getStatusText = (status, listingType, item) => {
    // For items in the 'new' tab, check if they're auctions or offers
    if (listingType === 'new') {
      // Check if the item is an offer using our explicitly tagged types
      const isOffer = item && (
        item._source_type === 'offer' ||
        item._display_type === 'offer' ||
        item.listing_type === 'offer'
      );
      return isOffer ? 'Satın al' : 'Açık Arttırma';
    }
    
    // For normal tab display
    switch (status) {
      case 'active': return 'Aktif';
      case 'upcoming': return 'Yaklaşan';
      case 'ended': case 'past': return 'Sonlandı';
      default: return '';
    }
  };
  
  const getStatusIcon = (status, listingType, item) => {
    // For items in the 'new' tab, check if they're auctions or offers
    if (listingType === 'new') {
      // Check if the item is an offer using our explicitly tagged types
      const isOffer = item && (
        item._source_type === 'offer' ||
        item._display_type === 'offer' ||
        item.listing_type === 'offer'
      );
      
      if (isOffer) {
        // Icon for offers/negotiations
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        );
      }
    }
    
    // Default status icons
    switch (status) {
      case 'active':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
        );
      case 'upcoming':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        );
    }
  };
  
  // Render auction in grid view
  const renderAuctionCard = (auction) => {
    // Determine if we're in the "new" tab and what type this listing is
    const isNewTab = listingType === 'new';
    const isOffer = auction && (
      auction._source_type === 'offer' || 
      auction._display_type === 'offer' ||
      auction.listing_type === 'offer'
    );
    const itemStatus = isNewTab ? (isOffer ? 'offer' : 'auction') : listingType;
    
    return (
      <AuctionCard onClick={() => handleAuctionClick(auction.id)}>
        <AuctionImage>
          {auction.property_type && (
            <PropertyTypeTag>{auction.property_type}</PropertyTypeTag>
          )}
          {auction.images && auction.images.length > 0 ? (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              backgroundImage: `url(${auction.images[0]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )}
        </AuctionImage>
        <AuctionContent>
          <AuctionTitle>{auction.title || 'Arsa'}</AuctionTitle>
          <AuctionLocation>
            <LocationIcon />
            {getFormattedLocation(auction)}
          </AuctionLocation>
          
          <PropertyInfoGrid>
            {auction.area_size && (
              <PropertyInfoItem>
                <AreaIcon />
                <span>{auction.area_size} {auction.area_unit || 'm²'}</span>
              </PropertyInfoItem>
            )}
            {auction.ada_no && (
              <PropertyInfoItem>
                <DocumentIcon />
                <span>Ada: {auction.ada_no}</span>
              </PropertyInfoItem>
            )}
            {auction.parsel_no && (
              <PropertyInfoItem>
                <DocumentIcon />
                <span>Parsel: {auction.parsel_no}</span>
              </PropertyInfoItem>
            )}
            {auction.document_type && (
              <PropertyInfoItem>
                <DocumentIcon />
                <span>{auction.document_type}</span>
              </PropertyInfoItem>
            )}
          </PropertyInfoGrid>
          
          <AuctionDetails>
            <div style={{display:'flex',flexDirection:'column'}}>
              <span style={{fontSize:'0.75rem',color:'var(--color-text-secondary)',marginBottom:'0.1rem'}}>Başlangıç Fiyatı</span>
              <AuctionPrice>
                {formatPrice(
                  itemStatus === 'upcoming' 
                    ? (auction.starting_price || auction.startingPrice)
                    : (auction.highest_bid || auction.final_price || auction.finalPrice || auction.starting_price || auction.startingPrice)
                )}
              </AuctionPrice>
            </div>
            <AuctionStatus status={itemStatus}>
              {getStatusIcon(itemStatus, listingType, auction)}
              {getStatusText(itemStatus, listingType, auction)}
            </AuctionStatus>
          </AuctionDetails>
          {!isOffer && itemStatus === 'active' && (auction.end_time || auction.endTime) && (
            <CountdownWrapper>
              <CountdownTimer 
                endTime={auction.end_time || auction.endTime || auction.end_date} 
                compact={true}
                auctionId={auction.id}
              />
            </CountdownWrapper>
          )}
        </AuctionContent>
      </AuctionCard>
    );
  };
  
  // Render auctions based on view mode
  const renderAuctions = () => {
    if (loading) {
      return (
        <EmptyState>
          <LoadingSpinner />
          <EmptyStateTitle>Veriler Yükleniyor</EmptyStateTitle>
          <EmptyStateMessage>Lütfen bekleyin, ihale bilgileri yükleniyor...</EmptyStateMessage>
        </EmptyState>
      );
    }
    
    if (error) {
      return (
        <EmptyState>
          <EmptyStateIcon>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>Hata Oluştu</EmptyStateTitle>
          <EmptyStateMessage>{error}</EmptyStateMessage>
          <RefreshButton onClick={() => loadListings(true)}>
            <RefreshIcon />
            Yenile
          </RefreshButton>
        </EmptyState>
      );
    }
    
    if (isFiltering) {
      return (
        <EmptyState>
          <LoadingSpinner />
          <EmptyStateTitle>Filtreleniyor</EmptyStateTitle>
          <EmptyStateMessage>İhaleler filtreleniyor, lütfen bekleyin...</EmptyStateMessage>
        </EmptyState>
      );
    }
    
    const paginatedAuctions = getPaginatedListings();
    
    if (filteredListings.length === 0) {
      return (
        <EmptyState>
          <EmptyStateIcon>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>
            {Object.values(filters).some(value => value && value !== 'all') 
              ? 'Arama Kriterlerine Uygun İhale Bulunamadı'
              : listingType === 'active' 
                ? 'Aktif İhale Bulunamadı' 
                : listingType === 'upcoming' 
                  ? 'Yaklaşan İhale Bulunamadı' 
                  : 'Geçmiş İhale Bulunamadı'
            }
          </EmptyStateTitle>
          <EmptyStateMessage>
            {Object.values(filters).some(value => value && value !== 'all')
              ? 'Lütfen farklı filtreleme kriterleri ile tekrar deneyin veya tüm filtreleri temizleyin.'
              : listingType === 'active' 
                ? 'Şu anda aktif bir ihale bulunmamaktadır. Lütfen daha sonra tekrar kontrol edin.' 
                : listingType === 'upcoming' 
                  ? 'Şu anda planlanmış yaklaşan ihale bulunmamaktadır.' 
                  : 'Geçmiş ihaleler bulunamadı.'
            }
          </EmptyStateMessage>
          {Object.values(filters).some(value => value && value !== 'all') && (
            <RefreshButton onClick={clearFilters}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
              Filtreleri Temizle
          </RefreshButton>
          )}
        </EmptyState>
      );
    }
    
    if (viewMode === 'grid') {
      return (
        <>
          <AuctionsGrid>
            {getPaginatedListings().map(auction => (
              <GridItemWrapper key={auction.id}>
                {renderAuctionCard(auction)}
              </GridItemWrapper>
            ))}
          </AuctionsGrid>
          {renderPagination()}
        </>
      );
    } else {
      return (
        <>
          <AuctionsList>
            {getPaginatedListings().map(auction => renderAuctionListItem(auction))}
          </AuctionsList>
          {renderPagination()}
        </>
      );
    }
  };

  // Render pagination
  const renderPagination = () => {
    const totalPages = getTotalPages();
    
    if (totalPages <= 1) return null;
    
    // Logic to determine which page buttons to show
    const renderPageButtons = () => {
      const buttons = [];
      
      if (totalPages <= 5) {
        // Show all pages if total is 5 or less
        for (let i = 1; i <= totalPages; i++) {
          buttons.push(
            <PageButton 
              key={i} 
              active={currentPage === i} 
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PageButton>
          );
        }
      } else {
        // Always show first page
        buttons.push(
          <PageButton 
            key={1} 
            active={currentPage === 1} 
            onClick={() => setCurrentPage(1)}
          >
            1
          </PageButton>
        );
        
        // Show ellipsis if current page is > 3
        if (currentPage > 3) {
          buttons.push(<PaginationEllipsis key="ellipsis1">...</PaginationEllipsis>);
        }
        
        // Show pages around current page
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = startPage; i <= endPage; i++) {
          buttons.push(
            <PageButton 
              key={i} 
              active={currentPage === i} 
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PageButton>
          );
        }
        
        // Show ellipsis if current page is < totalPages - 2
        if (currentPage < totalPages - 2) {
          buttons.push(<PaginationEllipsis key="ellipsis2">...</PaginationEllipsis>);
        }
        
        // Always show last page
        buttons.push(
          <PageButton 
            key={totalPages} 
            active={currentPage === totalPages} 
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </PageButton>
        );
      }
      
      return buttons;
    };
    
    return (
      <Pagination>
        <PageButton 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </PageButton>
        
        {renderPageButtons()}
        
        <PageButton 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </PageButton>
      </Pagination>
    );
  };

  // Render auction in list view
  const renderAuctionListItem = (auction) => {
    // Determine if we're in the "new" tab and what type this listing is
    const isNewTab = listingType === 'new';
    const isOffer = auction && (
      auction._source_type === 'offer' || 
      auction._display_type === 'offer' ||
      auction.listing_type === 'offer'
    );
    const itemStatus = isNewTab ? (isOffer ? 'offer' : 'auction') : listingType;
    
    return (
      <AuctionListItem key={auction.id} onClick={() => handleAuctionClick(auction.id)}>
        <ListItemImage>
          {auction.property_type && (
            <PropertyTypeTag>{auction.property_type}</PropertyTypeTag>
          )}
          {auction.images && auction.images.length > 0 ? (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              backgroundImage: `url(${auction.images[0]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )}
        </ListItemImage>
        <ListItemContent>
          <AuctionTitle>{auction.title || 'Arsa'}</AuctionTitle>
          <AuctionLocation>
            <LocationIcon />
            {getFormattedLocation(auction)}
          </AuctionLocation>
          
          <PropertyInfoGrid>
            {auction.area_size && (
              <PropertyInfoItem>
                <AreaIcon />
                <span>{auction.area_size} {auction.area_unit || 'm²'}</span>
              </PropertyInfoItem>
            )}
            {auction.ada_no && (
              <PropertyInfoItem>
                <DocumentIcon />
                <span>Ada: {auction.ada_no}</span>
              </PropertyInfoItem>
            )}
            {auction.parsel_no && (
              <PropertyInfoItem>
                <DocumentIcon />
                <span>Parsel: {auction.parsel_no}</span>
              </PropertyInfoItem>
            )}
            {auction.document_type && (
              <PropertyInfoItem>
                <DocumentIcon />
                <span>{auction.document_type}</span>
              </PropertyInfoItem>
            )}
          </PropertyInfoGrid>
        </ListItemContent>
        <ListItemActions>
          <ListItemPriceAndStatus>
            <AuctionPrice>
              {formatPrice(
                itemStatus === 'upcoming' 
                  ? (auction.starting_price || auction.startingPrice)
                  : (auction.highest_bid || auction.final_price || auction.finalPrice || auction.starting_price || auction.startingPrice)
              )}
            </AuctionPrice>
            <AuctionStatus status={itemStatus}>
              {getStatusIcon(itemStatus, listingType, auction)}
              {getStatusText(itemStatus, listingType, auction)}
            </AuctionStatus>
          </ListItemPriceAndStatus>
          {!isOffer && itemStatus === 'active' && (auction.end_time || auction.endTime) && (
            <CountdownTimer 
              endTime={auction.end_time || auction.endTime || auction.end_date} 
              compact={true}
              auctionId={auction.id}
            />
          )}
        </ListItemActions>
      </AuctionListItem>
    );
  };

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if we're clicking inside any city dropdown component
      if (event.target.closest('.city-dropdown') || event.target.closest('.mobile-city-dropdown')) {
        return;
      }
      
      // Only close dropdowns if we clicked outside
      setCityDropdownOpen(false);
      setMobileCityDropdownOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <PageDescription>
          Türkiye'nin dört bir yanındaki değerli araziler için ihale tekliflerinizi verin.
        </PageDescription>
      </PageHeader>

      <FiltersAndContentWrapper>
        <ContentHeader>
          <div>
            <TabsContainer>
              <TabButton
                $isActive={listingType === 'new'}
                onClick={() => setListingType('new')}
              >
                Yeni Eklenenler
              </TabButton>
              <TabButton
                $isActive={listingType === 'auction'}
                onClick={() => setListingType('auction')}
              >
                Açık Arttırmalar
              </TabButton>
              <TabButton
                $isActive={listingType === 'offer'}
                onClick={() => setListingType('offer')}
              >
                Satın Al
              </TabButton>
            </TabsContainer>

            {listingType === 'auction' && (
              <SubTabsContainer>
                <SubTabButton
                  $isActive={auctionStatus === 'active'}
                  onClick={() => setAuctionStatus('active')}
                >
                  Aktif İhaleler
                  {statusCounts.active > 0 && (
                    <TabCount $isActive={auctionStatus === 'active'}>
                      {statusCounts.active}
                    </TabCount>
                  )}
                </SubTabButton>
                <SubTabButton
                  $isActive={auctionStatus === 'upcoming'}
                  onClick={() => setAuctionStatus('upcoming')}
                >
                  Yaklaşan İhaleler
                  {statusCounts.upcoming > 0 && (
                    <TabCount $isActive={auctionStatus === 'upcoming'}>
                      {statusCounts.upcoming}
                    </TabCount>
                  )}
                </SubTabButton>
                <SubTabButton
                  $isActive={auctionStatus === 'ended'}
                  onClick={() => setAuctionStatus('ended')}
                >
                  Sonlanan İhaleler
                  {statusCounts.ended > 0 && (
                    <TabCount $isActive={auctionStatus === 'ended'}>
                      {statusCounts.ended}
                    </TabCount>
                  )}
                </SubTabButton>
              </SubTabsContainer>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%' }}>
            <MobileFilterButton>
              <MobileMultiSelectWrapper className="mobile-city-dropdown">
                <MobileMultiSelectBox 
                  onClick={() => setMobileCityDropdownOpen(!mobileCityDropdownOpen)}
                >
                  <SelectedCities>
                    {filters.cities.length === 0 ? (
                      <span style={{ color: 'var(--color-text-tertiary)' }}>Şehir Seçiniz</span>
                    ) : (
                      filters.cities.map(city => (
                        <CityTag key={city}>
                          {city}
                          <button onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCity(city);
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </CityTag>
                      ))
                    )}
                  </SelectedCities>
                  <DropdownIcon isOpen={mobileCityDropdownOpen}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </DropdownIcon>
                </MobileMultiSelectBox>
                
                <CityDropdown isOpen={mobileCityDropdownOpen} className="mobile-city-dropdown">
                  <SearchInput 
                    placeholder="Şehir ara..." 
                    value={mobileCitySearch}
                    onChange={(e) => setMobileCitySearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredMobileCities.map(city => (
                      <CityOption key={city} onClick={(e) => {
                        e.stopPropagation();
                        handleCitySelect(city);
                      }}>
                        <input 
                          type="checkbox" 
                          checked={filters.cities.includes(city)}
                          onChange={() => {}} // Handled by the parent click
                        />
                        {city}
                      </CityOption>
                    ))}
                    {filteredMobileCities.length === 0 && (
                      <div style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>
                        Sonuç bulunamadı
                      </div>
                    )}
                  </div>
                </CityDropdown>
              </MobileMultiSelectWrapper>
            </MobileFilterButton>
            
            <ResultsCount>
              {filteredListings.length} sonuç bulundu
            </ResultsCount>
          </div>
        </ContentHeader>

        {renderFilterPanel()}
        
        <MainContentArea>
          {renderAuctions()}
        </MainContentArea>
      </FiltersAndContentWrapper>
    </PageContainer>
  );
};

export default Auctions; 
