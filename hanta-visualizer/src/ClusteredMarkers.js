// src/ClusteredMarkers.js

import React, { useRef } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Marker, Popup, useMap } from 'react-leaflet';
import { createClusterCustomIcon } from './clusterIcon';


const ClusteredMarkers = ({ markers, onMarkerClick, buildAlertIcon, selectedMarkerId, showDetailDrawer, onClosePopup }) => {
  const map = useMap();
  const popupRefs = useRef({});

  React.useEffect(() => {
    // Close popups on map click
    const handleMapClick = () => {
      Object.values(popupRefs.current).forEach(popup => {
        if (popup && popup._close) popup._close();
      });
      if (onClosePopup) onClosePopup();
    };
    map.on('click', handleMapClick);
    return () => map.off('click', handleMapClick);
  }, [map, onClosePopup]);

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterCustomIcon}
      showCoverageOnHover={false}
      spiderfyOnMaxZoom={true}
      maxClusterRadius={50}
    >
      {markers.map(marker => {
        const isSelected = marker.id === selectedMarkerId && showDetailDrawer;
        return (
          <Marker
            key={marker.id}
            position={marker.coordinates}
            icon={buildAlertIcon(marker, isSelected)}
            eventHandlers={{
              click: (e) => {
                onMarkerClick(marker.id);
                // Auto-pan to marker and open popup
                setTimeout(() => {
                  if (e.target && e.target.getPopup()) {
                    e.target.openPopup();
                  }
                  map.panTo(marker.coordinates, { animate: true });
                }, 0);
              },
            }}
          >
            <Popup
              ref={ref => { if (ref) popupRefs.current[marker.id] = ref; }}
              className="custom-map-popup"
              closeButton={false}
              autoPan={true}
              autoPanPadding={[30, 30]}
              autoPanSpeed={10}
              open={isSelected}
              eventHandlers={{
                remove: () => {
                  if (onClosePopup) onClosePopup();
                },
              }}
            >
              <div className="popup-content">
                <button
                  className="popup-close"
                  aria-label="Close popup"
                  onClick={() => {
                    if (popupRefs.current[marker.id]) popupRefs.current[marker.id]._close();
                    if (onClosePopup) onClosePopup();
                  }}
                >
                  ×
                </button>
                <div className="popup-details">
                  <strong>{marker.locationName}</strong><br />
                  {marker.reportCount} reports
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MarkerClusterGroup>
  );
};

export default ClusteredMarkers;
