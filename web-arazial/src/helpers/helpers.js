import { supabase } from "../supabaseClient";

export const formatDateWithHour = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    const hour = String(date.getUTCHours()).padStart(2, "0");
    const minute = String(date.getUTCMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hour}:${minute}`;
  } catch (e) {
    return "Geçersiz Tarih";
  }
};

export const formatNumber = (number) => {
  if (number === undefined || number === null) return "";
  return parseFloat(number).toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const formatDate = (date) => {
  const dateObj = new Date(date);

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${day}.${month}.${year}`;
};
export const getAuctionDetailsForSidebar = (auction, isOfferListing) => {
  const sidebarItems = [
    {
      name: "İlan Tarihi",
      value: formatDate(new Date(auction.created_at)),
    },
    {
      name: "Ada No",
      value: auction.ada_no,
    },
    {
      name: "Parsel No",
      value: auction.parsel_no,
    },
    {
      name: "İmar durumu",
      value: auction.emlak_tipi,
    },
    {
      name: "Alan (m²)",
      value: auction.area_size
        ? `${formatNumber(auction.area_size)} ${auction.area_unit || "m²"}`
        : "-",
    },
    {
      name: "İlan Sahibi",
      value: auction.ilan_sahibi || auction.profiles?.full_name || "Bilinmiyor",
    },
  ];

  if (!isOfferListing) {
    sidebarItems.push({
      name: "Başlangıç Tarihi",
      value: formatDateWithHour(auction.start_time),
    });
    sidebarItems.push({
      name: "Bitiş Tarihi",
      value: formatDateWithHour(auction.end_time),
    });
  }

  return sidebarItems;
};

export const auctionDetailTabContent = (auction) => {
  return [
    {
      id: "aciklama",
      label: "Açıklama",
      content: auction.description || "Açıklama girilmemiş.",
    },
    {
      id: "ozellikler",
      label: "Özellikler",
      content: auction.features || "Özellik girilmemiş.",
    },
    {
      id: "konum",
      label: "Konum",
      content: auction.locationInfo || "Konum girilmemiş.",
    },
    {
      id: "cevre",
      label: "Çevre",
      content: auction.environment || "Çevre girilmemiş.",
    },
  ];
};

export const cities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Şanlıurfa",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

