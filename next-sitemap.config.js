/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: "https://tunehunter.app",
  generateRobotsTxt: false, // we manage robots.txt manually
  exclude: ["/dashboard", "/insights", "/api/*", "/auth_callback/*"],
};
