'use client';
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ProductImages = ({ images }: { images: string[] }) => {
    const [current, setCurrent] = useState(0);

    return (
        <div className="space-y-4">
            <div className="relative w-full aspect-square">
                <Image
                    src={images[current]}
                    alt="Product image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                    className="object-cover object-center"
                    priority
                />
            </div>
            <div className="flex gap-2">
                {images.map((image, index) => (
                    <div 
                        key={image} 
                        onClick={() => setCurrent(index)} 
                        className={cn(
                            "relative border cursor-pointer hover:border-orange-500 aspect-square w-24", 
                            current === index && "border-orange-500"
                        )}
                    >
                        <Image
                            src={image}
                            alt={`Product thumbnail ${index + 1}`}
                            fill
                            sizes="96px"
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductImages;
