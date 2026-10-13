import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/pricing/success",
          "/pricing/cancel",
          "/Signup",
          "/Teams",
          "/ai-tools",
          "/engineering",
          "/learn",
          "/*?*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/pricing/success",
          "/pricing/cancel",
          "/Signup",
          "/Teams",
          "/*?*",
        ],
      },
    ],
    sitemap: "https://promptx.co.in/sitemap.xml",
  };
}
