export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const PLATFORM = {
  NAME: 'Villex Marketplace',
  SUPPORT_EMAIL: 'support@villex.com',
  DEFAULT_CURRENCY: 'PKR',
  SUPPORTED_CURRENCIES: ['PKR', 'USD', 'AED'],
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
