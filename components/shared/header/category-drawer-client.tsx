'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

type CategoryDrawerClientProps = {
  categories: Array<{
    category: string;
    count: number;
  }>;
};

const CategoryDrawerClient = ({
  categories,
}: CategoryDrawerClientProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer direction='left' open={open} onOpenChange={setOpen}>
      <Button
        variant='outline'
        type='button'
        onClick={() => setOpen(true)}
        aria-label='Open categories'
      >
        <MenuIcon />
      </Button>
      <DrawerContent className='h-full max-w-sm'>
        <DrawerHeader>
          <DrawerTitle>Select a category</DrawerTitle>
          <div className='mt-4 space-y-1'>
            {categories.map((category) => (
              <Button
                variant='ghost'
                className='w-full justify-start'
                key={category.category}
                asChild
              >
                <Link
                  href={`/search?category=${category.category}`}
                  onClick={() => setOpen(false)}
                >
                  {category.category} ({category.count})
                </Link>
              </Button>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default CategoryDrawerClient;
