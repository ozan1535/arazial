import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import {
  fetchAuctions,
  fetchNegotiations,
  getAuctionBids,
} from "../services/auctionService";
import Button from "../components/ui/Button";
import backgroundImage from "../assets/backgroundimage.png";
import { resetFilters } from "../helpers/helpers";
import SearchComponent from "../components/SearchComponent";
import AuctionGridComponent from "../components/AuctionGridComponent";

// Hero section and modern homepage styling
const HeroSection = styled.section`
  height: 600px;
  background-image: url(${backgroundImage});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 2rem;
  text-align: center;
  position: relative;

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
    height: auto;
    min-height: 320px;
    padding: 1rem;
    justify-content: flex-start;
    padding-top: 2rem;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  z-index: 1;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: var(--color-primary-dark, #003366);
  margin-bottom: 2.5rem;
  max-width: 700px;
  line-height: 1.6;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  position: relative;
  width: 100%;
  gap: 0.5rem;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    padding: 0;
    width: 100%;
    margin-bottom: 1rem;
  }
`;

const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid
    ${(props) =>
      props.$isActive ? "var(--color-primary)" : "var(--color-border)"};
  background: ${(props) =>
    props.$isActive ? "var(--color-primary)" : "transparent"};
  color: ${(props) => (props.$isActive ? "#fff" : "#666")};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  font-size: 1rem;

  &:hover {
    background: ${(props) =>
      props.$isActive
        ? "var(--color-primary-dark)"
        : "rgba(59, 130, 246, 0.1)"};
    color: ${(props) => (props.$isActive ? "#fff" : "var(--color-primary)")};
  }

  @media (max-width: 600px) {
    padding: 0.75rem 0;
    width: 33%;
    font-size: 0.75rem;
    text-align: center;
  }
`;

const StatusTabs = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-top: 0.5rem;

  @media (max-width: 768px) {
    overflow-x: auto;
    white-space: nowrap;
    margin-bottom: 1rem;
    padding-top: 0;
  }
`;

const StatusTab = styled.button`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.active ? "var(--color-primary)" : "white")};
  color: ${(props) => (props.active ? "white" : "var(--color-text)")};
  border: 1px solid
    ${(props) =>
      props.active ? "var(--color-primary)" : "var(--color-border)"};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.active
      ? "0 4px 12px rgba(0, 0, 0, 0.1)"
      : "0 2px 4px rgba(0, 0, 0, 0.05)"};

  &:hover {
    background: ${(props) =>
      props.active ? "var(--color-primary-dark)" : "rgba(0, 0, 0, 0.02)"};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
`;

