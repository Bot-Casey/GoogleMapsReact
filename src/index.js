import React from "react";
import ReactDOM, { render } from 'react-dom';
import mapStyles from "./mapStyles";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api"
import './index.css';

require('dotenv').config();
console.log(process.env.REACT_APP_GOOGLE_MAPS_KEY);

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
  padding: '0px 0px 0px 0px',
}

const center = {
  lat: 46.831073,
  lng: -100.773183
}

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
};

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
  });

  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const mapRef = React.useRef();

  const onMapClick = React.useCallback((event) => {
    setSelected(null);
    setMarkers(current => [
      ...current,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
      }])
  }, []);
  
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
    
  }, []);

  const panTo = React.useCallback(({ lat, lng, zoom }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(zoom);
  }, []);

  if (loadError) return "Error loading map";
  if (!isLoaded) return "Loading Maps";

  return (
    <div>
      <h4 className='waterMark'>Casey Stadick</h4>
      <Locate panTo={panTo} />
      <GoogleMap
        options={options}
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={center}
        onClick={onMapClick}
        onLoad={onMapLoad}>
        {markers.map(marker =>
          <Marker
            key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => {
              setSelected(marker);
            }}
          />
        )}

        {selected ? (
          <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
            <div>
              <h2>Stuff</h2>
            </div>
          </InfoWindow>
        ) : null}

      </GoogleMap>
    </div>
  );

}

function Locate({ panTo }) {
  return (
    <button className="locate" onClick={() => navigator.geolocation.getCurrentPosition(
      (position) => panTo({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        zoom: 15}),
      () => null)}><img className="homeImage" src="home.png"/></button>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);