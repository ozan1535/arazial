import React from "react";
import styled from "styled-components";
import { formatNumber } from "../helpers/helpers";
import { Link } from "react-router-dom";

const CarouselWrapper = styled.div`
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  width: 100%;

  ::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
`;

const CarouselItemContainer = styled(Link)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  transition: transform 0.3s ease;
  width: 400px;
  flex-shrink: 0;
  scroll-snap-align: center;
  padding-right: 50px;

  @media (min-width: 481px) and (max-width: 768px) {
    width: 60%;
    padding-right: 40px;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 0 10px;
  }
`;

const CarouselItemContent = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  width: 100%;
  height: 100%;
`;

const CarouselItemImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #f0f0f0;
`;

const CarouselItemDetails = styled.div`
  padding: 10px;
`;

const CarouselItemTitle = styled.h3`
  font-size: 14px;
  font-weight: normal;
  color: #333;
  margin: 0;
`;

const CarouselItemPrice = styled.p`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 5px 0;
`;

const CarouselItemLocation = styled.p`
  font-size: 12px;
  color: #888;
  margin: 0;
`;

const HomePageCarousel = ({ auctions }) => {
  const renderCarousel = (filterCondition, title) => {
    const filteredAuctions = auctions.filter(filterCondition);
    if (filteredAuctions.length === 0) return null;

    return (
      <>
        <p>{title}</p>
        <CarouselWrapper>
          {filteredAuctions.slice(0, 5).map((item) => (
            <CarouselItemContainer key={item.id} to={`/auctions/${item.id}`}>
              <CarouselItemContent>
                <CarouselItemImage src={item.images[0]} alt={item.title} />
                <CarouselItemDetails>
                  <CarouselItemTitle>{item.title}</CarouselItemTitle>
                  <CarouselItemPrice>
                    {formatNumber(item.starting_price)}
                  </CarouselItemPrice>
                  <CarouselItemLocation>{item.location}</CarouselItemLocation>
                </CarouselItemDetails>
              </CarouselItemContent>
            </CarouselItemContainer>
          ))}
        </CarouselWrapper>
      </>
    );
  };

  const currentDate = new Date();

  return (
    <>
      {renderCarousel(
        (auction) => auction.listing_type === "offer",
        "SATILIK ARAZİLER"
      )}

      {renderCarousel(
        (auction) =>
          auction.listing_type === "auction" &&
          new Date(auction.end_date) > currentDate,
        "AÇIK ARTTIRMALAR"
      )}
    </>
  );
};

export default HomePageCarousel;
