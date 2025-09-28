import ProductList from '@/components/shared/product/product-list';
import {
  getLatestProducts,
  getFeaturedProducts,
} from '@/lib/actions/product.actions';
import ProductCarousel from '@/components/shared/product/product-carousel';
import ViewAllProductsButton from '@/components/view-all-products-button';
import IconBoxes from '@/components/icon-boxes';
import DealCountdown from '@/components/deal-countdown';

const Homepage = async () => {
  try {
    const latestProducts = await getLatestProducts();
    const featuredProducts = await getFeaturedProducts();

    return (
      <>
        {featuredProducts.length > 0 && (
          <ProductCarousel data={featuredProducts} />
        )}
        <ProductList data={latestProducts} title='Newest Arrivals' limit={4} />
        <ViewAllProductsButton />
        <DealCountdown />
        <IconBoxes /> 
      </>
    );
  } catch (error) {
    console.error('Homepage error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-600 mb-4">Unable to load the homepage. This might be a database connection issue.</p>
          <p className="text-sm text-gray-500">Check the server logs for more details.</p>
        </div>
      </div>
    );
  }
};

export default Homepage;