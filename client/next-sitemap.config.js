/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://promptx.co.in',
  generateRobotsTxt: true,
  sitemapSize: 7000,

  // These pages are still under construction and carry a noindex meta tag —
  // keep them out of the sitemap too so Google isn't pointed at pages it's
  // been told not to index.
  exclude: ['/ai-tools', '/engineering', '/learn'],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],

    sitemap: 'https://promptx.co.in/sitemap.xml',

    // IMPORTANT: disable Host line
    host: null,
  },
};