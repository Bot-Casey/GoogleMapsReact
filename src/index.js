import React from 'react';
import ReactDOM, { render } from 'react-dom';
import mapStyles from './mapStyles';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import './index.css';

require('dotenv').config();
console.log(process.env.REACT_APP_GOOGLE_MAPS_KEY);

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
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

  const plotISS = async () => {
    let payload = null;

    await fetch('https://api.wheretheiss.at/v1/satellites/25544')
      .then(response => response.json())
      .then((data) => payload = data);

    const curTime = new Date();

    setMarkers( current =>  [
      ...current,
      {
      lat: payload.latitude,
      lng: payload.longitude,
      time: curTime,
    }]);
  }

  const panToISS = React.useCallback(({ lat, lng, zoom}) => {
    mapRef.issMarker.panTo({ lat, lng });
    mapRef.current.setZoom(zoom);
  }, []);

  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
    const issMarker = plotISS();
    console.log(issMarker);
  }, []);

  const panTo = React.useCallback(({ lat, lng, zoom }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(zoom);
  }, []);

  if (loadError) return 'Error loading map';
  if (!isLoaded) return 'Loading Maps';

  return (
    <div>
      <nav className='menu'>
        <ISS plotISS={plotISS} />
        <Locate panTo={panTo} />
      </nav>
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
              <h3>Coords:</h3>
              <h3>
              {Math.round(selected.lat * 100) / 100}, {Math.round(selected.lng * 100) / 100}
              </h3>
            </div>
          </InfoWindow>
        ) : null}

      </GoogleMap>
      <h4 className='waterMark'>Casey Stadick</h4>
    </div>
  );

}

function Locate({ panTo }) {
  return (
    <button className='locate' onClick={() => navigator.geolocation.getCurrentPosition(
      (position) => panTo({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        zoom: 15
      }),
      () => null)}><img className='locate-img' src='home.png' /></button>
  )
}

function ISS({ plotISS }) {
  return (
    <button className='iss' onClick={plotISS}><img className='iss-img' src='iss.png'></img></button>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <header>
      <title>Maps App<link href="logo.png" /></title>
      
    </header>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);