import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { getFilteredAuctions, fetchAuctions } from '../services/auctionService';
import { supabase } from '../services/supabase';
import CountdownTimer from '../components/CountdownTimer';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const DashboardHeader = styled.div`
  margin-bottom: 2rem;
`;

const WelcomeMessage = styled.h1`
  font-size: 1.75rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: var(--color-text-secondary);
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
`;

const StatValue = styled.p`
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
`;

const AuctionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 3rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const AuctionCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
`;

const AuctionImage = styled.div`
  height: 150px;
  background-color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  svg {
    width: 3rem;
    height: 3rem;
    color: var(--color-primary);
  }
`;

const AuctionContent = styled.div`
  padding: 1.5rem;
`;

const AuctionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
`;

const AuctionLocation = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
`;

const AuctionDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
`;

const AuctionPrice = styled.p`
  font-weight: 600;
  color: var(--color-success);
`;

const AuctionStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => 
    props.status === 'active' ? 'rgba(5, 150, 105, 0.1)' : 
    props.status === 'upcoming' ? 'rgba(37, 99, 235, 0.1)' : 
    'rgba(107, 114, 128, 0.1)'
  };
  color: ${props => 
    props.status === 'active' ? 'rgb(5, 150, 105)' : 
    props.status === 'upcoming' ? 'rgb(37, 99, 235)' : 
    'rgb(107, 114, 128)'
  };
`;

const EmptyState = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  padding: 3rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
`;

const EmptyStateIcon = styled.div`
  margin-bottom: 1.5rem;
  
  svg {
    width: 3rem;
    height: 3rem;
    color: var(--color-text-secondary);
    opacity: 0.5;
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text);
`;

const EmptyStateMessage = styled.p`
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 500px;
  margin: 0 auto 1.5rem;
`;

const BidsList = styled.ul`
  list-style: none;
  padding: 0;
`;

const BidItem = styled.li`
  background-color: white;
  border-radius: var(--border-radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
`;

const BidItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BidItemTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
`;

const BidItemDetail = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const BidItemStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => 
    props.status === 'won' ? 'rgba(5, 150, 105, 0.1)' : 
    props.status === 'lost' ? 'rgba(239, 68, 68, 0.1)' : 
    'rgba(107, 114, 128, 0.1)'
  };
  color: ${props => 
    props.status === 'won' ? 'rgb(5, 150, 105)' : 
    props.status === 'lost' ? 'rgb(239, 68, 68)' : 
    'rgb(107, 114, 128)'
  };
`;

const AuctionCardOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
`;

const CountdownWrapper = styled.div`
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
`;

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState({
    active: [],
    upcoming: [],
    past: []
  });
  const [userBids, setUserBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState({
    totalBids: 0,
    activeAuctions: 0,
    wonAuctions: 0,
    totalSpent: 0
  });
  
  useEffect(() => {
    // Wait for auth to be loaded
    if (authLoading) return;
    
    // Redirect if no user
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Initial data load
    loadUserBids();
    loadUserStats();
    
    // Clean up subscription when component unmounts
    return () => {
      // No need to unsubscribe as appState is removed
    };
  }, [user, authLoading, navigate]);
  
  const loadUserBids = async () => {
    try {
      setLoading(true);
      
      // Get all bids made by the current user
      const { data: userBidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          *,
          auctions (*)
        `)
        .eq('bidder_id', user.id)
        .order('created_at', { ascending: false });
      
      if (bidsError) throw bidsError;
      
      console.log('User bids:', userBidsData);
      
      // Extract unique auctions from the bids
      const uniqueAuctions = {};
      const userBidsWithAuctions = [];
      
      for (const bid of userBidsData) {
        if (bid.auctions) {
          // Process each auction to ensure consistent field naming
          const auction = {
            ...bid.auctions,
            starting_price: bid.auctions.starting_price || bid.auctions.startingPrice,
            minIncrement: bid.auctions.min_increment || bid.auctions.minIncrement,
            startTime: bid.auctions.start_time || bid.auctions.startTime,
            endTime: bid.auctions.end_time || bid.auctions.endTime,
            finalPrice: bid.auctions.final_price || bid.auctions.finalPrice,
            images: Array.isArray(bid.auctions.images) ? bid.auctions.images : []
          };
          
          // Add to uniqueAuctions if not already there, or update if this bid is higher
          if (!uniqueAuctions[auction.id] || bid.amount > uniqueAuctions[auction.id].highestBid) {
            uniqueAuctions[auction.id] = {
              ...auction,
              highestBid: bid.amount,
              bidDate: bid.created_at
            };
          }
          
          // Add to user bids list
          userBidsWithAuctions.push({
            ...bid,
            auction: auction
          });
        }
      }
      
      // Convert uniqueAuctions to array
      const auctionsArray = Object.values(uniqueAuctions);
      
      // Categorize auctions
      const now = new Date();
      
      const active = auctionsArray.filter(auction => {
        const startTime = new Date(auction.start_time || auction.startTime);
        const endTime = new Date(auction.end_time || auction.endTime);
        return now >= startTime && now <= endTime;
      });
      
      const upcoming = auctionsArray.filter(auction => {
        const startTime = new Date(auction.start_time || auction.startTime);
        return now < startTime;
      });
      
      const past = auctionsArray.filter(auction => {
        const endTime = new Date(auction.end_time || auction.endTime);
        return now > endTime;
      });
      
      setAuctions({
        active,
        upcoming,
        past
      });
      
      setUserBids(userBidsWithAuctions);
      setError(null);
    } catch (error) {
      console.error('Error fetching user bids:', error);
      setError('Teklifleriniz yüklenemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  const loadUserStats = async () => {
    try {
      // Get total number of bids
      const { count: totalBids, error: countError } = await supabase
        .from('bids')
        .select('*', { count: 'exact' })
        .eq('bidder_id', user.id);
      
      if (countError) throw countError;
      
      // Get won auctions (where user is the winner)
      const { data: wonAuctions, error: wonError } = await supabase
        .from('auctions')
        .select('*')
        .eq('winner_id', user.id);
      
      if (wonError) throw wonError;
      
      // Calculate total spent on won auctions
      const totalSpent = wonAuctions.reduce((sum, auction) => {
        return sum + (auction.final_price || auction.starting_price || 0);
      }, 0);
      
      setUserStats({
        totalBids: totalBids || 0,
        activeAuctions: auctions.active.length,
        wonAuctions: wonAuctions.length,
        totalSpent
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
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
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleAuctionClick = (auctionId) => {
    navigate(`/auctions/${auctionId}`);
  };
  
  // Display loading while auth is loading
  if (authLoading || loading) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p>Yükleniyor...</p>
        </div>
      </DashboardContainer>
    );
  }
  
  return (
    <DashboardContainer>
      <StatsGrid>
        <StatCard>
          <StatTitle>Toplam Teklif</StatTitle>
          <StatValue>{userStats.totalBids}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Aktif İhaleler</StatTitle>
          <StatValue>{auctions.active.length}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Kazanılan İhaleler</StatTitle>
          <StatValue>{userStats.wonAuctions}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Toplam Harcama</StatTitle>
          <StatValue>{formatPrice(userStats.totalSpent)}</StatValue>
        </StatCard>
      </StatsGrid>
      
      <SectionTitle>Son Tekliflerim</SectionTitle>
      {error ? (
        <EmptyState>
          <EmptyStateIcon>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>Hata Oluştu</EmptyStateTitle>
          <EmptyStateMessage>{error}</EmptyStateMessage>
        </EmptyState>
      ) : userBids.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>Henüz Teklif Vermediniz</EmptyStateTitle>
          <EmptyStateMessage>Henüz hiçbir ihaleye teklif vermediniz. İhalelere göz atarak teklif verebilirsiniz.</EmptyStateMessage>
        </EmptyState>
      ) : (
        <div>
          <BidsList>
            {userBids.slice(0, 5).map((bid) => (
              <BidItem key={bid.id} onClick={() => handleAuctionClick(bid.auction.id)}>
                <BidItemContent>
                  <BidItemTitle style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    {bid.auction.title || 'Arsa İhalesi'}
                  </BidItemTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '1rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      Teklif: {formatPrice(bid.amount)}
                    </span>
                    <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                      Tarih: {formatDate(bid.created_at)}
                    </span>
                  </div>
                </BidItemContent>
                <BidItemStatus status={
                  new Date() > new Date(bid.auction.end_time) 
                    ? bid.auction.winner_id === user.id 
                      ? 'won' 
                      : 'lost'
                    : 'active'
                }>
                  {new Date() > new Date(bid.auction.end_time) 
                    ? bid.auction.winner_id === user.id 
                      ? 'Kazandınız' 
                      : 'Kaybettiniz'
                    : 'Aktif'}
                </BidItemStatus>
              </BidItem>
            ))}
          </BidsList>
          {userBids.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button 
                onClick={() => navigate('/bids')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Tüm Teklifleri Görüntüle
              </button>
            </div>
          )}
        </div>
      )}
      
      <SectionTitle>Teklif Verdiğim Aktif İhaleler</SectionTitle>
      {error ? (
        <EmptyState>
          <EmptyStateIcon>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>Hata Oluştu</EmptyStateTitle>
          <EmptyStateMessage>{error}</EmptyStateMessage>
        </EmptyState>
      ) : auctions.active.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>Aktif İhalede Teklifiniz Bulunmuyor</EmptyStateTitle>
          <EmptyStateMessage>Şu anda aktif olan ve teklif verdiğiniz bir ihale bulunmamaktadır.</EmptyStateMessage>
        </EmptyState>
      ) : (
        <AuctionsGrid>
          {auctions.active.map((auction) => (
            <AuctionCard key={auction.id} onClick={() => handleAuctionClick(auction.id)}>
              <AuctionImage>
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
                <AuctionLocation>{auction.location || 'Konum bilgisi yok'}</AuctionLocation>
                <AuctionDetails>
                  <AuctionPrice>
                    {formatPrice(
                      auction.final_price || auction.finalPrice || auction.starting_price || auction.startingPrice
                    )}
                  </AuctionPrice>
                  <AuctionStatus status="active">Aktif</AuctionStatus>
                </AuctionDetails>
                {auction.end_time && (
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
          ))}
        </AuctionsGrid>
      )}
      
      <SectionTitle>Teklif Verdiğim Yaklaşan İhaleler</SectionTitle>
      {error ? (
        <EmptyState>
          <EmptyStateIcon>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>Hata Oluştu</EmptyStateTitle>
          <EmptyStateMessage>{error}</EmptyStateMessage>
        </EmptyState>
      ) : auctions.upcoming.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>Yaklaşan İhalede Teklifiniz Bulunmuyor</EmptyStateTitle>
          <EmptyStateMessage>Şu anda yaklaşan ve teklif verdiğiniz bir ihale bulunmamaktadır.</EmptyStateMessage>
        </EmptyState>
      ) : (
        <AuctionsGrid>
          {auctions.upcoming.map((auction) => (
            <AuctionCard key={auction.id} onClick={() => handleAuctionClick(auction.id)}>
              <AuctionImage>
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
                <AuctionLocation>{auction.location || 'Konum bilgisi yok'}</AuctionLocation>
                <AuctionDetails>
                  <AuctionPrice>
                    {formatPrice(auction.starting_price || auction.startingPrice)}
                  </AuctionPrice>
                  <AuctionStatus status="upcoming">Yaklaşan</AuctionStatus>
                </AuctionDetails>
              </AuctionContent>
            </AuctionCard>
          ))}
        </AuctionsGrid>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
