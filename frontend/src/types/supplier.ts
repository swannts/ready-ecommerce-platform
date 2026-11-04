export interface Supplier {
  id: string;
  slug: string;
  name: string;
  type: "Mill" | "Farmer Cooperative" | "Distributor" | "Organic Farm";
  location: string;
  country: string;
  verified: boolean;
  rating: number;
  establishedYear: number;
  capacityMetricTonsMonthly: number;
  certifications: string[];
  bannerImage: string;
  avatarImage: string;
}

