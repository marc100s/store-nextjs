import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ProductCardSkeleton = () => {
  return (
    <Card className='w-full max-w-sm'>
      <CardHeader className='p-0 items-center'>
        <Skeleton className='w-full aspect-square' />
      </CardHeader>
      <CardContent className='p-4 grid gap-4'>
        <Skeleton className='h-4 w-16' />
        <Skeleton className='h-5 w-full' />
        <div className='flex-between gap-4'>
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-6 w-16' />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCardSkeleton;
