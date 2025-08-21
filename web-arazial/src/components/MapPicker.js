import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { citieslatlng } from "../helpers/citieslatlng";

const containerStyle = {
  width: "100%",
  height: "400px",
};

function MapPicker({ onLocationSelect, coordinates, city }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });
  const currentCity = citieslatlng.find(
    (item) =>
      item.il_adi.toLocaleLowerCase("tr-TR") === city.toLocaleLowerCase("tr-Tr")
  );
  const center = {
    lat: coordinates?.lat || currentCity?.lat || 39.9208,
    lng: coordinates?.lng || currentCity?.lon || 32.8541,
  };

  const [marker, setMarker] = useState(null);

  const onMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const selectedLocation = { lat, lng };
      setMarker(selectedLocation);
      console.log(selectedLocation);
      if (onLocationSelect) {
        onLocationSelect(selectedLocation);
      }
    },
    [onLocationSelect]
  );

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onClick={onMapClick}
    >
      {marker && <Marker position={marker} />}
    </GoogleMap>
  ) : (
    <p>Yükleniyor...</p>
  );
}

export default MapPicker;
