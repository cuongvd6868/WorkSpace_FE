// Định nghĩa interface tối thiểu cần thiết cho WorkSpace trong danh sách yêu thích
// Đặt trong file ~/types/WorkSpaces.ts hoặc nơi bạn định nghĩa WorkSpaceSearch

interface WorkSpaceImageMinimal {
    imageUrl: string;
}

export interface WorkSpaceSearch {
    // 1. Dữ liệu cần thiết để hiển thị
    id: number; // Cần thiết để xóa (handleRemoveFavorite) và làm key trong list
    title: string;
    description: string;
    
    // 2. Trường ảnh cần thiết để hiển thị ảnh
    workSpaceImages: WorkSpaceImageMinimal[]; 

    // Các trường khác từ API (nhưng không cần dùng trong component này)
    hostId: number;
    addressId: number;
    // ... (Thêm các trường khác để tránh lỗi nếu API trả về chi tiết hơn)
    // Ví dụ:
    isActive: boolean;
    isVerified: boolean;
    createdUtc: string | null;
    // ...
}