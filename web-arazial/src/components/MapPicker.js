import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

function MapPicker({ onLocationSelect, coordinates }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyB1-FfO0sN-Qv0JTJNOfi9KqYlm4ohaCHM",
  });
  const center = {
    lat: coordinates?.lat || 39.9208,
    lng: coordinates?.lng || 32.8541,
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
    <p>Loading...</p>
  );
}

export default MapPicker;
