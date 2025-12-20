export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Định nghĩa kiểu dữ liệu trả về nếu cần dùng cho các hàm khác
export interface ChangePasswordResponse {
    message: string;
    // Thêm các field khác tùy theo thực tế API trả về
}

export interface ForgotPasswordRequest {
    email: string;
}