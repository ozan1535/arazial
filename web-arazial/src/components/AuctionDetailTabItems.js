import styled from "styled-components";
import { auctionDetailTabContent } from "../helpers/helpers";
import { GoogleMap, PolygonF, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { citiesWithTKGMId } from "../helpers/cities";

const TabContainer = styled.div`
  width: 100%;
`;

const Tabs = styled.div`
  display: flex;
`;

const Tab = styled.div`
  width: 100px;
  padding: 10px;
  text-align: center;
  border-top: ${(props) =>
    props.active ? "3px solid var(--color-primary)" : "#f0f0f0"};
  background-color: ${(props) => (props.active ? "white" : "#f0f0f0")};
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const TabContent = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  margin-top: 20px;
  display: ${(props) => (props.active ? "block" : "none")};
`;

const containerStyle = {
  height: "400px",
  width: "100%",
};

export default function AuctionDetailTabItems({ auction }) {
  const [activeTab, setActiveTab] = useState("aciklama");
  const [polygonCoordinatePaths, setPolygonCoordinatePaths] = useState(null);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    libraries: ["geometry", "drawing"],
  });
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const convertCoordinates = (coordinates) => {
    return coordinates?.[0].map(([lng, lat]) => ({ lat, lng }));
  };

  const matchesString = (str1, str2) => {
    return str1
      ?.toLocaleLowerCase("tr-TR")
      ?.trim()
      .includes(str2?.toLocaleLowerCase("tr-TR")?.trim());
  };

  const getCurrentCityCoordinates = async () => {
    if (polygonCoordinatePaths?.length > 0) return;
    const currentCityItems = citiesWithTKGMId.find((item) =>
      matchesString(auction?.city, item?.name)
    );

    if (!currentCityItems) return;

    const currentDistricts = currentCityItems.ilceler.find((item) =>
      matchesString(auction?.location, item?.name)
    );

    if (!currentDistricts) return;

    const currentNeighborhood = currentDistricts.mahalleler.find((item) =>
      matchesString(auction?.location, item?.name)
    );

    if (!currentNeighborhood) return;

    if (auction?.ada_no === "0") return;

    const res = await fetch(
      `https://arazialbackend.vercel.app/api/polygon?mahalle=${currentNeighborhood.id}&ada=${auction?.ada_no}&parsel=${auction?.parsel_no}`
    );

    const data = await res.json();
    const polygonPaths = convertCoordinates(data?.geometry?.coordinates);

    setPolygonCoordinatePaths(polygonPaths);
  };

  useEffect(() => {
    getCurrentCityCoordinates();
  }, [auction]);

  return (
    <TabContainer>
      <Tabs>
        {auctionDetailTabContent(auction).map((tab) => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </Tabs>

      {auctionDetailTabContent(auction).map((tab) => (
        <TabContent key={tab.id} active={activeTab === tab.id}>
          {tab.id === "konum" ? (
            polygonCoordinatePaths && polygonCoordinatePaths.length > 0 ? (
              isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={{
                    lat: polygonCoordinatePaths?.[0]?.lat,
                    lng: polygonCoordinatePaths?.[0]?.lng,
                  }}
                  // zoom={18}
                  onLoad={(map) => {
                    const bounds = new window.google.maps.LatLngBounds();
                    polygonCoordinatePaths.forEach((coord) => {
                      bounds.extend(coord);
                    });
                    map.fitBounds(bounds);
                  }}
                >
                  <PolygonF
                    paths={polygonCoordinatePaths}
                    options={{
                      fillColor: "green",
                      fillOpacity: 0.35,
                      strokeColor: "black",
                      strokeOpacity: 1,
                      strokeWeight: 2,
                    }}
                  />
                </GoogleMap>
              ) : (
                <div>Harita Yükleniyor...</div>
              )
            ) : (
              <iframe
                width="100%"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${tab?.content?.lat},${tab?.content?.lng}&output=embed`}
              />
            )
          ) : (
            <div>{tab.content}</div>
          )}
        </TabContent>
      ))}
    </TabContainer>
  );
}
