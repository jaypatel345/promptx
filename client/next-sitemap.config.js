/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://promptx.co.in',
  generateRobotsTxt: true,
  sitemapSize: 7000,

  // Private, checkout callback, and unreleased placeholder pages excluded
  exclude: [
    '/api/*',
    '/pricing/success',
    '/pricing/cancel',
    '/Signup',
    '/Teams',
    '/ai-tools',
    '/engineering',
    '/learn',
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/pricing/success',
          '/pricing/cancel',
          '/Signup',
          '/Teams',
          '/ai-tools',
          '/engineering',
          '/learn',
          '/*?*',
        ],
      },
    ],

    sitemap: 'https://promptx.co.in/sitemap.xml',

    // Disable host line to comply with modern search engine standards
    host: null,
  },
};