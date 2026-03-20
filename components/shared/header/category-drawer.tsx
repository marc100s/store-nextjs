import { getAllCategories } from '@/lib/actions/product.actions';
import CategoryDrawerClient from './category-drawer-client';

const CategoryDrawer = async () => {
  const categories = await getAllCategories();

  return <CategoryDrawerClient categories={categories} />;
};

export default CategoryDrawer;