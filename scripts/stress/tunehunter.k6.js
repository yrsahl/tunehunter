// @ts-nocheck
import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const PROFILE = __ENV.STRESS_PROFILE || "baseline";
const INCLUDE_PREVIEW = __ENV.INCLUDE_PREVIEW === "1";
const VENDOR_REGION = (__ENV.VENDOR_REGION || "US").toUpperCase();
const VALID_VENDORS = ["itunes", "bandcamp", "beatport", "amazon"];
const configuredVendors = (__ENV.VENDOR_LIST || "itunes,bandcamp,beatport,amazon")
  .split(",")
  .map((v) => v.trim().toLowerCase())
  .filter((v) => VALID_VENDORS.includes(v));
const VENDOR_LIST = configuredVendors.length > 0 ? configuredVendors : VALID_VENDORS;

const searchErrors = new Counter("search_errors");
const homepageErrors = new Counter("homepage_errors");
const previewErrors = new Counter("preview_errors");
const vendorProbeErrors = new Counter("vendor_probe_errors");
const vendorProbeStoreUnreachable = new Counter("vendor_probe_store_unreachable");
const vendorProbeRateLimited = new Counter("vendor_probe_rate_limited");
const vendorProbeNoData = new Counter("vendor_probe_no_data");
const vendorProbeSuccess = new Counter("vendor_probe_success");

const SEARCH_TERMS = [
  "daft punk",
  "fred again",
  "charli xcx",
  "aphex twin",
  "billie jean",
  "rue du soleil",
  "chemical brothers",
  "sasha xpander",
  "Disclosure Latch",
  "Moby Porcelain",
];

const PREVIEW_QUERIES = [
  { title: "One More Time", artist: "Daft Punk" },
  { title: "Latch", artist: "Disclosure" },
  { title: "Genesis", artist: "Justice" },
];

const VENDOR_PROBE_TRACKS = [
  { title: "One More Time", artist: "Daft Punk", duration: 320_000, album: "Discovery" },
  { title: "Latch", artist: "Disclosure", duration: 250_000, album: "Settle" },
  { title: "Titanium", artist: "David Guetta", duration: 245_000, album: "Nothing but the Beat" },
  { title: "Genesis", artist: "Justice", duration: 233_000, album: "Cross" },
  { title: "Porcelain", artist: "Moby", duration: 240_000, album: "Play" },
  { title: "Midnight City", artist: "M83", duration: 244_000, album: "Hurry Up, We'Re Dreaming" },
];

const PROFILE_OPTIONS = {
  baseline: {
    scenarios: {
      homepage_browse: {
        executor: "constant-arrival-rate",
        rate: 1,
        timeUnit: "1s",
        duration: "10m",
        preAllocatedVUs: 5,
        maxVUs: 20,
        exec: "homepageScenario",
      },
      search_api: {
        executor: "constant-arrival-rate",
        rate: 3,
        timeUnit: "1s",
        duration: "10m",
        preAllocatedVUs: 15,
        maxVUs: 60,
        exec: "searchScenario",
      },
    },
  },
  spike: {
    scenarios: {
      homepage_browse: {
        executor: "constant-arrival-rate",
        rate: 1,
        timeUnit: "1s",
        duration: "20m",
        preAllocatedVUs: 5,
        maxVUs: 20,
        exec: "homepageScenario",
      },
      search_api_spike: {
        executor: "ramping-arrival-rate",
        startRate: 3,
        timeUnit: "1s",
        stages: [
          { target: 3, duration: "3m" },
          { target: 30, duration: "4m" },
          { target: 40, duration: "6m" },
          { target: 3, duration: "2m" },
        ],
        preAllocatedVUs: 25,
        maxVUs: 200,
        exec: "searchScenario",
      },
    },
  },
  soak: {
    scenarios: {
      homepage_browse: {
        executor: "constant-arrival-rate",
        rate: 1,
        timeUnit: "2s",
        duration: "6h",
        preAllocatedVUs: 5,
        maxVUs: 20,
        exec: "homepageScenario",
      },
      search_api: {
        executor: "constant-arrival-rate",
        rate: 2,
        timeUnit: "1s",
        duration: "6h",
        preAllocatedVUs: 20,
        maxVUs: 80,
        exec: "searchScenario",
      },
      preview_api: {
        executor: "constant-arrival-rate",
        rate: 1,
        timeUnit: "5s",
        duration: "6h",
        preAllocatedVUs: 3,
        maxVUs: 10,
        exec: "previewScenario",
      },
    },
  },
  vendor_probe: {
    scenarios: {
      vendor_probe: {
        executor: "constant-arrival-rate",
        rate: 1,
        timeUnit: "1s",
        duration: "15m",
        preAllocatedVUs: 10,
        maxVUs: 50,
        exec: "vendorProbeScenario",
      },
    },
  },
};