export const getStatusText = (status, itemType) => {
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

export const getAuctionLocation = (auction) => {
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
    const neighborhood = auction.neighborhood_name || auction.neighborhoodName;

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

export const handleShare = async (e, auction, setShareMessage) => {
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

export const formatPrice = (price) => {
  return (
    new Intl.NumberFormat("tr-TR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0) + " ₺"
  );
};

export const getStatusIcon = (status, listingType) => {
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

export const resetFilters = (shouldRedirectHomePage = false, navigate) => {
  if (shouldRedirectHomePage) {
    navigate("/");
    return;
  }
  // Müsterinin istegi üzerine aktif açik artirmalara yönlendiriliyor.
  setSelectedCity("");
  filterAuctions();
  setCurrentPage(1);
  handleListingTypeChange("new");
};

export const toggleFavorite = async (
  e,
  auctionId,
  user,
  userFavorites,
  setUserFavorites
) => {
  e.stopPropagation();
  e.preventDefault();
  if (userFavorites.find((favourite) => favourite.auction_id === auctionId)) {
    await removeFavorite(auctionId, setUserFavorites, user);
  } else {
    await addFavorite(auctionId, setUserFavorites, user);
  }
};

export const addFavorite = async (auctionId, setUserFavorites, user) => {
  const { data, error } = await supabase
    .from("favorites")
    .insert([{ user_id: user?.id, auction_id: auctionId }]);

  if (error) {
    console.error("Error adding favorite:", error.message);
  } else {
    setUserFavorites((prevFavorites) => [
      ...prevFavorites,
      { auction_id: auctionId },
    ]);
  }
};

export const removeFavorite = async (auctionId, setUserFavorites, user) => {
  const { data, error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user?.id)
    .eq("auction_id", auctionId);

  if (error) {
    console.error("Error removing favorite:", error.message);
  } else {
    setUserFavorites((prevFavorites) =>
      prevFavorites.filter((fav) => fav.auction_id !== auctionId)
    );
  }
};

export const homePageInformationWrapperData = [
  {
    text: "Açık Artırma Sistemi Nasıl İşliyor?",
    detailedText: `Taşınmazlar, belirlenen başlangıç fiyatı üzerinden açık artırmaya sunulur. Katılım için teminat bedeli yatırılması zorunludur. Açık artırmayı kazanan katılımcının teminat bedeli satış bedelinden düşülmez. \n

Verilen teklif, taşınmazın belirlenmiş ekspertiz değerinin altında kalırsa satış gerçekleştirilmez. Satışın gerçekleşmemesi veya katılımcının ihaleyi kazanamaması durumunda teminat bedeli iade edilir.`,
    imageSource: "/auction-icon.jpeg",
  },
  {
    text: "Satın Alma Süreci Nasıl İşliyor?",
    detailedText: `Satın alma işlemleri için teminat bedeli yatırılması zorunludur. Satın alınan taşınmazlarda teminat bedeli, satış tutarından düşülür.\n

Satış sonrası ekibimiz sizinle iletişime geçerek kimlik bilgilerinizi talep eder ve gerekli resmi başvuruları yapar. Tapu harç bildirimleri geldiğinde, taraflarla birlikte uygun bir gün belirlenir ve tapu müdürlüğünde devir işlemleri gerçekleştirilir.`,
    imageSource: "/satinal-icon.jpeg",
  },
  {
    text: "🔍 arazialcom Nasıl Çalışır?",
    detailedText: `arazialcom, çoğunlukla kendi mülkiyetindeki arazileri veya kurumsal firmalara ait taşınmazları satışa sunar. Tek seferde 15–20 adet arazi satın alınır ve bu araziler hem açık artırma yöntemiyle hem de “Satın Al” yöntemiyle ilan edilir.\n

İlanı yayınlanan her taşınmaz, tapu ve mülkiyet durumu kontrol edilerek listelenir. Kullanıcılar, ilgilendikleri taşınmaz için teminat bedeli yatırarak teklif verebilir veya satın alma sürecini başlatabilir. Tüm işlemler şeffaf, kayıt altına alınmış ve güvenli ödeme altyapısı üzerinden gerçekleştirilir.\n

Vizyonumuz: Türkiye’nin en güvenilir ve en çok tercih edilen dijital arazi satış platformu olarak, herkesin güvenle yatırım yapabildiği bir sistem oluşturmak.\n
Misyonumuz: Toplu arazi alımları yaparak yatırımcılara uygun fiyatlı taşınmazlar sunmak ve herkesi güvenli bir şekilde arazi sahibi yapmak.`,
    imageSource: "/arazialcom-icon.jpeg",
  },
  {
    text: "Ödeme ve Tapu Süreci Nasıl İşliyor?",
    detailedText: `Satın alma veya açık artırma sürecinde, katılımcılardan ilk aşamada yalnızca teminat bedeli tahsil edilir. Tapu harç bildirimleri geldikten sonra, taraflarla birlikte tapu devir günü belirlenir.\n

Belirlenen günde tapu müdürlüğünde bir araya gelinir ve satış bedelinin kalan kısmı burada tahsil edilir. Ödeme işleminin ardından tapu devir süreci tamamlanarak taşınmaz alıcı adına tescil edilir.\n

Talep edilmesi halinde, tarafımıza verilecek noter onaylı vekâletname ile tapu işlemleri sizin adınıza tarafımızca da gerçekleştirilebilir.`,
    imageSource: "/paymentprocess-icon.jpeg",
  },
  {
    text: "Parsel Sorgu",
    detailedText: "",
    linkSource: "https://parselsorgu.tkgm.gov.tr/",
    imageSource: "/parselsorgu-icon.jpeg",
  },
];
