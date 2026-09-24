import { toast } from "sonner";


export const validInputPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const ALLOWED_FILETYPES = ['image/png', 'image/webp', 'image/jpeg'];
    const files = e.target.files
    if (files) {
        if (files.length > 3) {
            toast.error('Please submit a max of 3 photos only.');
            e.target.value = '';
            return;
        }

        for (const file of files) {
            console.log(file)
            if (file.size > MAX_FILE_SIZE) {
                toast.error('File is too large. Maximum allowed size is 5MB.');
                e.target.value = '';
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file.');
                e.target.value = '';
                return;
            }

            if (!ALLOWED_FILETYPES.includes(file.type)) {
                toast.error("Invalid file type. Please upload a PNG, WebP, or JPEG.");
                e.target.value = '';
                return;
            }
        }
    }
    return files;
}

export const validDraggedPhotos = (e: React.DragEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const ALLOWED_FILETYPES = ['image/png', 'image/webp', 'image/jpeg'];
    const files = e.dataTransfer.files
    if (files) {
        if (files.length > 3) {
            toast.error('Please submit a max of 3 photos only.');
            return;
        }

        for (const file of files) {
            console.log(file)
            if (file.size > MAX_FILE_SIZE) {
                toast.error('File is too large. Maximum allowed size is 5MB.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file.');
                return;
            }

            if (!ALLOWED_FILETYPES.includes(file.type)) {
                toast.error("Invalid file type. Please upload a PNG, WebP, or JPEG.");
                return;
            }
        }
    }
    return files;
}
