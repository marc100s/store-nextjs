import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

// Allowed image MIME types for security
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

// Maximum file size (4MB)
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export const ourFileRouter = {
    imageUploader: f({
      image: {
        maxFileSize: "4MB",
        maxFileCount: 5, // Limit number of files
      },
    })
    .middleware(async ({ files }) => {
        const session = await auth();
        if (!session) throw new UploadThingError("Unauthorized");
        
        // Validate each file
        for (const file of files) {
          // Check file size
          if (file.size > MAX_FILE_SIZE) {
            throw new UploadThingError(`File ${file.name} is too large. Maximum size is 4MB.`);
          }
          
          // Check file type
          if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            throw new UploadThingError(`File ${file.name} has invalid type. Only JPEG, PNG, WebP and GIF are allowed.`);
          }
          
          // Check file name for security (prevent path traversal)
          const fileName = file.name;
          if (fileName.includes('../') || fileName.includes('..\\') || fileName.includes('/') || fileName.includes('\\')) {
            throw new UploadThingError(`File name contains invalid characters: ${fileName}`);
          }
          
          // Check for suspicious extensions
          const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.asp', '.jsp', '.js', '.html', '.htm'];
          const lowercaseName = fileName.toLowerCase();
          if (suspiciousExtensions.some(ext => lowercaseName.endsWith(ext))) {
            throw new UploadThingError(`File extension not allowed: ${fileName}`);
          }
        }
        
        return { userId: session?.user?.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
        // Log successful upload for security monitoring
        console.log('File uploaded successfully:', {
          userId: metadata.userId,
          fileName: file.name,
          fileSize: file.size,
          fileUrl: file.url,
          uploadedAt: new Date().toISOString()
        });
        
        return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;
export type OurFileRouter = typeof ourFileRouter;