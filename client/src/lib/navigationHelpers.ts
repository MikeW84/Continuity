/**
 * Navigation helper functions for handling "Add New Item" links
 */

/**
 * Navigate to a specific page and open the add dialog when the page loads
 * @param path The path to navigate to
 * @param itemType Optional item type for pages with multiple item types (e.g., 'values' page with 'value' or 'dream' types)
 */
export const navigateToAddItem = (path: string, itemType?: string) => {
  // Set sessionStorage flag to open dialog on the target page
  sessionStorage.setItem('openAddDialog', 'true');
  
  // If an item type is specified, set it in sessionStorage
  if (itemType) {
    sessionStorage.setItem('addItemType', itemType);
  }
  
  // Redirect to the page
  window.location.href = path;
};