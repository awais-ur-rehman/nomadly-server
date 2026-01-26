/**
 * Mock for @turf/turf library to avoid ES module issues in Jest
 */

export const lineString = (coordinates: number[][]) => ({
    type: 'Feature',
    geometry: {
        type: 'LineString',
        coordinates,
    },
    properties: {},
});

export const point = (coordinates: number[]) => ({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates,
    },
    properties: {},
});

export const distance = (from: any, to: any) => {
    // Simple Haversine distance approximation for testing
    const lat1 = from.geometry?.coordinates?.[1] || 0;
    const lon1 = from.geometry?.coordinates?.[0] || 0;
    const lat2 = to.geometry?.coordinates?.[1] || 0;
    const lon2 = to.geometry?.coordinates?.[0] || 0;

    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const lineIntersect = (line1: any, line2: any) => ({
    type: 'FeatureCollection',
    features: [],
});

export const nearestPointOnLine = (line: any, point: any) => ({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: point.geometry?.coordinates || [0, 0],
    },
    properties: {
        dist: 0,
        location: 0,
    },
});

export default {
    lineString,
    point,
    distance,
    lineIntersect,
    nearestPointOnLine,
};
