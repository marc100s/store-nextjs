/**
 * Jest Setup Configuration
 * Configures test environment and global test utilities
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mock-database-url';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
    forward: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock Prisma client
jest.mock('@/db/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

// Global test utilities
global.testUtils = {
  // Create mock user
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),
  
  // Create mock product
  createMockProduct: (overrides = {}) => ({
    id: 'test-product-id',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    price: '99.99',
    stock: 10,
    category: 'Electronics',
    brand: 'TestBrand',
    images: ['/test-image.jpg'],
    rating: '4.5',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),
  
  // Create mock order
  createMockOrder: (overrides = {}) => ({
    id: 'test-order-id',
    userId: 'test-user-id',
    totalPrice: '99.99',
    status: 'PENDING',
    paymentMethod: 'PayPal',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Suppress console errors in tests (optional)
if (process.env.SUPPRESS_TEST_LOGS === 'true') {
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
  };
}