// This should only contain links to the vpn.vu website
// No links to other websites should be added
export const urls = {
  purchase: 'https://vpn.vu/account/',
  faq: 'https://vpn.vu/help/',
  privacyGuide: 'https://vpn.vu/help/',
  download: 'https://vpn.vu/download/',
  removingOpenVpnBlog: 'https://vpn.vu/blog/',
} as const;

type BaseUrl = (typeof urls)[keyof typeof urls];
type ExtendedBaseUrl = `${BaseUrl}${string}`;
export type Url = BaseUrl | ExtendedBaseUrl;
