// src/clusterIcon.js
import L from 'leaflet';

export const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount();
  let size = 'small';
  if (count >= 50) size = 'large';
  else if (count >= 10) size = 'medium';

  return L.divIcon({
    html: `<div class="cluster-icon cluster-icon--${size}"><span>${count}</span></div>`,
    className: 'cluster-icon-wrapper',
    iconSize: L.point(40, 40, true),
  });
};
