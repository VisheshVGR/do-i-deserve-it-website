// Common page container styles that can be used across all pages
const pageContainerStyles = {
  p: 3, // 24px padding on all sides
  minHeight: 'calc(100vh - 64px)', // Full height minus AppBar
  position: 'relative',
  maxWidth: 1200, // Maximum content width
  mx: 'auto', // Center content horizontally
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 2, // 16px gap between elements
};

// Common section styles
const sectionStyles = {
  mb: 3, // 24px margin bottom between major sections
};

export { pageContainerStyles, sectionStyles };