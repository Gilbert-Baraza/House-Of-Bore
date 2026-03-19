export const siteContent = {
  brand: {
    name: "HOUSE OF BORE",
  },
  promoBar: {
    text: "Fresh picks are in. Shop House of bore and get standout style at everyday prices.",
    ctaLabel: "Shop now",
    ctaHref: "/shop",
  },
  navigation: {
    shopGroups: [
      {
        title: "Shoes",
        description: "Everyday pairs, standout sneakers, and dress-ready styles.",
      },
      {
        title: "Men",
        description: "Clean fits, elevated basics, and daily essentials.",
      },
      {
        title: "Women",
        description: "Bold staples, occasion looks, and wardrobe must-haves.",
      },
      {
        title: "Accessories",
        description: "Finishing touches that add shine to every outfit.",
      },
    ],
    links: ["Men", "Women", "Shoes", "Bags","Accessories"],
  },
  hero: {
    eyebrow: "Style for every day",
    title: "House of bore brings fashion, shoes, and Accessories together in one bold storefront.",
    description:
      "Discover quality picks across shoes, men's wear, women's wear, and Accessories with a shopping experience inspired by a bright marketplace feel and a cleaner premium finish.",
    ctaLabel: "Browse catalog",
    ctaHref: "/shop",
    stats: [
      { value: "4", label: "Core categories" },
      { value: "Fast", label: "Order processing" },
      { value: "New", label: "Weekly arrivals" },
    ],
    featuredBrands: ["Men", "Women", "Shoes", "Bags", "Accessories", "New Arrivals"],
  },
  newsletter: {
    title: "Get fresh arrivals, price drops, and exclusive House of bore offers first.",
    placeholder: "Enter your email address",
    buttonLabel: "Subscribe",
  },
  footer: {
    description:
      "House of bore is your destination for shoes, men's fashion, women's fashion, and jeweleries with a bright, modern shopping experience.",
    columns: [
      {
        title: "Shop",
        links: ["Men", "Women", "Shoes", "Bags", "Accessories",],
      },
      {
        title: "About",
        links: [
          { label: "Our story", href: "/" },
          { label: "Contact", href: "/track-order" },
          { label: "Terms", href: "/terms" },
          { label: "Privacy policy", href: "/privacy-policy" }
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Shipping policy", href: "/shipping-policy" },
          { label: "Return policy", href: "/return-refund-policy" },
          { label: "Track order", href: "/track-order" }
        ],
      },
    ],
    copyright: `House of bore (c) ${new Date().getFullYear()} All rights reserved`,
  },
};
