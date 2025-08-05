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
