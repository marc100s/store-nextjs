import {z} from "zod";
import { formatNumberWithDecimal } from "./utils";

const currency = z
.string()
.refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
   "Price must have exactly two decimal places"
);

//Schema for inserting products
export const insertProductSchema = z.object({
    
    name: z.string().min(3, "Name must be at least 3 characters long"),
    slug: z.string().min(3, "Slug must be at least 3 characters long"),
    category: z.string().min(3, "Category must be at least 3 characters long"),
    description: z.string().min(3, "Description must be at least 3 characters long"),
    images: z.array(z.string()).min(1, "At least one image is required"),
    brand: z.string().min(3, "Brand must be at least 3 characters long"),
    rating: z.number().min(1, "Rating must be at least 1"),
    numReviews: z.number().min(1, "Number of reviews must be at least 1"),
    stock: z.coerce.number().min(1, "Stock must be at least 1"),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency,
});