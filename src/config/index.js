/**
 * Application configuration and mock user list.
 * In a real app these would come from environment variables and a database.
 */
export const JWT_SECRET = 'fekra_super_secret_key_2026';
export const JWT_EXPIRES_IN = '8h';
export const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Mock user store.
 * Roles: admin | brand | customer
 * Brand users carry a brandId that is used to simulate ownership:
 *   any productId that starts with brandId belongs to that brand.
 */
export const USERS = [
  {
    id: 'user_admin_001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    brandId: null,
  },
  {
    id: 'user_brand_001',
    username: 'brand_acme',
    password: 'brand123',
    role: 'brand',
    brandId: 'acme',
  },
  {
    id: 'user_customer_001',
    username: 'customer_john',
    password: 'customer123',
    role: 'customer',
    brandId: null,
  },
];
