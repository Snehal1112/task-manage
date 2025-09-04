/**
 * Consistent icon sizing system for the Eisenhower Matrix app
 * This ensures all icons follow a standardized size hierarchy
 */

export const ICON_SIZES = {
  // Extra small icons - for buttons, inline elements
  xs: 'h-3 w-3',
  
  // Small icons - for input fields, action buttons, status indicators
  sm: 'h-4 w-4',
  
  // Medium icons - for card headers, main actions, navigation
  md: 'h-5 w-5',
  
  // Large icons - for section headers, important features
  lg: 'h-6 w-6',
  
  // Extra large icons - for main branding, hero elements
  xl: 'h-7 w-7',
  
  // Empty state icons - for placeholder illustrations
  empty: 'h-8 w-8',
  
  // Large empty state icons - for major empty states
  emptyLarge: 'h-10 w-10',
  
  // Huge empty state icons - for primary empty states
  emptyHuge: 'h-12 w-12'
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/**
 * Get the CSS classes for an icon size
 */
export const getIconSize = (size: IconSize): string => {
  return ICON_SIZES[size];
};

/**
 * Icon size mapping for different contexts
 */
export const CONTEXT_ICON_SIZES = {
  // Header and branding
  mainHeader: ICON_SIZES.xl,
  sectionHeader: ICON_SIZES.lg,
  
  // Navigation and actions
  navigationIcon: ICON_SIZES.md,
  primaryButton: ICON_SIZES.md,
  secondaryButton: ICON_SIZES.sm,
  
  // Task cards and content
  taskStatusIcon: ICON_SIZES.sm,
  taskActionIcon: ICON_SIZES.sm,
  cardHeaderIcon: ICON_SIZES.md,
  
  // Form elements
  inputIcon: ICON_SIZES.sm,
  formButton: ICON_SIZES.sm,
  
  // Search and filters
  searchIcon: ICON_SIZES.sm,
  filterIcon: ICON_SIZES.sm,
  clearIcon: ICON_SIZES.xs,
  
  // Empty states
  emptyStateSmall: ICON_SIZES.empty,
  emptyStateMedium: ICON_SIZES.emptyLarge,
  emptyStateLarge: ICON_SIZES.emptyHuge,
  
  // Quadrant specific
  quadrantBadgeIcon: ICON_SIZES.md,
  quadrantEmptyIcon: ICON_SIZES.emptyLarge,
  
  // Error and feedback
  errorIcon: ICON_SIZES.md,
  warningIcon: ICON_SIZES.sm,
  successIcon: ICON_SIZES.sm
} as const;
