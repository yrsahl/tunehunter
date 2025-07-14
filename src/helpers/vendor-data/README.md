# Vendor Data Implementation Guide

This guide explains how to implement music store search functionality for different vendors.

## Current Status

| Vendor       | Status          | Implementation   | API Available |
| ------------ | --------------- | ---------------- | ------------- |
| iTunes       | ✅ **Working**  | Official API     | Yes           |
| Bandcamp     | ⚠️ **Basic**    | Web scraping     | Limited       |
| Beatport     | 🔧 **Template** | Needs Puppeteer  | No            |
| Amazon Music | 🔧 **Template** | Complex scraping | Closed beta   |

## Quick Start

### iTunes (Already Working)

```typescript
// Uses official iTunes Search API - no additional setup needed
const result = await fetchVendorData({
  vendorData: { vendorId: 1, store: "itunes" },
  region: "US",
  songData: { songId: "123", title: "Song", artist: "Artist", duration: 180000 },
});
```

### Bandcamp (Basic Implementation)

```typescript
// Basic web scraping - works but limited data quality
const result = await fetchVendorData({
  vendorData: { vendorId: 2, store: "bandcamp" },
  region: "US",
  songData: { songId: "123", title: "Song", artist: "Artist", duration: 180000 },
});
```

## Advanced Setup (For Beatport & Amazon)

### Option 1: Puppeteer Setup (Recommended for Beatport)

1. **Install dependencies:**

```bash
npm install puppeteer @types/puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
```

2. **Enable Puppeteer in the code:**

- Uncomment the imports and functions in `advanced-scraping-utils.ts`
- Update the `fetchBeatportData` function to use `scrapeBeatportTracks`

3. **Basic Puppeteer implementation:**

```typescript
import { scrapeBeatportTracks } from "./advanced-scraping-utils";

const beatportResults = await scrapeBeatportTracks(artist, title, {
  headless: true,
  timeout: 15000,
  delay: { min: 1000, max: 3000 },
});
```

### Option 2: Alternative APIs

#### Amazon Product Advertising API

- **Pros:** Official, reliable
- **Cons:** Requires approval, limited to affiliate partners
- **Setup:** Apply at https://webservices.amazon.com/paapi5/

#### Last.fm API (For metadata)

- **Pros:** Good for track discovery and metadata
- **Cons:** No purchase links or pricing
- **Setup:** Get API key at https://www.last.fm/api

#### MusicBrainz API (For metadata)

- **Pros:** Open source, comprehensive metadata
- **Cons:** No commercial information
- **Setup:** No API key needed

## Implementation Strategies

### 1. Gradual Rollout

```typescript
// Start with iTunes (working) and Bandcamp (basic)
// Add Beatport when you have Puppeteer setup
// Consider Amazon alternatives before implementing scraping
```

### 2. Caching Strategy

```typescript
// Implement caching to reduce API calls
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedResult {
  data: VendorDataResponse;
  timestamp: number;
}

const cache = new Map<string, CachedResult>();

function getCacheKey(vendorId: number, artist: string, title: string): string {
  return `${vendorId}-${artist}-${title}`.toLowerCase();
}
```

### 3. Error Handling & Retry Logic

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("All retries failed");
}
```

### 4. Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number,
  ) {}

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}
```

## Production Considerations

### Security & Legal

- **Rate Limiting:** Respect vendor rate limits to avoid IP blocks
- **User Agents:** Use realistic browser user agents
- **Terms of Service:** Review each vendor's ToS for scraping policies
- **GDPR/Privacy:** Handle user data appropriately

### Performance

- **Parallel Requests:** Fetch from multiple vendors simultaneously
- **Timeouts:** Set appropriate timeouts for each vendor
- **Circuit Breaker:** Stop making requests to failing services
- **Monitoring:** Track success rates and response times

### Data Quality

- **Fuzzy Matching:** Implement better string similarity algorithms
- **Duration Matching:** Use duration as a primary matching criterion
- **Manual Review:** Flag uncertain matches for manual review
- **Confidence Scores:** Return match confidence levels

## Troubleshooting

### Common Issues

#### Beatport Returns No Results

- **Cause:** JavaScript not executed, anti-bot detection
- **Solution:** Use Puppeteer with stealth plugin
- **Alternative:** Look for undocumented API endpoints

#### Amazon Blocks Requests

- **Cause:** Anti-bot measures, IP blocking
- **Solution:** Use residential proxies, session management
- **Alternative:** Amazon Product Advertising API

#### Bandcamp Inconsistent Results

- **Cause:** Variable HTML structure across different artists
- **Solution:** Improve CSS selectors, add fallbacks
- **Alternative:** Focus on high-profile releases

### Debug Mode

```typescript
const DEBUG_MODE = process.env.NODE_ENV === "development";

if (DEBUG_MODE) {
  console.log("Search query:", searchQuery);
  console.log("Response status:", response.status);
  console.log("Parsed results:", results.length);
}
```

## Next Steps

1. **Start Simple:** Get iTunes and Bandcamp working reliably
2. **Add Monitoring:** Track success rates and errors
3. **Implement Caching:** Reduce API load and improve performance
4. **Consider Alternatives:** Evaluate third-party aggregation services
5. **Scale Gradually:** Add Beatport with proper infrastructure
6. **Legal Review:** Ensure compliance with vendor terms of service

## Resources

- [iTunes Search API Documentation](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/)
- [Bandcamp Platform Guidelines](https://bandcamp.com/help/audio_basics)
- [Puppeteer Documentation](https://pptr.dev/)
- [Web Scraping Best Practices](https://blog.apify.com/web-scraping-best-practices/)
