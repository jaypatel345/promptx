/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://promptx.co.in',
  generateRobotsTxt: true,
  sitemapSize: 7000,

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