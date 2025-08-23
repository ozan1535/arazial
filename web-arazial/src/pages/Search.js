import { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "./../services/supabase";
import AuctionGridComponent from "../components/AuctionGridComponent";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

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

const Card = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 5px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: ${(props) => (props.$isActive ? "#4fbf6fff" : "#fff")};
  cursor: pointer;
  transition: 0.2s;
  margin: 1rem 0;
  /*  margin-bottom: 1rem; */
  &:hover {
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1);
    opacity: 0.9;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 0.5rem;
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  text-transform: uppercase;
`;

const Wrapper = styled.div`
  //width: 100%;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border: 1px solid black;
  border-radius: 5px;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  &:hover {
    background-color: #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TypeContainer = styled.div`
  width: 100%;
  display: flex;
  /* flex-direction: column; */
  justify-content: center;
  align-items: center;
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 2rem;
  background-color: #f9fafb;
  border-radius: 16px;
  //margin-top: -1rem;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 0.75rem;
    // margin-top: -1rem;
    border-radius: 0;
    box-shadow: none;
  }
`;

const SearchResultInfo = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
  margin-bottom: 1rem;
`;

const StyledInput = styled.input`
  width: 100%;
  background: white;
  z-index: 100;
  /* margin-top: 1rem; */
  @media (max-width: 768px) {
    width: 100%;
  }
`;

function Search() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserSearched, setHasUserSearched] = useState(false);

  const [shareMessage, setShareMessage] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    listingTypes: [],
    types: [],
    city: "",
  });
  const [data, setData] = useState([]);
  const [auctionData, setAuctionData] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);

  const { listingTypes, types, city } = searchFilters;

  let [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q");

  const fetchData = async () => {
    const { data, error } = await supabase.from("auctions").select("*");
    if (error) {
      throw new Error("Bir hata meydana geldi.");
    }
    setData(data);
    setAuctionData(data);
    if (urlQuery) {
      filterData(data, false, urlQuery, false);
    }
  };

  const filterData = async (
    data,
    isListType,
    itemToFilter,
    canSearchListingOrType = true
  ) => {
    setIsLoading(true);

    try {
      setHasUserSearched(true);
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
          setSearchFilters((prev) => ({
            ...prev,
            listingTypes: [itemToFilter.toLowerCase()],
            types: [],
          }));
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
          setSearchFilters((prev) => ({
            ...prev,
            listingTypes: [],
            types: [itemToFilter.toLowerCase()],
          }));
          filteredData = filteredData.filter(
            (item) =>
              itemToFilter.toLowerCase() ===
              item.emlak_tipi.trim().toLowerCase()
          );
        }
      }

      if (user) {
        const { data: favoritesData, error: favoritesError } = await supabase
          .from("favorites")
          .select("auction_id")
          .eq("user_id", user?.id);
        if (favoritesError) throw favoritesError;
        setUserFavorites(favoritesData);
      } else {
        setUserFavorites([]);
      }

      setAuctionData(filteredData);
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  // TEMPORARY SOLUTION
  useEffect(() => {
    fetchData();

    const handleClickAnywhere = (event) => {
      if (event.target.parentElement?.innerText === "Arama") {
        setSearchFilters({ listingTypes: [], types: [], city: "" });
      }
    };

    window.addEventListener("click", handleClickAnywhere);

    return () => {
      window.removeEventListener("click", handleClickAnywhere);
    };
  }, []);

  return (
    <PageContainer>
      <h2 style={{ margin: 0, padding: 0, textAlign: "center" }}>arazialcom</h2>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Card
          onClick={() => filterData(data, true, "offer")}
          $isActive={listingTypes.includes("offer")}
        >
          <ContentContainer>Satılık</ContentContainer>
        </Card>
        <Card
          onClick={() => filterData(data, true, "auction")}
          $isActive={listingTypes.includes("auction")}
        >
          <ContentContainer>Açık Artırma</ContentContainer>
        </Card>
      </div>
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
          placeholder="İl, ilçe veya mahalle yazın..."
        />
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 101 }}>
          <FaSearch size={20} />
        </div>
      </InputContainer>
      <TypeContainer>
        <Wrapper>
          {["Arsa", "Tarla", "Bahçe", "Zeytinlik", "Bağ"].map((typeItem) => (
            <Wrapper key={typeItem}>
              <Row
                onClick={() => filterData(data, false, typeItem)}
                style={{
                  backgroundColor: types.includes(typeItem.toLowerCase())
                    ? "#4fbf6fff"
                    : "",
                }}
              >
                {typeItem}
              </Row>
            </Wrapper>
          ))}
        </Wrapper>
      </TypeContainer>

      {hasUserSearched && (
        <SearchResultInfo>
          {auctionData.length ? (
            <h5>{`${auctionData.length} sonuç bulundu.`}</h5>
          ) : null}
        </SearchResultInfo>
      )}
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

export default Search;