const selected = PROFILE_OPTIONS[PROFILE] || PROFILE_OPTIONS.baseline;

export const options = {
  ...selected,
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
    checks: ["rate>0.98"],
    search_errors: ["count<10"],
    homepage_errors: ["count<5"],
    preview_errors: ["count<10"],
    vendor_probe_errors: ["count<50"],
    vendor_probe_store_unreachable: ["count<25"],
  },
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function setup() {
  console.log(`Starting TuneHunter stress test profile="${PROFILE}" baseUrl="${BASE_URL}"`);
  console.log(`Preview endpoint enabled: ${INCLUDE_PREVIEW ? "yes" : "no"}`);
  if (PROFILE === "vendor_probe") {
    console.log(`Vendor probe region: ${VENDOR_REGION}`);
    console.log(`Vendor probe list: ${VENDOR_LIST.join(", ")}`);
  }
}

export function homepageScenario() {
  const res = http.get(`${BASE_URL}/`, { tags: { endpoint: "homepage" } });
  const ok = check(res, {
    "homepage status is 2xx/3xx": (r) => r.status >= 200 && r.status < 400,
  });
  if (!ok) homepageErrors.add(1);
  sleep(Math.random() * 0.6 + 0.2);
}

export function searchScenario() {
  const q = encodeURIComponent(randomItem(SEARCH_TERMS));
  const res = http.get(`${BASE_URL}/api/songs/search?q=${q}`, {
    tags: { endpoint: "songs.search" },
    timeout: "30s",
  });

  const ok = check(res, {
    "search status is 200": (r) => r.status === 200,
    "search body has tracks": (r) => {
      try {
        const body = r.json();
        return Boolean(body && body.tracks && Array.isArray(body.tracks.items));
      } catch (_err) {
        return false;
      }
    },
  });

  if (!ok) searchErrors.add(1);
  sleep(Math.random() * 0.7 + 0.1);
}

export function previewScenario() {
  if (!INCLUDE_PREVIEW) {
    sleep(1);
    return;
  }

  const query = randomItem(PREVIEW_QUERIES);
  const title = encodeURIComponent(query.title);
  const artist = encodeURIComponent(query.artist);
  const res = http.get(`${BASE_URL}/api/spotify/preview?title=${title}&artist=${artist}`, {
    tags: { endpoint: "spotify.preview" },
    timeout: "30s",
  });

  const ok = check(res, {
    "preview status is 200": (r) => r.status === 200,
  });
  if (!ok) previewErrors.add(1);
  sleep(Math.random() * 1.2 + 0.2);
}

function parseTrpcJson(res) {
  try {
    const payload = JSON.parse(res.body);
    const first = Array.isArray(payload) ? payload[0] : payload?.[0] ?? payload;
    if (!first) return null;
    if (first.error?.json?.data?.code) {
      return { trpcErrorCode: first.error.json.data.code };
    }
    return first.result?.data?.json ?? null;
  } catch (_err) {
    return null;
  }
}

export function vendorProbeScenario() {
  const vendor = randomItem(VENDOR_LIST);
  const track = randomItem(VENDOR_PROBE_TRACKS);
  const syntheticSongId = `k6_vendor_probe_${vendor}_${__VU}_${__ITER}_${Date.now()}`;

  const trpcInput = {
    vendor,
    region: VENDOR_REGION,
    songId: syntheticSongId,
    artist: track.artist,
    title: track.title,
    duration: track.duration,
    album: track.album,
  };

  const res = http.post(
    `${BASE_URL}/api/trpc/songListings.getSongListing?batch=1`,
    JSON.stringify({ 0: { json: trpcInput } }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "songListings.getSongListing", vendor },
      timeout: "35s",
    },
  );

  const statusOk = check(res, {
    "vendor probe status is 200": (r) => r.status === 200,
  });
  if (!statusOk) {
    vendorProbeErrors.add(1);
    sleep(Math.random() * 0.8 + 0.2);
    return;
  }

  const parsed = parseTrpcJson(res);
  if (parsed?.trpcErrorCode === "TOO_MANY_REQUESTS") {
    vendorProbeRateLimited.add(1);
    sleep(Math.random() * 0.8 + 0.2);
    return;
  }

  if (!parsed) {
    vendorProbeErrors.add(1);
    sleep(Math.random() * 0.8 + 0.2);
    return;
  }

  if (parsed.error === "STORE_UNREACHABLE") {
    vendorProbeStoreUnreachable.add(1);
    vendorProbeErrors.add(1);
  } else if (parsed.error === "RATE_LIMITED") {
    vendorProbeRateLimited.add(1);
  } else if (parsed.error === "NO_DATA_FOUND") {
    vendorProbeNoData.add(1);
  } else if (parsed.data) {
    vendorProbeSuccess.add(1);
  } else {
    vendorProbeErrors.add(1);
  }

  sleep(Math.random() * 0.8 + 0.2);
}
