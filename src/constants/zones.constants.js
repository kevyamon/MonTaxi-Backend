/**
 * Délimitation géométrique des zones d’activité MonTaxi
 * Région du Sud-Comoé : Bonoua, Aboisso, Adiaké
 */

const ACTIVITY_ZONES = [
  {
    id: 'bonoua',
    name: 'Bonoua',
    center: { latitude: 5.2719, longitude: -3.5956 },
    polygon: [
      { latitude: 5.305, longitude: -3.63 },
      { latitude: 5.305, longitude: -3.56 },
      { latitude: 5.235, longitude: -3.56 },
      { latitude: 5.235, longitude: -3.63 }
    ]
  },
  {
    id: 'aboisso',
    name: 'Aboisso',
    center: { latitude: 5.4678, longitude: -3.2064 },
    polygon: [
      { latitude: 5.505, longitude: -3.24 },
      { latitude: 5.505, longitude: -3.17 },
      { latitude: 5.425, longitude: -3.17 },
      { latitude: 5.425, longitude: -3.24 }
    ]
  },
  {
    id: 'adiake',
    name: 'Adiaké',
    center: { latitude: 5.2863, longitude: -3.304 },
    polygon: [
      { latitude: 5.325, longitude: -3.34 },
      { latitude: 5.325, longitude: -3.27 },
      { latitude: 5.245, longitude: -3.27 },
      { latitude: 5.245, longitude: -3.34 }
    ]
  }
];

const isPointInPolygon = (latitude, longitude, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude;
    const yi = polygon[i].longitude;
    const xj = polygon[j].latitude;
    const yj = polygon[j].longitude;

    const intersect =
      yi > longitude !== yj > longitude &&
      latitude < ((xj - xi) * (longitude - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
};

const checkLocationCoverage = (latitude, longitude) => {
  if (!latitude || !longitude) {
    return { isInCoverage: false, currentZone: null };
  }

  for (const zone of ACTIVITY_ZONES) {
    if (isPointInPolygon(latitude, longitude, zone.polygon)) {
      return { isInCoverage: true, currentZone: zone };
    }
  }

  return { isInCoverage: false, currentZone: null };
};

module.exports = {
  ACTIVITY_ZONES,
  isPointInPolygon,
  checkLocationCoverage
};
