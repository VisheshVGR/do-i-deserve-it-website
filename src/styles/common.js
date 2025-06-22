// Common page container styles that can be used across all pages
const pageContainerStyles = {
  minHeight: 'calc(100vh - 64px)', // Full height minus AppBar
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: 2, // 16px gap between elements
};

// Common section styles
const sectionStyles = {
  mb: 3, // 24px margin bottom between major sections
};

export { pageContainerStyles, sectionStyles };