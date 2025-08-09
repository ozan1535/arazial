import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import Button from "./ui/Button";
import {
  formatNumber,
  formatPrice,
  getAuctionLocation,
  getStatusIcon,
  getStatusText,
  handleShare,
  resetFilters,
  toggleFavorite,
} from "../helpers/helpers";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const AuctionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const AuctionCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const AuctionImage = styled.div`
  height: 200px;
  background-color: #f9fafb;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${AuctionCard}:hover & img {
    transform: scale(1.05);
  }
`;

const AuctionStatusBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${
    (props) =>
      props.type === "offer"
        ? "rgba(234, 88, 12, 0.9)" // Orange for offers
        : props.status === "active"
        ? "rgba(5, 150, 105, 0.9)" // Green for active
        : props.status === "upcoming"
        ? "rgba(37, 99, 235, 0.9)" // Blue for upcoming
        : props.status === "completed" || props.status === "ended"
        ? "rgba(107, 114, 128, 0.9)" // Gray for completed
        : "rgba(239, 68, 68, 0.9)" // Red for others
  };
  color: white;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const AuctionContent = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const AuctionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text);
  line-height: 1.3;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.6em; /* Set a minimum height for 2 lines */
`;

/* 
 margin-bottom: 1rem;
*/
const AuctionLocation = styled.div`
  display: flex;
  align-items: center;

  font-size: 0.875rem;
  color: var(--color-text-secondary);

  svg {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
`;

/* 
 margin-top: 0.75rem;
  margin-bottom: 1rem;
*/
const AuctionMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  strong {
    color: var(--color-text);
    font-weight: 600;
  }
`;

const AuctionDetails = styled.div`
  border-top: 1px solid #eaeaea;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto; /* Pushes this to the bottom */
`;

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  span:first-child {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.25rem;
  }
`;

const AuctionPrice = styled.div`
  font-weight: 700;
  font-size: 1.35rem;
  color: var(--color-text);
  text-wrap: nowrap;
`;

const CountdownInfo = styled.div`
  display: flex;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CountdownLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;

  svg {
    width: 1em;
    height: 1em;
    color: ${(props) =>
      props.status === "active" ? "rgb(5, 150, 105)" : "rgb(37, 99, 235)"};
  }
`;

const AuctionStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) =>
    props.status === "active"
      ? "rgb(5, 150, 105)"
      : props.status === "upcoming"
      ? "rgb(37, 99, 235)"
      : props.status === "offer"
      ? "rgb(234, 88, 12)"
      : "rgb(107, 114, 128)"};
`;

// Icons
const LocationIcon = () => (
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
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

const GridIcon = () => (
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
      d="M6.75 6.75h10.5v10.5h-10.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3.75v16.5m-8.25-8.25h16.5"
    />
  </svg>
);

const AuctionTypeTag = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  z-index: 1;
`;

function AuctionGridComponent({
  items,
  isLoading,
  auctions,
  listingType,
  setShareMessage,
  shouldRedirectHomePage = false,
  userFavorites,
  setUserFavorites,
  notFoundMessage = null,
  notFoundButtonMessage = null,
}) {
  const { user } = useAuth();

  const navigate = useNavigate();

  const handleAuctionClick = (auctionId) => {
    navigate(`/auctions/${auctionId}`);
  };
  const getMinimumBidAmount = useCallback(
    (auction) => {
      if (!auction || auction.listing_type !== "auction") return 0;
      const highestBid = auction?.bids?.[0]?.amount || 0;
      const startPrice = auction.starting_price || 0;
      const minIncrement = auction.min_increment || 1;

      // If there are no bids, return the start price
      if (highestBid === 0) {
        return startPrice;
      }

      // Otherwise, return highest bid + minimum increment
      return highestBid + minIncrement;
    },
    [auctions]
  );
  return (
    <AuctionsGrid>
      {isLoading ? (
        Array(6)
          .fill(0)
          .map((_, index) => (
            <AuctionCard key={`skeleton-${index}`} style={{ opacity: 0.7 }}>
              <AuctionImage style={{ backgroundColor: "#f0f0f0" }} />
              <AuctionContent>
                <div
                  style={{
                    height: "24px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    marginBottom: "12px",
                  }}
                ></div>
                <div
                  style={{
                    height: "16px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    marginBottom: "24px",
                    width: "60%",
                  }}
                ></div>
                <div
                  style={{
                    height: "20px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                  }}
                ></div>
              </AuctionContent>
            </AuctionCard>
          ))
      ) : items.length === 0 ? (
        <div
          style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            padding: "3rem 0",
          }}
        >
          <p>
            {notFoundMessage ||
              "Şu anda görüntülenebilecek satış ilanı bulunmamaktadır."}
          </p>
          <Button
            variant="secondary"
            size="small"
            onClick={() => resetFilters(shouldRedirectHomePage, navigate)}
            style={{ marginTop: "1rem" }}
          >
            {notFoundButtonMessage || "Tüm Açık Arttırmaları Göster"}
          </Button>
        </div>
      ) : (
        items.map((listing) => {
          return (
            <AuctionCard
              key={listing.id}
              onClick={() => handleAuctionClick(listing.id)}
            >
              <AuctionImage>
                <div>
                  <img
                    src={
                      listing.images?.[0] ||
                      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    }
                    alt={listing.title}
                  />

                  <AuctionStatusBadge
                    status={listing.status}
                    type={listing._display_type || listing.listing_type}
                  >
                    {getStatusText(
                      listing.status,
                      listing._display_type || listing.listing_type
                    )}
                  </AuctionStatusBadge>
                  {listingType === "new" &&
                    (listing._display_type || listing.listing_type) !==
                      "offer" && <AuctionTypeTag>Açık Arttırma</AuctionTypeTag>}
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 10,
                    fontSize: 40,
                  }}
                >
                  {userFavorites.find(
                    (favourite) => favourite.auction_id === listing.id
                  ) ? (
                    <FaHeart
                      onClick={(e) =>
                        toggleFavorite(
                          e,
                          listing.id,
                          user,
                          userFavorites,
                          setUserFavorites
                        )
                      }
                    />
                  ) : (
                    <FaRegHeart
                      onClick={(e) =>
                        toggleFavorite(
                          e,
                          listing.id,
                          user,
                          userFavorites,
                          setUserFavorites
                        )
                      }
                    />
                  )}
                </div>
              </AuctionImage>
              <AuctionContent>
                <AuctionTitle>{listing.title || "Emlak İlanı"}</AuctionTitle>
                <AuctionLocation>
                  <LocationIcon />
                  {getAuctionLocation(listing)}
                </AuctionLocation>

                {(listing.ada_no || listing.parsel_no) && (
                  <AuctionMeta>
                    {listing.ada_no && (
                      <MetaItem>
                        <GridIcon />
                        Ada: <strong>{listing.ada_no}</strong>
                      </MetaItem>
                    )}
                    {listing.parsel_no && (
                      <MetaItem>
                        <GridIcon />
                        Parsel: <strong>{listing.parsel_no}</strong>
                      </MetaItem>
                    )}
                    {
                      <button
                        onClick={(e) =>
                          handleShare(e, listing, setShareMessage)
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          backgroundColor: "var(--color-primary)",
                          color: "white",
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
                      </button>
                    }
                  </AuctionMeta>
                )}
                <AuctionMeta>
                  {listing.area_size && listing.area_unit && (
                    <MetaItem>
                      <GridIcon />
                      {formatNumber(listing.area_size) || "-"}
                      {listing.area_unit}
                    </MetaItem>
                  )}

                  {listing.emlak_tipi && (
                    <MetaItem>
                      <GridIcon />
                      {listing.emlak_tipi}
                    </MetaItem>
                  )}
                </AuctionMeta>

                <AuctionDetails>
                  <PriceInfo>
                    <span>
                      {listing.status === "active"
                        ? "Güncel Teklif"
                        : listing.listing_type === "offer"
                        ? "Güncel Fiyat"
                        : listing.status === "ended" ||
                          listing.status === "completed"
                        ? "Kapanış Fiyatı"
                        : "Başlangıç Fiyatı"}
                    </span>
                    <AuctionPrice>
                      {formatPrice(
                        listing.listing_type === "offer"
                          ? listing?.starting_price ||
                              listing?.startingPrice ||
                              0
                          : listing.status === "active" ||
                            listing.status === "ended" ||
                            listing.status === "completed"
                          ? getMinimumBidAmount(listing)
                          : listing.starting_price ||
                            listing.startingPrice ||
                            listing.starting_bid ||
                            0
                      )}
                    </AuctionPrice>
                  </PriceInfo>
                  {(listing._display_type || listing.listing_type) !==
                    "offer" && (
                    <PriceInfo>
                      <span> Artış Tutarı:</span>
                      <AuctionPrice>
                        {formatPrice(
                          listing.minIncrement || listing.minIncrement || 0
                        )}
                      </AuctionPrice>
                    </PriceInfo>
                  )}
                  <PriceInfo>
                    <span>Teminat Tutarı</span>
                    <AuctionPrice>
                      {formatPrice(listing.deposit_amount || 0)}
                    </AuctionPrice>
                  </PriceInfo>
                </AuctionDetails>

                <AuctionDetails>
                  {(listing._display_type || listing.listing_type) ===
                  "offer" ? (
                    <AuctionStatus status="offer">
                      {getStatusIcon("offer", "offer")}
                      Satılık
                    </AuctionStatus>
                  ) : listing.status === "active" ? (
                    <CountdownInfo>
                      <CountdownLabel status="active">
                        {getStatusIcon("active", "auction")}
                        Kalan:
                      </CountdownLabel>
                      <CountdownTimer
                        endTime={listing.end_time || listing.endTime}
                        compact={true}
                      />
                    </CountdownInfo>
                  ) : listing.status === "upcoming" ? (
                    <CountdownInfo>
                      <CountdownLabel status="upcoming">
                        {getStatusIcon("upcoming", "auction")}
                        Başlamasına kalan:
                      </CountdownLabel>
                      <CountdownTimer
                        endTime={listing.start_time || listing.startTime}
                        compact={true}
                      />
                    </CountdownInfo>
                  ) : (
                    <AuctionStatus status={listing.status}>
                      {getStatusIcon(listing.status, "auction")}
                      {getStatusText(listing.status, "auction")}
                    </AuctionStatus>
                  )}
                </AuctionDetails>
              </AuctionContent>
            </AuctionCard>
          );
        })
      )}
    </AuctionsGrid>
  );
}

export default AuctionGridComponent;
