import { getAllCategories } from '@/lib/actions/product.actions';
import CategoryDrawerClient from './category-drawer-client';

const CategoryDrawer = async () => {
  const categories = (await getAllCategories()).map((category) => ({
    category: category.category,
    count:
      typeof category._count === 'number'
        ? category._count
        : category._count.category,
  }));

  return <CategoryDrawerClient categories={categories} />;
};

export default CategoryDrawer;
