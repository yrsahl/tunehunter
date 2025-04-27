export type VendorData = {
  id: string;
  vendor: Vendor;
  tracks: VendorTrack[]; // One per file format
};

export type Vendor = {
  store: string;
  region: string;
  artistsShare: number;
};

export type VendorTrack = {
  fileData: VendorFileFormat;
  trackData: VendorTrackData;
};

export type VendorFileFormat = {
  format: string;
  quality: string;
};

export type VendorTrackData = {
  duration: number;
  currency: string;
  price: number;
  url: string;
};

export type VendorDataError = "INVALID_FIELDS" | "NO_MATCH_FOUND" | "NO_DATA_FOUND";
