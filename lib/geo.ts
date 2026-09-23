// Point must be { lat, lng }, polygon is an array of [lng, lat] pairs (GeoJSON format)
export function isPointInPolygon(point: { lat: number; lng: number }, polygon: [number, number][]) {
    const x = point.lng;
    const y = point.lat;
    let inside = false;

    // Ray-casting algorithm
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0];
        const yi = polygon[i][1];
        const xj = polygon[j][0];
        const yj = polygon[j][1];

        const intersect =
            yi > y !== yj > y &&
            x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
    }

    return inside;
}
