import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();
 // Transform the rating property to a number
 const transformedProducts = latestProducts.map(product => ({
  ...product,
  rating: Number(product.rating),
}));

return (
  <>
    <ProductList data={transformedProducts} title="Newest Arrivals" limit={4} />
  </>
);
};

export default HomePage;