import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const externalVendorRouter = createTRPCRouter({
  getItunesData: publicProcedure
    .input(z.object({ songId: z.number() }))
    .query(async ({ ctx, input }) => {
      // 1. Try DB first
      // 2. If no DB, hit external API or scrape
      // 2a. Store data in DB
    }),

  getBeatportData: publicProcedure
    .input(z.object({ songId: z.number() }))
    .query(async ({ ctx, input }) => {
      // 1. Try DB first
      // 2. If no DB, hit external API or scrape
      // 2a. Store data in DB
    }),

  getAmazonData: publicProcedure
    .input(z.object({ songId: z.number() }))
    .query(async ({ ctx, input }) => {
      // 1. Try DB first
      // 2. If no DB, hit external API or scrape
      // 2a. Store data in DB
    }),

  getBandcampData: publicProcedure
    .input(z.object({ songId: z.number() }))
    .query(async ({ ctx, input }) => {
      // 1. Try DB first
      // 2. If no DB, hit external API or scrape
      // 2a. Store data in DB
    }),
});

// export const fetchPreviewData = async ({ country, title, artist, duration, album }: DataRequestQuery): Promise<TrackData[]> => {
//   let dataUrl = new URL(`https://itunes.apple.com/search?country=${country}&media=music&entity=song&limit=5&term=${title}+${artist}`).href;
//   if (album) dataUrl += `+${album}`;
//   const response = await axios.get<ITunesData>(dataUrl);
//   const data = response.data;

//   // Grab what we need from the response
//   const previewData: TrackData[] = data.results.map((song) => {
//     return {
//       title: song.trackName,
//       artist: song.artistName,
//       album: song.collectionName,
//       duration: song.trackTimeMillis,
//       qualityFormat: 'AAC', // todo: figure out format from song.previewUrl
//       qualityKbps: 256, // todo: figure out kbps from song.previewUrl
//       price: song.trackPrice,
//       songLink: song.trackViewUrl,
//       artLink: song.artworkUrl100.replace('100x100', '400x400'),
//     };
//   });

//   if (duration) {
//     previewData.sort(sortByMatchingDuration(duration));
//   }
//   return previewData;
// };
