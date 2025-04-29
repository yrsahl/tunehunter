import { findBestSongMatch, transformCurrencyStringToIcon } from "@/helpers/format-vendor-data";
import { VendorDataResponse, VendorDataSchema } from "@/schemas";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { ITunesData } from "@/types/itunes";
import { VendorData, VendorFileFormat, VendorTrackData } from "@/types/vendor";
import axios from "axios";

const fetchItunesData = async (
  id: string,
  region: string,
  duration: number,
  title: string,
  artist: string,
) => {
  const dataUrl = new URL(
    `https://itunes.apple.com/search?country=${region}&media=music&entity=song&limit=5&term=${title}+${artist}`,
  ).href;
  const response = await axios.get<ITunesData>(dataUrl);

  // File data is same for all tracks
  const iTunesFileData: VendorFileFormat = {
    format: "AAC",
    quality: "256kbps",
  };

  // Go through results and find the best match for this file type (only one on iTunes)
  const itunesTrackOptions: VendorTrackData[] = response.data.results.map((song) => ({
    duration: song.trackTimeMillis,
    currency: transformCurrencyStringToIcon(song.currency),
    price: song.trackPrice || 0,
    url: song.trackViewUrl,
  }));
  const iTunesTrack = findBestSongMatch(itunesTrackOptions, duration);

  // Return data if match was found
  if (iTunesTrack) {
    const iTunesData: VendorData = {
      id: id,
      vendor: { store: "itunes", region: region, artistsShare: 0.7 },
      tracks: [
        {
          fileData: iTunesFileData,
          trackData: iTunesTrack,
        },
      ],
    };

    return {
      data: iTunesData,
    };
  }

  // Return empty object if no match found
  return {
    error: "NO_MATCH_FOUND",
  };
};

export const externalVendorRouter = createTRPCRouter({
  // Usually 256kbps AAC, sometimes 320kbps
  getItunesData: publicProcedure
    .input(VendorDataSchema)
    .query<VendorDataResponse>(async ({ ctx, input }) => {
      // Validate input
      if (!input || !input.id || !input.region) {
        return {
          error: "INVALID_FIELDS",
        };
      }

      // 1. Try DB first

      // 2. If no DB, hit external API
      const iTunesVendorData = await fetchItunesData(
        input.id,
        input.region,
        input.duration,
        input.title,
        input.artist,
      );
      if (iTunesVendorData.data) {
        // Store in DB

        // Return
        return {
          data: iTunesVendorData.data,
        };
      }

      return {
        error: "NO_DATA_FOUND",
      };
    }),

  // getBandcampData: publicProcedure
  //   .input(VendorDataSchema)
  //   .query<VendorDataResponse>(async ({ ctx, input }) => {
  //     // Validate input
  //     if (!input || !input.id || !input.region) {
  //       return {
  //         error: "INVALID_FIELDS",
  //       };
  //     }

  //     return {
  //       data: {
  //         store: "bandcamp",
  //         region: input.region,
  //         artistsShare: 0.85,
  //         id: input.id,
  //         tracks: [
  //           {
  //             fileFormat: "FLAC",
  //             duration: 180,
  //             quality: "lossless",
  //             price: 1.29,
  //             currency: "$",
  //             url: "https://bandcamp.com",
  //           },
  //         ],
  //       },
  //     };

  //     // 1. Try DB first
  //     // 2. If no DB, hit external API or scrape
  //     // 2a. Store data in DB
  //   }),

  // 320 kbps or WAV
  // getBeatportData: publicProcedure
  //   .input(VendorDataSchema)
  //   .query<VendorDataResponse>(async ({ ctx, input }) => {
  //     // Validate input
  //     if (!input || !input.id || !input.region) {
  //       return {
  //         error: "INVALID_FIELDS",
  //       };
  //     }

  //     return {
  //       data: {
  //         store: "beatport",
  //         region: "global",
  //         id: "5",
  //         artistsShare: 0.6,
  //         tracks: [
  //           {
  //             duration: 180,
  //             fileFormat: "MP3",
  //             quality: "320kbps",
  //             price: 1.29,
  //             currency: "$",
  //             url: "https://beatport.com",
  //           },
  //         ],
  //       },
  //     };
  //     // 1. Try DB first
  //     // 2. If no DB, hit external API or scrape
  //     // 2a. Store data in DB
  //   }),

  // Usually 256 kbps MP3, sometimes 320kbps
  // getAmazonData: publicProcedure
  //   .input(VendorDataSchema)
  //   .query<VendorDataResponse>(async ({ ctx, input }) => {
  //     // Validate input
  //     if (!input || !input.id || !input.region) {
  //       return {
  //         error: "INVALID_FIELDS",
  //       };
  //     }

  //     return {
  //       data: {
  //         store: "amazon_music",
  //         region: input.region,
  //         id: input.id,
  //         artistsShare: 0.7,
  //         tracks: [
  //           {
  //             duration: 180,
  //             fileFormat: "MP3",
  //             quality: "256kbps",
  //             price: 0.99,
  //             currency: "$",
  //             url: "https://amazon.com",
  //           },
  //         ],
  //       },
  //     };

  //     // 1. Try DB first
  //     // 2. If no DB, hit external API or scrape
  //     // 2a. Store data in DB
  //   }),

  // Choose your file type!
});
