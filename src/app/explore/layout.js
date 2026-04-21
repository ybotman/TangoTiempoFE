// TIEMPO-417: /explore is curated travel-worthy editorial data. We
// want real users to land here via direct links / in-app nav, but we
// don't want search engines indexing the curated list (passive leak
// vector for competitors scraping Google). robots.txt Disallow is
// the primary signal; this meta-level noindex is belt-and-suspenders
// for bots that ignore robots.txt but do honor meta directives.

export const metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ExploreLayout({ children }) {
  return children;
}
