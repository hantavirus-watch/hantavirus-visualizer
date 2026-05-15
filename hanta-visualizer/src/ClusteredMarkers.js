// src/ClusteredMarkers.js
import React from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Marker, Tooltip } from 'react-leaflet';
import { createClusterCustomIcon } from './clusterIcon';

const ClusteredMarkers = ({ markers, onMarkerClick, buildAlertIcon, selectedMarkerId, showDetailDrawer }) => (
  <MarkerClusterGroup
    chunkedLoading
    iconCreateFunction={createClusterCustomIcon}
    showCoverageOnHover={false}
    spiderfyOnMaxZoom={true}
    maxClusterRadius={50}
  >
    {markers.map(marker => (
      <Marker
        key={marker.id}
        position={marker.coordinates}
        icon={buildAlertIcon(marker, marker.id === selectedMarkerId && showDetailDrawer)}
        eventHandlers={{
          click: () => onMarkerClick(marker.id),
        }}
      >
        <Tooltip direction="top" offset={[0, -18]} opacity={1} permanent={false}>
          <div>
            <strong>{marker.locationName}</strong><br />
            {marker.reportCount} reports
          </div>
        </Tooltip>
      </Marker>
    ))}
  </MarkerClusterGroup>
);

export default ClusteredMarkers;
