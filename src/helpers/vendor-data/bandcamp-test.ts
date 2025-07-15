/**
 * Test utilities for Bandcamp data fetching
 *
 * Use these functions to test the enhanced Bandcamp implementation
 * that visits individual track pages for duration matching.
 */

import { fetchVendorData } from "./fetch-vendor-data";

// Example test cases for Bandcamp
export const bandcampTestCases = [
  {
    name: "Popular Electronic Track",
    songData: {
      songId: "test-1",
      title: "Strobe",
      artist: "deadmau5",
      duration: 636000, // 10:36 in milliseconds
    },
    vendorData: {
      vendorId: 2,
      store: "bandcamp" as const,
    },
    region: "US",
  },
  {
    name: "Indie Rock Track",
    songData: {
      songId: "test-2",
      title: "Mr. Brightside",
      artist: "The Killers",
      duration: 222000, // 3:42 in milliseconds
    },
    vendorData: {
      vendorId: 2,
      store: "bandcamp" as const,
    },
    region: "US",
  },
  {
    name: "Ambient Track",
    songData: {
      songId: "test-3",
      title: "An Ending (Ascent)",
      artist: "Brian Eno",
      duration: 264000, // 4:24 in milliseconds
    },
    vendorData: {
      vendorId: 2,
      store: "bandcamp" as const,
    },
    region: "US",
  },
];

/**
 * Test the Bandcamp implementation with a single track
 */
export async function testBandcampTrack(testCase: (typeof bandcampTestCases)[0]) {
  console.log(`\n🎵 Testing: ${testCase.name}`);
  console.log(`   Track: "${testCase.songData.title}" by ${testCase.songData.artist}`);
  console.log(`   Target duration: ${Math.round(testCase.songData.duration / 1000)}s`);

  try {
    const startTime = Date.now();
    const result = await fetchVendorData(testCase);
    const endTime = Date.now();

    console.log(`   ⏱️  Search completed in ${endTime - startTime}ms`);

    if (result.error) {
      console.log(`   ❌ No match found: ${result.error}`);
    } else {
      console.log(`   ✅ Match found!`);
      console.log(`      URL: ${result.data.url}`);
      console.log(`      Duration: ${Math.round(result.data.duration / 1000)}s`);
      console.log(`      Price: ${result.data.price} ${result.data.currency}`);
      console.log(`      Format: ${result.data.format}`);

      const durationDiff = Math.abs(result.data.duration - testCase.songData.duration);
      console.log(`      Duration difference: ${Math.round(durationDiff / 1000)}s`);
    }
  } catch (error) {
    console.log(`   💥 Error occurred:`, error);
  }
}

/**
 * Test all Bandcamp test cases
 */
export async function testAllBandcampCases() {
  console.log("🚀 Starting Bandcamp implementation tests...\n");

  for (const testCase of bandcampTestCases) {
    await testBandcampTrack(testCase);

    // Add delay between tests to be respectful to Bandcamp
    console.log("   ⏳ Waiting 2 seconds before next test...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n✨ All tests completed!");
}

/**
 * Test with custom track data
 */
export async function testCustomBandcampTrack(
  title: string,
  artist: string,
  durationSeconds: number,
) {
  const testCase = {
    name: "Custom Track",
    songData: {
      songId: "custom-test",
      title,
      artist,
      duration: durationSeconds * 1000,
    },
    vendorData: {
      vendorId: 2,
      store: "bandcamp" as const,
    },
    region: "US",
  };

  await testBandcampTrack(testCase);
}

/**
 * Example usage:
 *
 * // Test a single case
 * await testBandcampTrack(bandcampTestCases[0]);
 *
 * // Test all cases
 * await testAllBandcampCases();
 *
 * // Test custom track
 * await testCustomBandcampTrack("Your Song Title", "Artist Name", 180);
 */

// Performance monitoring utilities
export class BandcampTestMetrics {
  private results: Array<{
    testName: string;
    duration: number;
    success: boolean;
    error?: string;
  }> = [];

  async runTest(testCase: (typeof bandcampTestCases)[0]): Promise<void> {
    const startTime = Date.now();

    try {
      const result = await fetchVendorData(testCase);
      const endTime = Date.now();

      this.results.push({
        testName: testCase.name,
        duration: endTime - startTime,
        success: !result.error,
        error: result.error,
      });
    } catch (error) {
      const endTime = Date.now();

      this.results.push({
        testName: testCase.name,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  getMetrics() {
    const totalTests = this.results.length;
    const successful = this.results.filter((r) => r.success).length;
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;

    return {
      totalTests,
      successful,
      successRate: (successful / totalTests) * 100,
      avgDuration,
      results: this.results,
    };
  }

  printReport() {
    const metrics = this.getMetrics();

    console.log("\n📊 Bandcamp Test Report");
    console.log("========================");
    console.log(`Total Tests: ${metrics.totalTests}`);
    console.log(`Successful: ${metrics.successful}`);
    console.log(`Success Rate: ${metrics.successRate.toFixed(1)}%`);
    console.log(`Average Duration: ${Math.round(metrics.avgDuration)}ms`);
    console.log("\nDetailed Results:");

    metrics.results.forEach((result) => {
      const status = result.success ? "✅" : "❌";
      console.log(
        `  ${status} ${result.testName}: ${result.duration}ms ${result.error ? `(${result.error})` : ""}`,
      );
    });
  }
}
