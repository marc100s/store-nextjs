export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Prostore';
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  'A modern store built with Next.js';
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

  export const signInDefaultValues = {
    email: 'john@example.com',
    password: '12345678',
  };

  // Development test accounts (matches sample-data.ts)
  export const TEST_ACCOUNTS = {
    admin: {
      email: 'john@example.com',
      password: '12345678',
      role: 'admin'
    },
    user: {
      email: 'jane@example.com', 
      password: '12345678',
      role: 'user'
    }
  };

  export const signUpDefaultValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  export const shippingAddressDefaultValues = {
    fullName: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: '',
  };

  export const PAYMENT_METHODS = process.env.PAYMENT_METHODS ? process.env.PAYMENT_METHODS.split(', ') : ['PayPal', 'Stripe', 'CashOnDelivery'];
  export const DEFAULT_PAYMENT_METHOD = process.env.DEFAULT_PAYMENT_METHOD || 'PayPal';

  export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;
  
  interface ProductDefaultValues {
    name: string;
    slug: string;
    category: string;
    images: string[];
    brand: string;
    description: string;
    price: string;
    stock: number;
    rating: string;
    numReviews: string;
    isFeatured: boolean;
    banner: string | null;
  }
  
  export const productDefaultValues: ProductDefaultValues = {
    name: "",
    slug: "",
    category: "",
    images: [],
    brand: "",
    description: "",
    price: "0",
    stock: 0,
    rating: "0",
    numReviews: "0",
    isFeatured: false,
    banner: null,
  };

  export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(', ')
  : ['admin', 'user'];

  export const reviewFromDefaultValues = {
    title: '',
    comment: '',
    rating: 0
  };

  export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
  