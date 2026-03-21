const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:148.0) Gecko/20100101 Firefox/148.0";

export default {
  // @ts-ignore
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const url = new URL(request.url);
    const itunesUrl = new URL("https://itunes.apple.com/search");
    url.searchParams.forEach((value, key) => itunesUrl.searchParams.set(key, value));

    const response = await fetch(itunesUrl.toString(), {
      headers: {
        "User-Agent": DESKTOP_UA,
        Accept: "*/*",
      },
    });

    const body = response.ok ? await response.text() : null;

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "max-age=86400",
      },
    });
  },
};
