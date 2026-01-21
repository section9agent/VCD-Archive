// Utility functions for VCD Archive

/**
 * Creates a URL for a page with optional query parameters
 * @param {string} page - The page name or path with optional query string
 * @returns {string} The formatted URL
 */
export function createPageUrl(page) {
  // Handle pages with query parameters
  if (page.includes('?')) {
    const [pageName, query] = page.split('?');
    return `/${pageName}?${query}`;
  }

  // Handle special cases
  if (page === 'Home') {
    return '/';
  }

  return `/${page}`;
}

/**
 * Utility function to merge class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
