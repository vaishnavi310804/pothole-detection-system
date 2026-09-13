const AUTHORITY_REGIONS = [
  {
    name: "Chandigarh",
    bounds: {
      minLat: 30.65,
      maxLat: 30.80,
      minLng: 76.70,
      maxLng: 76.85,
    },
    authority: {
      name: "Municipal Corporation Chandigarh",
      type: "Municipal Corporation",
      jurisdiction: "Chandigarh",
    },
  },
  {
    name: "Mohali",
    bounds: {
      minLat: 30.60,
      maxLat: 30.72,
      minLng: 76.65,
      maxLng: 76.75,
    },
    authority: {
      name: "Municipal Corporation Mohali",
      type: "Municipal Corporation",
      jurisdiction: "Mohali",
    },
  },
  {
    name: "Delhi",
    bounds: {
      minLat: 28.40,
      maxLat: 28.88,
      minLng: 76.84,
      maxLng: 77.34,
    },
    authority: {
      name: "Municipal Corporation of Delhi",
      type: "Municipal Corporation",
      jurisdiction: "Delhi",
    },
  },
  {
    name: "Bengaluru",
    bounds: {
      minLat: 12.80,
      maxLat: 13.15,
      minLng: 77.45,
      maxLng: 77.78,
    },
    authority: {
      name: "Bruhat Bengaluru Mahanagara Palike",
      type: "Municipal Corporation",
      jurisdiction: "Bengaluru",
    },
  },
  {
    name: "Mumbai",
    bounds: {
      minLat: 18.88,
      maxLat: 19.30,
      minLng: 72.75,
      maxLng: 73.00,
    },
    authority: {
      name: "Brihanmumbai Municipal Corporation",
      type: "Municipal Corporation",
      jurisdiction: "Mumbai",
    },
  },
];


const ADDRESS_KEYWORDS = [
  {
    keywords: ["chandigarh"],
    authority: {
      name: "Municipal Corporation Chandigarh",
      type: "Municipal Corporation",
      jurisdiction: "Chandigarh",
    },
  },
  {
    keywords: ["mohali"],
    authority: {
      name: "Municipal Corporation Mohali",
      type: "Municipal Corporation",
      jurisdiction: "Mohali",
    },
  },
  {
    keywords: ["delhi"],
    authority: {
      name: "Municipal Corporation of Delhi",
      type: "Municipal Corporation",
      jurisdiction: "Delhi",
    },
  },
  {
    keywords: ["bangalore", "bengaluru"],
    authority: {
      name: "Bruhat Bengaluru Mahanagara Palike",
      type: "Municipal Corporation",
      jurisdiction: "Bengaluru",
    },
  },
  {
    keywords: ["mumbai"],
    authority: {
      name: "Brihanmumbai Municipal Corporation",
      type: "Municipal Corporation",
      jurisdiction: "Mumbai",
    },
  },
];

const isWithinBounds = (latitude, longitude, bounds) => {
  return (
    latitude >= bounds.minLat &&
    latitude <= bounds.maxLat &&
    longitude >= bounds.minLng &&
    longitude <= bounds.maxLng
  );
};

/**
 * Safely determines responsible civic authority for a pothole report.
 * 
 * @param {Object} location - Location object containing latitude, longitude, address
 * @returns {Object} Structured authority details object
 */
export const determineAuthority = (location) => {
  const fallbackJurisdiction =
    location && typeof location.address === "string" && location.address.trim()
      ? location.address.trim()
      : "Unspecified";

  const defaultFallback = {
    name: "Authority requires verification",
    type: "Unknown",
    jurisdiction: fallbackJurisdiction,
    status: "Pending",
    source: "System Fallback",
    confidence: "None",
    needsManualReview: true,
    assignedAt: new Date(),
  };

  if (!location || typeof location !== "object") {
    return defaultFallback;
  }

  const rawLat = location.latitude;
  const rawLng = location.longitude;
  const numLat = Number(rawLat);
  const numLng = Number(rawLng);

  // Priority 1: Coordinate Matching
  const isLatValid =
    rawLat !== null &&
    rawLat !== undefined &&
    rawLat !== "" &&
    Number.isFinite(numLat) &&
    numLat >= -90 &&
    numLat <= 90;

  const isLngValid =
    rawLng !== null &&
    rawLng !== undefined &&
    rawLng !== "" &&
    Number.isFinite(numLng) &&
    numLng >= -180 &&
    numLng <= 180;

  if (isLatValid && isLngValid) {
    for (const region of AUTHORITY_REGIONS) {
      if (isWithinBounds(numLat, numLng, region.bounds)) {
        return {
          name: region.authority.name,
          type: region.authority.type,
          jurisdiction: region.authority.jurisdiction,
          status: "Assigned",
          source: "Coordinate Matching",
          confidence: "High",
          needsManualReview: false,
          assignedAt: new Date(),
        };
      }
    }
  }

  // Priority 2: Address Keyword Matching
  if (typeof location.address === "string" && location.address.trim()) {
    const normalizedAddress = location.address.toLowerCase();

    for (const item of ADDRESS_KEYWORDS) {
      const matchedKeyword = item.keywords.some((kw) =>
        normalizedAddress.includes(kw)
      );

      if (matchedKeyword) {
        return {
          name: item.authority.name,
          type: item.authority.type,
          jurisdiction: item.authority.jurisdiction,
          status: "Assigned",
          source: "Address Matching",
          confidence: "Medium",
          needsManualReview: false,
          assignedAt: new Date(),
        };
      }
    }
  }

  // Priority 3: System Fallback
  return defaultFallback;
};

export const SUPPORTED_AUTHORITIES = [
  { name: "Municipal Corporation Chandigarh", type: "Municipal Corporation", jurisdiction: "Chandigarh" },
  { name: "Municipal Corporation of Delhi", type: "Municipal Corporation", jurisdiction: "Delhi" },
  { name: "Bruhat Bengaluru Mahanagara Palike", type: "Municipal Corporation", jurisdiction: "Bengaluru" },
  { name: "Brihanmumbai Municipal Corporation", type: "Municipal Corporation", jurisdiction: "Mumbai" },
  { name: "Municipal Corporation Mohali", type: "Municipal Corporation", jurisdiction: "Mohali" },
];

export default determineAuthority;
