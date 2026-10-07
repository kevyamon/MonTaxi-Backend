const { RIDE_TIERS } = require('../../constants/ride.constants');

// Calcul de la distance géodésique (Formule de Haversine)
const calculateDistanceKm = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Arrondi à 2 décimales
};

// Estimation de la durée du trajet en minutes (vitesse moyenne urbaine 25 km/h)
const estimateDurationMin = (distanceKm) => {
  const averageSpeedKmH = 25;
  const duration = (distanceKm / averageSpeedKmH) * 60;
  return Math.max(5, Math.round(duration)); // Minimum 5 minutes
};

// Calcul du montant de la course selon le forfait
const calculateFare = (distanceKm, durationMin, tier = RIDE_TIERS.ECO) => {
  const isVip = tier === RIDE_TIERS.VIP;

  // Grille tarifaire paramétrable
  const basePrice = isVip ? 1000 : 500; // Prise en charge FCFA
  const pricePerKm = isVip ? 450 : 250; // FCFA par km
  const pricePerMin = isVip ? 50 : 30; // FCFA par min

  const calculatedTotal = basePrice + distanceKm * pricePerKm + durationMin * pricePerMin;

  // Arrondi aux 100 FCFA supérieurs
  const totalPrice = Math.ceil(calculatedTotal / 100) * 100;

  return {
    basePrice,
    distanceKm,
    durationMin,
    totalPrice: Math.max(basePrice, totalPrice)
  };
};

// Formatage convivial d'une adresse de géocodage
const formatFriendlyAddress = (rawAddress, district = '', landmark = '', distanceMeters = 0) => {
  if (district && landmark) {
    const proximity = distanceMeters > 0 ? `à ${distanceMeters}m de ` : 'près de ';
    return `${district}, ${proximity}${landmark}`;
  }
  return rawAddress || 'Abidjan, Côte d’Ivoire';
};

module.exports = {
  calculateDistanceKm,
  estimateDurationMin,
  calculateFare,
  formatFriendlyAddress
};
