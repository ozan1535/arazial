import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { supabase } from "../supabaseClient";
import AuctionGridComponent from "../components/AuctionGridComponent";
import styled from "styled-components";

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

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 2rem;
  background-color: #f9fafb;
  border-radius: 16px;
  margin-top: -3rem;
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

function Favorites() {
  const { user, authState } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    const handleFetchFavorites = async () => {
      setIsLoading(true);
      if (authState === "unauthenticated") {
        navigate("/login");
      } else {
        try {
          const { data: favoritesData, error: favoritesError } = await supabase
            .from("favorites")
            .select("auction_id")
            .eq("user_id", user?.id);
          if (favoritesError) throw favoritesError;
          setUserFavorites(favoritesData);

          const auctionIds = favoritesData.map((fav) => fav.auction_id);

          const { data: auctionsData, error: auctionsError } = await supabase
            .from("auctions")
            .select("*")
            .in("id", auctionIds);

          if (auctionsError) throw auctionsError;
          setAuctions(auctionsData);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    handleFetchFavorites();
  }, [authState]);

  useEffect(() => {
    setAuctions((prev) =>
      prev.filter((item) =>
        userFavorites.some((favourite) => favourite.auction_id === item.id)
      )
    );
  }, [userFavorites]);

  return (
    <PageContainer style={{ marginTop: "2rem" }}>
      <h5>Favorileriniz</h5>
      {isLoading || userFavorites.length ? (
        <AuctionGridComponent
          items={auctions}
          isLoading={isLoading}
          auctions={auctions}
          listingType={""}
          setShareMessage={setShareMessage}
          userFavorites={userFavorites}
          setUserFavorites={setUserFavorites}
        />
      ) : (
        <div
          style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            padding: "3rem 0",
          }}
        >
          <p>Şu anda görüntülenebilecek favori ilanınız bulunmamaktadır.</p>
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate("/")}
            style={{ marginTop: "1rem" }}
          >
            Keşfet
          </Button>
        </div>
      )}

      <ShareNotification show={!!shareMessage}>
        {shareMessage}
      </ShareNotification>
    </PageContainer>
  );
}

export default Favorites;
