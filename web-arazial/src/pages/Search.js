import { useEffect, useState } from "react";
import { BsKeyFill } from "react-icons/bs";
import { MdKeyboardArrowRight } from "react-icons/md";
import { RiAuctionFill } from "react-icons/ri";
import styled from "styled-components";
import Button from "../components/ui/Button";
import { supabase } from "./../services/supabase";
import AuctionGridComponent from "../components/AuctionGridComponent";
import backgroundImage from "../assets/backgroundimage.png";
import { useAuth } from "../context/AuthContext";
import { Link, useSearchParams } from "react-router-dom";

const ShareNotification = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-text);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  opacity: ${(props) => (props.show ? 1 : 0)};
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const Container = styled.div`
  width: 100%;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* margin-top: 3rem; */
`;

const Card = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: ${(props) => (props.$isActive ? "#4fbf6fff" : "#fff")};
  cursor: pointer;
  transition: 0.2s;
  margin-bottom: 1rem;
  &:hover {
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1);
    opacity: 0.9;
  }
`;

const IconContainerLeft = styled.div`
  width: 60px;
  height: 60px;
  text-align: center;
  border-right: 1px solid #ddd;
  background-color: var(--color-primary);
  border-radius: 10px 0 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 10px;
  text-align: left;
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
`;

const IconContainerRight = styled.div`
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0 10px 10px 0;
`;

const Wrapper = styled.div`
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-radius: 5px;
  &:hover {
    background-color: #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Hr = styled.hr`
  margin: 0;
  border: 1px solid #ddd;
`;

const TypeText = styled.span`
  font-weight: bold;
  margin-left: 1rem;
`;

const TypeContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SearchComponentWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  min-width: 320px;
  padding: 0 20px;
`;

const FilterButton = styled(Button)`
  margin-top: 1rem;
  width: 95%;
`;

const BackButton = styled(Button)`
  padding: 0;
  min-width: 80px;
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 2rem;
  background-color: #f9fafb;
  border-radius: 16px;
  margin-top: -1rem;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 0.75rem;
    margin-top: -1rem;
    border-radius: 0;
    box-shadow: none;
  }
`;

const HeroSection = styled.section`
  height: 300px;
  background-image: url(${backgroundImage});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  color: white;
  text-align: center;
  position: relative;
  padding: 0;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 0;
  }

  @media (max-width: 768px) {
    height: 300px;
    justify-content: space-around;
    align-items: center;
  }
`;

const HeroSectionLogo = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  zindex: 10;
  width: 100%;
  padding-left: 1rem;
  z-index: 1;
`;

const SearchResultInfo = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
`;

const InputContainer = styled.div`
  width: 95%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
`;

const StyledInput = styled.input`
  width: 50%;
  background: white;
  z-index: 100;
  margin-top: 1rem;
  @media (max-width: 768px) {
    width: 90%;
  }
`;

const CityList = styled.div`
  width: 50%;
  display: flex;
  gap: 10px;
  @media (max-width: 768px) {
    width: 90%;
  }
`;

const CityItem = styled.div`
  width: 75px;
  cursor: pointer;
`;

const CityName = styled.p`
  background-color: white;
  color: black;
  border-radius: 5px;
  font-weight: bold;
`;

function Search() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [shareMessage, setShareMessage] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    listingTypes: [],
    types: [],
    city: "",
  });
  const [auctionData, setAuctionData] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);

  const { listingTypes, types, city } = searchFilters;

  let [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q");

  // WE MIGHT NEED THE COMMENTS IN THE FUTURE
  // const handleSelectListingType = (listingType) => {
  //   if (listingTypes.includes(listingType)) {
  //     setSearchFilters((prev) => ({
  //       ...prev,
  //       listingTypes: prev.listingTypes.filter(
  //         (listType) => listType !== listingType
  //       ),
  //     }));
  //   } else {
  //     setSearchFilters((prev) => ({
  //       ...prev,
  //       listingTypes: [...prev.listingTypes, listingType],
  //     }));
  //   }
  // };

  // const handleTypeClick = (type) => {
  //   if (types.includes(type.toLowerCase())) {
  //     setSearchFilters((prev) => ({
  //       ...prev,
  //       types: prev.types.filter((itemType) => itemType !== type.toLowerCase()),
  //     }));
  //   } else {
  //     setSearchFilters((prev) => ({
  //       ...prev,
  //       types: [...prev.types, type.toLowerCase()],
  //     }));
  //   }
  // };

  // const handleSearchAgain = () => {
  //   setSearchFilters({ listingTypes: [], types: [], city: "" });
  //   setCurrentPage(0);
  // };

  const fetchData = async (
    isListType,
    itemToFilter,
    canSearchListingOrType = true
  ) => {
    setIsLoading(true);
    setCurrentPage((prev) => prev + 1);
    try {
      const { data, error } = await supabase.from("auctions").select("*");
      if (error) {
        throw new Error("Bir hata meydana geldi.");
      }

      let filteredData = data;

      if (city || urlQuery) {
        filteredData = filteredData.filter(
          (item) =>
            (city || urlQuery).trim().toLowerCase() ===
            item.city.trim().toLowerCase()
        );
      }

      if (canSearchListingOrType) {
        if (isListType) {
          const now = new Date();

          filteredData = filteredData
            .filter(
              (item) =>
                itemToFilter.toLowerCase() ===
                item.listing_type.trim().toLowerCase()
            )
            .sort((a, b) => {
              const aStart = new Date(a.start_time);
              const aEnd = new Date(a.end_time);
              const bStart = new Date(b.start_time);
              const bEnd = new Date(b.end_time);

              const getStatus = (start, end) => {
                if (now >= start && now <= end) return 0;
                if (now < start) return 1;
                return 2;
              };

              const statusA = getStatus(aStart, aEnd);
              const statusB = getStatus(bStart, bEnd);

              return statusA - statusB;
            });
        } else {
          filteredData = filteredData.filter(
            (item) =>
              itemToFilter.toLowerCase() ===
              item.emlak_tipi.trim().toLowerCase()
          );
        }
      }
      // if (types.length) {
      //   filteredData = filteredData.filter(
      //     (item) => itemToFilter === item.emlak_tipi.trim().toLowerCase()
      //   );
      // }

      // if (listingTypes.length) {
      //   filteredData = filteredData.filter(
      //     (item) => itemToFilter === item.listing_type.trim().toLowerCase()
      //   );
      // }

      const { data: favoritesData, error: favoritesError } = await supabase
        .from("favorites")
        .select("auction_id")
        .eq("user_id", user?.id);
      if (favoritesError) throw favoritesError;
      setUserFavorites(favoritesData);

      setAuctionData(filteredData);
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  const popularCities = [
    { name: "Kütahya" },
    { name: "Konya" },
    { name: "Uşak" },
  ];

  // TEMPORARY SOLUTION
  useEffect(() => {
    if (urlQuery) {
      fetchData(false, urlQuery, false);
    }
    const handleClickAnywhere = (event) => {
      if (event.target.parentElement?.innerText === "Arama") {
        setSearchFilters({ listingTypes: [], types: [], city: "" });
        setCurrentPage(0);
      }
    };

    window.addEventListener("click", handleClickAnywhere);

    return () => {
      window.removeEventListener("click", handleClickAnywhere);
    };
  }, []);

  if (urlQuery) {
    return (
      <PageContainer>
        <SearchResultInfo>
          {auctionData.length ? (
            <h5>{`${auctionData.length} sonuç bulundu.`}</h5>
          ) : null}
        </SearchResultInfo>
        <AuctionGridComponent
          items={auctionData}
          isLoading={isLoading}
          auctions={auctionData}
          listingType="" //{isListingTypeOffer ? "offer" : "auction"}
          setShareMessage={setShareMessage}
          shouldRedirectHomePage={true}
          userFavorites={userFavorites}
          setUserFavorites={setUserFavorites}
          notFoundMessage="Aradığınız kriterlere uygun ilan bulunamadı."
          notFoundButtonMessage="Tüm ilanları incele"
        />
        <ShareNotification show={!!shareMessage}>
          {shareMessage}
        </ShareNotification>
      </PageContainer>
    );
  }

  return (
    <Container>
      {currentPage === 0 ? (
        <>
          <HeroSection>
            <HeroSectionLogo to={"/"}>
              <img src="/logo.png" width={50} height={50} />
              <h5 style={{ color: "white", margin: 0 }}>arazialcom</h5>
            </HeroSectionLogo>
            <p style={{ margin: "0 auto", color: "white", zIndex: "1000" }}>
              Türkiye'nin dört bir yanındaki değerli araziler için ihale
              tekliflerinizi verin.
            </p>

            <InputContainer>
              <StyledInput
                type="text"
                value={city}
                onChange={(e) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                name="city"
                placeholder="Şehir giriniz."
              />
              <CityList>
                {popularCities.map((popularCity) => (
                  <CityItem
                    onClick={() =>
                      setSearchFilters((prev) => ({
                        ...prev,
                        city: popularCity.name,
                      }))
                    }
                  >
                    <CityName>{popularCity.name}</CityName>
                  </CityItem>
                ))}
              </CityList>
            </InputContainer>
          </HeroSection>
          <PageContainer>
            <Card
              style={{ marginTop: "2rem" }}
              onClick={() => fetchData(true, "offer")}
              $isActive={listingTypes.includes("offer")}
            >
              <IconContainerLeft>
                <BsKeyFill size={30} color="white" />
              </IconContainerLeft>

              <ContentContainer>Satılık</ContentContainer>

              <IconContainerRight>
                <MdKeyboardArrowRight size={24} color="#333" />
              </IconContainerRight>
            </Card>
            <Card
              style={{ marginBottom: "2rem" }}
              onClick={() => fetchData(true, "auction")}
              $isActive={listingTypes.includes("auction")}
            >
              <IconContainerLeft>
                <RiAuctionFill size={30} color="white" />
              </IconContainerLeft>

              <ContentContainer>Açık Artırma</ContentContainer>

              <IconContainerRight>
                <MdKeyboardArrowRight size={24} color="#333" />
              </IconContainerRight>
            </Card>
            <TypeContainer>
              <Wrapper>
                {["Arsa", "Tarla", "Bahçe", "Zeytinlik", "Bağ"].map(
                  (typeItem) => (
                    <Wrapper key={typeItem}>
                      <Row
                        onClick={() => fetchData(false, typeItem)}
                        style={{
                          backgroundColor: types.includes(
                            typeItem.toLowerCase()
                          )
                            ? "#4fbf6fff"
                            : "",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img
                            src={`${typeItem.toLocaleLowerCase()}.jpeg`}
                            width={50}
                            height={50}
                            style={{
                              borderRadius: "5px",
                              objectFit: "contain",
                            }}
                          />
                          <TypeText>{typeItem}</TypeText>
                        </div>
                        <IconContainerRight>
                          <MdKeyboardArrowRight size={24} color="#333" />
                        </IconContainerRight>
                      </Row>
                      <Hr />
                    </Wrapper>
                  )
                )}
              </Wrapper>
              {/* <FilterButton onClick={() => fetchData("")}>Ara</FilterButton> */}
            </TypeContainer>
          </PageContainer>
        </>
      ) : currentPage === 1 ? (
        <PageContainer>
          <SearchResultInfo>
            {auctionData.length ? (
              <h5>{`${auctionData.length} sonuç bulundu.`}</h5>
            ) : null}
          </SearchResultInfo>
          <AuctionGridComponent
            items={auctionData}
            isLoading={isLoading}
            auctions={auctionData}
            listingType="" //{isListingTypeOffer ? "offer" : "auction"}
            setShareMessage={setShareMessage}
            shouldRedirectHomePage={true}
            userFavorites={userFavorites}
            setUserFavorites={setUserFavorites}
            notFoundMessage="Aradığınız kriterlere uygun ilan bulunamadı."
            notFoundButtonMessage="Tüm ilanları incele"
          />
          <ShareNotification show={!!shareMessage}>
            {shareMessage}
          </ShareNotification>
        </PageContainer>
      ) : null}
    </Container>
  );
}

export default Search;