const PopularSearches = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    overflow-x: auto;
    border-radius: 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
    gap: 0.4rem;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    margin-bottom: 0.5rem;
    scrollbar-width: thin;
    scrollbar-color: #e2e8f0 #fff;
  }

  span {
    color: #1a202c;
    font-size: 1rem;
    font-weight: 700;
    margin-right: 0.7rem;
    flex: none;
    letter-spacing: 0.01em;
    @media (min-width: 769px) {
      color: white;
    }
    @media (max-width: 768px) {
      margin-right: 0.5rem;
      font-size: 0.98rem;
    }
  }

  a {
    display: inline-block;
    background: #fff;
    color: #1a202c;
    border-radius: 16px;
    padding: 0.32rem 1rem;
    font-size: 0.98rem;
    font-weight: 600;
    text-decoration: none;
    margin: 0;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    white-space: nowrap;
  }
  a:active,
  a:focus {
    background: var(--color-primary);
    color: #fff;
  }
  @media (max-width: 768px) {
    a {
      font-size: 0.95rem;
      padding: 0.28rem 0.85rem;
    }
  }
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

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [listingType, setListingType] = useState("new"); // 'new', 'auction', 'offer'
  const [auctionStatus, setAuctionStatus] = useState("active"); // 'active', 'upcoming', 'ended'
  const [shareMessage, setShareMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadListings();
  }, [listingType, auctionStatus]);

  // Scroll top if the pagination function triggers
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentPage]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      let data = [],
        error = null;

      if (listingType === "auction" || listingType === "new") {
        // Load auctions
        const { data: auctionData, error: auctionError } =
          await fetchAuctions();
        if (auctionError) {
          error = auctionError;
        } else if (auctionData) {
          // Tag each item as an auction for display purposes
          data = [
            ...data,
            ...auctionData.map((item) => ({
              ...item,
              _display_type: "auction",
            })),
          ];
        }
      }

      if (listingType === "offer" || listingType === "new") {
        // Load negotiation offers
        const { data: offerData, error: offerError } =
          await fetchNegotiations();
        if (offerError) {
          error = offerError || error;
        } else if (offerData) {
          // Tag each item as an offer for display purposes
          data = [
            ...data,
            ...offerData.map((item) => ({
              ...item,
              _display_type: "offer",
            })),
          ];
        }
      }

      if (error) throw error;

      // Sort by recently added first for all listings
      // const sortedData = data
      //   .map(async (item) => {
      //     const { data: bidsData, error: bidsError } = await getAuctionBids(
      //       item.id
      //     );
      //     return { ...item, bids: bidsData };
      //   })
      //   .sort((a, b) => {
      //     return (
      //       new Date(b.created_at || b.createdAt) -
      //       new Date(a.created_at || a.createdAt)
      //     );
      //   });
      // Show as same value as Auction Details Page for Güncel Teklif
      const sortedData = await Promise.all(
        data.map(async (item) => {
          const { data: bidsData, error: bidsError } = await getAuctionBids(
            item.id
          );
          return { ...item, bids: bidsData };
        })
      );

      sortedData.sort((a, b) => {
        return (
          new Date(b.created_at || b.createdAt) -
          new Date(a.created_at || a.createdAt)
        );
      });

      // Debug: Log location data structures
      console.log(
        "Listings sample:",
        sortedData.slice(0, 5).map((listing) => ({
          id: listing.id,
          type: listing._display_type,
          location: listing.location,
          city: listing.city,
          status: listing.status,
          listing_type: listing.listing_type,
        }))
      );

      setAuctions(sortedData);
      filterAuctions(sortedData, selectedCity);
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Normalize city names to handle special characters and common variations
  const normalizeCity = (city) => {
    if (!city) return "";

    // Lowercase and trim
    let normalized = city.toLowerCase().trim();

    // Handle special cases with Turkish characters
    const replacements = {
      istanbul: "istanbul",
      İstanbul: "istanbul",
      ıstanbul: "istanbul",
      izmir: "izmir",
      İzmir: "izmir",
      izmır: "izmir",
      ankara: "ankara",
    };

    return replacements[normalized] || normalized;
  };

  // Normalize district names to handle special characters and common variations
  const normalizeDistrict = (district) => {
    if (!district) return "";

    // Lowercase and trim
    let normalized = district.toLowerCase().trim();

    // Remove accent marks from Turkish characters
    const replacements = {
      kadıköy: "kadikoy",
      üsküdar: "uskudar",
      şişli: "sisli",
      beşiktaş: "besiktas",
      bayraklı: "bayrakli",
      çankaya: "cankaya",
      keçiören: "kecioren",
    };

    return replacements[normalized] || normalized;
  };

  // Filter auctions based on criteria
  const filterAuctions = (dataToFilter = auctions, selectedCity = "") => {
    console.log(
      "Starting filtering with",
      dataToFilter.length,
      "total listings"
    );
    let filtered = [...dataToFilter].map((item) => {
      const now = new Date();
      const utcStartDate = new Date(item.startTime || item.start_time);
      const utcEndDate = new Date(item.endTime || item.end_time);

      const startTime = new Date(
        utcStartDate.getUTCFullYear(),
        utcStartDate.getUTCMonth(),
        utcStartDate.getUTCDate(),
        utcStartDate.getUTCHours(),
        utcStartDate.getUTCMinutes(),
        utcStartDate.getUTCSeconds()
      );
      const endTime = new Date(
        utcEndDate.getUTCFullYear(),
        utcEndDate.getUTCMonth(),
        utcEndDate.getUTCDate(),
        utcEndDate.getUTCHours(),
        utcEndDate.getUTCMinutes(),
        utcEndDate.getUTCSeconds()
      );
      // const utcDate = new Date(item.startTime || item.start_time);

      // const startdate = new Date(
      //   utcDate.getUTCFullYear(),
      //   utcDate.getUTCMonth(),
      //   utcDate.getUTCDate(),
      //   utcDate.getUTCHours(),
      //   utcDate.getUTCMinutes(),
      //   utcDate.getUTCSeconds()
      // );

      if (now < startTime) {
        return { ...item, status: "upcoming" };
      }
      if (now > endTime) {
        return { ...item, status: "ended" };
      }
      return { ...item, status: "active" };
      // return "active";
      // if (now > startdate) {
      //   return { ...item, status: "active" };
      // } else {
      //   return { ...item, status: "upcoming" };
      // }
    });

    // console.log(filtered, "FILTERED");

    // Filter by listing type if not "new" (new shows both types)
    if (listingType === "auction") {
      filtered = filtered.filter(
        (item) =>
          item._display_type === "auction" || item.listing_type === "auction"
      );
      console.log(
        "After listing type filter:",
        filtered.length,
        "listings left"
      );
    } else if (listingType === "offer") {
      filtered = filtered.filter(
        (item) =>
          item._display_type === "offer" || item.listing_type === "offer"
      );
      console.log(
        "After listing type filter:",
        filtered.length,
        "listings left"
      );
    } else if (listingType === "new") {
      // Add filter function in order to remove ended auctions
      filtered = filtered.filter(
        (item) => item.status !== "ended" || item.listing_type === "offer"
      );
    }

    // Filter by auction status for auction listings
    if (listingType === "auction") {
      const now = new Date();

      filtered = filtered.filter((auction) => {
        const status = auction.status;
        const startTime = auction.start_time
          ? new Date(auction.start_time)
          : auction.startTime
          ? new Date(auction.startTime)
          : null;
        const endTime = auction.end_time
          ? new Date(auction.end_time)
          : auction.endTime
          ? new Date(auction.endTime)
          : auction.end_date
          ? new Date(auction.end_date)
          : null;

        // Comment all times as they break the logic
        switch (auctionStatus) {
          case "active":
            // Either explicitly marked as active or current time is within auction window
            return status === "active"; // || (startTime && endTime && now >= startTime && now <= endTime)

          case "upcoming":
            // Either explicitly marked as upcoming or start time is in the future
            return status === "upcoming"; // || (startTime && now < startTime);
          case "ended":
            // Either explicitly marked as ended or end time is in the past
            return (
              status === "ended" || status === "completed" //||  (endTime && now > endTime)
            );
          default:
            return true;
        }
      });
      console.log("After status filter:", filtered.length, "listings left");
    }

    // Filter by city
    if (selectedCity) {
      const normalizedSelectedCity = normalizeCity(selectedCity);
      console.log("Filtering by city:", selectedCity);

      filtered = filtered.filter((listing) => {
        // Check if the location contains the city name
        if (typeof listing.location === "string" && listing.location) {
          if (listing.location.toLowerCase().includes(normalizedSelectedCity)) {
            return true;
          }
        }

        // Check location as object
        if (listing.location && typeof listing.location === "object") {
          const locationCity = normalizeCity(listing.location.city || "");
          if (locationCity && locationCity.includes(normalizedSelectedCity)) {
            return true;
          }
        }

        // Check separate city field
        if (
          listing.city &&
          normalizeCity(listing.city).includes(normalizedSelectedCity)
        ) {
          return true;
        }

        // Check neighborhood field that might contain city info
        if (listing.neighborhood_name || listing.neighborhoodName) {
          const neighborhood = normalizeCity(
            listing.neighborhood_name || listing.neighborhoodName
          );
          if (neighborhood && neighborhood.includes(normalizedSelectedCity)) {
            return true;
          }
        }

        // Check address field that might contain city
        if (listing.address && typeof listing.address === "string") {
          if (listing.address.toLowerCase().includes(normalizedSelectedCity)) {
            return true;
          }
        }

        return false;
      });
      console.log("After city filter:", filtered.length, "listings left");
    }

    setFilteredAuctions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Apply filters when search form is submitted
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting search with city:", selectedCity);
    filterAuctions(undefined, selectedCity);
  };

  // Reset all filters
  /*   const resetFilters = () => {
    // Müsterinin istegi üzerine aktif açik artirmalara yönlendiriliyor.
    setSelectedCity("");
    filterAuctions();
    setCurrentPage(1);
    handleListingTypeChange("new");
  }; */

  // Get paginated results
  const getPaginatedAuctions = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filteredAuctions
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(startIndex, endIndex);
  };

  // Handle city change
  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
  };

  // Handle listing type change
  const handleListingTypeChange = (type) => {
    setListingType(type);
    setCurrentPage(1);
  };

  // Handle auction status change
  const handleStatusChange = (status) => {
    setAuctionStatus(status);
    setCurrentPage(1);
  };

  const formatNumber = (number) => {
    if (number === undefined || number === null) return "";
    return parseFloat(number).toLocaleString("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatPrice = (price) => {
    return (
      new Intl.NumberFormat("tr-TR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price || 0) + " ₺"
    );
  };

  const getStatusText = (status, itemType) => {
    if (itemType === "offer") return "Satılık";

    switch (status) {
      case "active":
        return "Aktif";
      case "upcoming":
        return "Yaklaşan";
      case "completed":
      case "ended":
        return "Tamamlandı";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  const getStatusIcon = (status, listingType) => {
    if (listingType === "offer") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: "1rem", height: "1rem", marginRight: "0.375rem" }}
        >
          <path d="M2 9h20M2 15h20" />
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <line x1="12" y1="4" x2="12" y2="8" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      );
    }

    switch (status) {
      case "active":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "1rem", height: "1rem", marginRight: "0.375rem" }}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case "upcoming":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "1rem", height: "1rem", marginRight: "0.375rem" }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "1rem", height: "1rem", marginRight: "0.375rem" }}
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
    }
  };

  // Get formatted location from auction
  const getAuctionLocation = (auction) => {
    if (!auction) return "Konum bilgisi yok";

    // If location is an object with city and district
    if (auction.location && typeof auction.location === "object") {
      const city = auction.location.city;
      const district = auction.location.district;
      if (city && district) return `${city}, ${district}`;
      if (city) return city;
    }

    // If location is a string with commas, split and reverse to put city first
    if (
      auction.location &&
      typeof auction.location === "string" &&
      auction.location.includes(",")
    ) {
      return auction.location.split(",").reverse().join(", ").trim();
    }

    // If location is a simple string without commas
    if (auction.location && typeof auction.location === "string") {
      return auction.location;
    }

    // If neighborhood is specified
    if (auction.neighborhood_name || auction.neighborhoodName) {
      const neighborhood =
        auction.neighborhood_name || auction.neighborhoodName;

      // If we also have city/district
      if (auction.city || auction.district) {
        const parts = [];
        if (auction.city) parts.push(auction.city);
        if (auction.district) parts.push(auction.district);
        if (neighborhood) parts.push(neighborhood);
        return parts.join(", ");
      }

      return neighborhood;
    }

    // If separate city/district fields
    if (auction.city || auction.district) {
      const parts = [];
      if (auction.city) parts.push(auction.city);
      if (auction.district) parts.push(auction.district);
      return parts.join(", ");
    }

    // If we have address but no location
    if (auction.address && typeof auction.address === "string") {
      // Split by comma and reverse to put city first
      const addressParts = auction.address.split(",");
      if (addressParts.length > 1) {
        return addressParts.reverse().join(", ").trim();
      }
      return auction.address;
    }

    return "Konum bilgisi yok";
  };

  // Yardımcı fonksiyon: En yüksek teklifi bul
  const getCurrentBid = (listing) => {
    if (Array.isArray(listing.bids) && listing.bids.length > 0) {
      return Math.max(...listing.bids.map((bid) => bid.amount));
    }
    return (
      listing.highest_bid ||
      listing.final_price ||
      listing.finalPrice ||
      listing.starting_price ||
      listing.startingPrice ||
      listing.starting_bid ||
      0
    );
  };

  // const getMinimumBidAmount = (listing) => {
  //   // Eğer teklif geçmişi varsa en yüksek teklifi bul
  //   if (Array.isArray(listing.bids) && listing.bids.length > 0) {
  //     return Math.max(...listing.bids.map((bid) => bid.amount));
  //   }
  //   // Yoksa highest_bid, final_price, starting_price gibi alanlardan uygun olanı döndür
  //   return (
  //     listing.highest_bid ||
  //     listing.final_price ||
  //     listing.finalPrice ||
  //     listing.starting_price ||
  //     listing.startingPrice ||
  //     listing.starting_bid ||
  //     0
  //   );
  // };

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

  // useEffect(() => {
  //   const fetchBidsForAuctions = async () => {
  //     const updatedAuctions = await Promise.all(
  //       auctions.map(async (auction) => {
  //         if (auction.listing_type === "auction") {
  //           const { data, error } = await supabase
  //             .from("bids")
  //             .select("*, profiles ( full_name, avatar_url )")
  //             .eq("auction_id", auction.id)
  //             .order("amount", { ascending: false });

  //           if (error) {
  //             console.error("Error fetching bids:", error);
  //             return auction; // return unchanged auction on error
  //           }

  //           return {
  //             ...auction,
  //             bids: data || [],
  //           };
  //         } else {
  //           return auction; // No change for non-auction types
  //         }
  //       })
  //     );

  //     setAuctions(updatedAuctions);
  //   };

  //   console.log(auctions, "HAHAHAHAHA");

  //   if (auctions.length > 0) {
  //     fetchBidsForAuctions();
  //   }
  // }, [auctions]);

  const handleShare = async (e, auction) => {
    e.stopPropagation(); // Prevent card click navigation
    const shareUrl = `${window.location.origin}/auctions/${auction.id}`;
    const shareTitle = auction.title || "Arazi İlanı";
    const shareText = `${shareTitle} - arazialcom.net'de incele!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage("Link panoya kopyalandı!");
        setTimeout(() => setShareMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback for failed share attempts
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Link panoya kopyalandı!");
      setTimeout(() => setShareMessage(""), 3000);
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {selectedCity && selectedCity !== ""
            ? `${selectedCity} Arazi İhaleleri | Arazialcom`
            : "Türkiye Arazi İhaleleri | Arazialcom"}
        </title>
        <meta
          name="description"
          content={
            selectedCity && selectedCity !== ""
              ? `${selectedCity} ili arazi ihaleleri. ${selectedCity} bölgesindeki değerli araziler için teklif verin. Güvenli ödeme, şeffaf süreç.`
              : `Türkiye genelindeki arsa, tarla ve arazi ilanlarını açık artırma sistemiyle güvenli ve şeffaf şekilde sunuyoruz. Dijital ihale süreciyle yatırımınızı kolayca yönetin. arazialcom – Toprağa yatırımın yeni adresi.`
          }
        />
        <meta
          name="keywords"
          content={
            selectedCity && selectedCity !== ""
              ? `${selectedCity} arazi ihalesi, ${selectedCity} arazi satışı, ${selectedCity} emlak ihalesi, ${selectedCity} arazi yatırımı`
              : "arazi ihalesi, arazi satışı, emlak ihalesi, arazi yatırımı, gayrimenkul ihalesi, Türkiye arazi, ihale platformu"
          }
        />

        {/* Open Graph Tags */}
        <meta
          property="og:title"
          content={
            selectedCity && selectedCity !== ""
              ? `${selectedCity} Arazi İhaleleri | Arazialcom`
              : "Türkiye Arazi İhaleleri | Arazialcom"
          }
        />
        <meta
          property="og:description"
          content={
            selectedCity && selectedCity !== ""
              ? `${selectedCity} ili arazi ihaleleri. ${selectedCity} bölgesindeki değerli araziler için teklif verin.`
              : `Türkiye genelindeki arsa, tarla ve arazi ilanlarını açık artırma sistemiyle güvenli ve şeffaf şekilde sunuyoruz. Dijital ihale süreciyle yatırımınızı kolayca yönetin. arazialcom – Toprağa yatırımın yeni adresi.`
          }
        />
        <meta
          property="og:image"
          content="https://www.arazialcom.net/logo.png"
        />
        <meta property="og:url" content="https://www.arazialcom.net/" />
        <meta property="og:type" content="website" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={
            selectedCity && selectedCity !== ""
              ? `${selectedCity} Arazi İhaleleri | Arazialcom`
              : "Türkiye Arazi İhaleleri | Arazialcom"
          }
        />
        <meta
          name="twitter:description"
          content={
            selectedCity && selectedCity !== ""
              ? `${selectedCity} ili arazi ihaleleri. Değerli araziler için teklif verin.`
              : `Türkiye'nin değerli arazileri için ihale tekliflerinizi verin.`
          }
        />
        <meta
          name="twitter:image"
          content="https://www.arazialcom.net/logo.png"
        />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name:
              selectedCity && selectedCity !== ""
                ? `${selectedCity} Arazi İhaleleri`
                : "Türkiye Arazi İhaleleri",
            description:
              selectedCity && selectedCity !== ""
                ? `${selectedCity} ili arazi ihaleleri ve değerli araziler için ihale platformu`
                : "Türkiye'nin en güvenilir arazi ihale platformu",
            url: "https://www.arazialcom.net/",
            mainEntity: {
              "@type": "ItemList",
              name: "Arazi İhaleleri",
              numberOfItems: filteredAuctions.length,
              itemListElement: filteredAuctions
                .slice(0, 10)
                .map((auction, index) => ({
                  "@type": "RealEstateListing",
                  position: index + 1,
                  name: auction.title,
                  description:
                    auction.description ||
                    `${
                      auction.city || selectedCity || "Türkiye"
                    } bölgesinde arazi ihalesi`,
                  url: `https://www.arazialcom.net/auction/${auction.id}`,
                  price: auction.starting_price || auction.startingPrice,
                  priceCurrency: "TRY",
                })),
            },
          })}
        </script>
      </Helmet>
      <HeroSection>
        <HeroContent>
          <HeroSubtitle style={{ color: "white" }}>
            Türkiye'nin dört bir yanındaki değerli araziler için ihale
            tekliflerinizi verin.
          </HeroSubtitle>

          <SearchComponent
            selectedCity={selectedCity}
            handleSearchSubmit={handleSearchSubmit}
            handleCityChange={handleCityChange}
            resetFilters={resetFilters}
          />

          <PopularSearches>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedCity("Kütahya");
                // filterAuctions();
              }}
            >
              Kütahya
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedCity("Konya");
                // filterAuctions();
              }}
            >
              Konya
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedCity("Uşak");
                // filterAuctions();
              }}
            >
              Uşak
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedCity("");
                //  filterAuctions();
              }}
            >
              Tüm Şehirler
            </a>
          </PopularSearches>
        </HeroContent>
      </HeroSection>

      <div
        style={{
          background: "#fff",
          minHeight: "100vh",
          paddingBottom: "3rem",
        }}
      >
        <PageContainer>
          <TabsContainer>
            <TabButton
              $isActive={listingType === "offer"}
              onClick={() => handleListingTypeChange("offer")}
            >
              SATIN ALINABİLİR
            </TabButton>
            <TabButton
              $isActive={listingType === "auction"}
              onClick={() => handleListingTypeChange("auction")}
            >
              AÇIK ARTIRMALAR
            </TabButton>
            <TabButton
              $isActive={listingType === "new"}
              onClick={() => handleListingTypeChange("new")}
            >
              YENİ İLANLAR
            </TabButton>
          </TabsContainer>

          {listingType === "auction" && (
            <StatusTabs>
              <StatusTab
                active={auctionStatus === "active"}
                onClick={() => handleStatusChange("active")}
              >
                Devam Edenler
              </StatusTab>
              <StatusTab
                active={auctionStatus === "upcoming"}
                onClick={() => handleStatusChange("upcoming")}
              >
                Yakında
              </StatusTab>
              <StatusTab
                active={auctionStatus === "ended"}
                onClick={() => handleStatusChange("ended")}
              >
                Tamamlanmış
              </StatusTab>
            </StatusTabs>
          )}

          <AuctionGridComponent
            items={getPaginatedAuctions()}
            isLoading={isLoading}
            auctions={auctions}
            listingType={listingType}
            setShareMessage={setShareMessage}
          />

          {/* <AuctionsGrid>
            {isLoading ? (
              // Show skeletons while loading
              Array(6)
                .fill(0)
                .map((_, index) => (
                  <AuctionCard
                    key={`skeleton-${index}`}
                    style={{ opacity: 0.7 }}
                  >
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
            ) : getPaginatedAuctions().length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "3rem 0",
                }}
              >
                <p>Şu anda görüntülenebilecek satış ilanı bulunmamaktadır.</p>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={resetFilters}
                  style={{ marginTop: "1rem" }}
                >
                  Tüm Açık Arttırmaları Göster
                </Button>
              </div>
            ) : (
              getPaginatedAuctions()
                .map((listing) => {
                  return (
                    <AuctionCard
                      key={listing.id}
                      onClick={() => handleAuctionClick(listing.id)}
                    >
                      <AuctionImage>
                        <img
                          src={
                            listing.images?.[0] ||
                            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                          }
                          alt={listing.title}
                        />

                        <AuctionStatusBadge
                          status={listing.status}
                          type={listing._display_type}
                        >
                          {getStatusText(listing.status, listing._display_type)}
                        </AuctionStatusBadge>
                        {listingType === "new" &&
                          listing._display_type !== "offer" && (
                            <AuctionTypeTag>Açık Arttırma</AuctionTypeTag>
                          )}
                      </AuctionImage>
                      <AuctionContent>
                        <AuctionTitle>
                          {listing.title || "Emlak İlanı"}
                        </AuctionTitle>
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
                                onClick={(e) => handleShare(e, listing)}
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
                                  //margin: "1rem 0",
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
                          {listing._display_type !== "offer" && (
                            <PriceInfo>
                              <span> Artış Tutarı:</span>
                              <AuctionPrice>
                                {formatPrice(
                                  listing.minIncrement ||
                                    listing.minIncrement ||
                                    0
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
                          {listing._display_type === "offer" ? (
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
                                endTime={
                                  listing.start_time || listing.startTime
                                }
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
          </AuctionsGrid> */}

          {/* Pagination Controls */}
          {filteredAuctions.length > itemsPerPage && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "2rem",
                gap: "0.5rem",
              }}
            >
              <Button
                variant="secondary"
                size="small"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>

              {Array.from(
                { length: Math.ceil(filteredAuctions.length / itemsPerPage) },
                (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "primary" : "secondary"}
                    size="small"
                    onClick={() => setCurrentPage(i + 1)}
                    style={{ minWidth: "40px" }}
                  >
                    {i + 1}
                  </Button>
                )
              )}

              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredAuctions.length / itemsPerPage)
                    )
                  );
                }}
                disabled={
                  currentPage ===
                  Math.ceil(filteredAuctions.length / itemsPerPage)
                }
              >
                Sonraki
              </Button>
            </div>
          )}
        </PageContainer>
      </div>
      <ShareNotification show={!!shareMessage}>
        {shareMessage}
      </ShareNotification>
    </>
  );
};

export default Home;
