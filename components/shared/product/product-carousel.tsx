'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Product } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";

const ProductCarousel = ({ data } : { data: Product[]}) => {
    // Filter out products without banners
    const productsWithBanners = data.filter(product => product.banner);
    
    // Don't render carousel if no products have banners
    if (productsWithBanners.length === 0) {
        return null;
    }
    
    return <Carousel className="w-full mb-12" opts={{
        loop: true
    }}
    plugins={[
        Autoplay({
            delay:10000,
            stopOnInteraction: true,
            stopOnMouseEnter: true
        })
    ]}>
        <CarouselContent>
            { productsWithBanners.map((product: Product) => (
                <CarouselItem key={product.id}>
                    <Link href={`/product/${product.slug}`} className="relative block w-full aspect-[21/9]">
                        <Image 
                            src={product.banner}
                            alt={product.name}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 flex items-end justify-center">
                            <h2 className="bg-gray-900 bg-opacity-50 text-2xl font-bold px-2 text-white">
                                {product.name}
                            </h2>
                        </div>
                    </Link>
                </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />

       
    </Carousel>;
}
 
export default ProductCarousel;