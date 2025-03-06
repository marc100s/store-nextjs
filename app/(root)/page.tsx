import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts, getFeaturedProducts } from "@/lib/actions/product.actions";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ViewAllProductsButton from "@/components/view-all-products-button";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
 // Transform the rating property to a number
 const transformedProducts = latestProducts.map(product => ({
  ...product,
  rating: Number(product.rating),
}));

return (
  <>
    {featuredProducts.length > 0 && (
      <ProductCarousel data={featuredProducts} />
    )}
    <ProductList data={transformedProducts} title="Newest Arrivals" limit={4} />
    <ViewAllProductsButton />
  </>
);
};

export default HomePage;