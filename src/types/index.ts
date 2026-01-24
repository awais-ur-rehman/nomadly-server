export interface JWTPayload {
  userId: string;
  email: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface GeospatialPoint {
  type: "Point";
  coordinates: [number, number];
}
