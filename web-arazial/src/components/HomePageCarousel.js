import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import styled from "styled-components";
import { formatNumber } from "../helpers/helpers";

// Styled Components
const CarouselItemContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  transition: transform 0.3s ease;
`;

const CarouselItemContent = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  width: 100%;
  max-width: 350px;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
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

// Main Carousel Component
const HomePageCarousel = ({ auctions }) => {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 1,
      partialVisibilityGutter: 50,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 1,
      partialVisibilityGutter: 50,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
      partialVisibilityGutter: 50,
    },
  };

  const renderCarousel = (filterCondition, title) => {
    const filteredAuctions = auctions.filter(filterCondition);
    if (filteredAuctions.length === 0) return null;

    return (
      <>
        <p>{title}</p>
        <Carousel
          swipeable={true}
          draggable={true}
          showDots={false}
          responsive={responsive}
          partialVisible={true}
          ssr={true}
          infinite={true}
          autoPlaySpeed={1000}
          keyBoardControl={false}
          customTransition="all .5"
          transitionDuration={500}
          containerClass="carousel-container"
          removeArrowOnDeviceType={["tablet", "mobile", "desktop"]}
          dotListClass="custom-dot-list-style"
          itemClass="carousel-item-padding-40-px"
        >
          {filteredAuctions.slice(0, 5).map((item) => (
            <CarouselItemContainer key={item.id}>
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
        </Carousel>
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
