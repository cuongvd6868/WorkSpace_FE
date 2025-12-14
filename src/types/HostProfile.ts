// Trong ~/types/HostProfile.ts
export interface HostProfileData {
    companyName: string;
    description: string;
    contactPhone: string;
    logoUrl: string; 
    websiteUrl: string;
    avatar: string;
    coverPhoto: string;
    documentUrls: string[]; // <-- Đảm bảo đây là string[] để lưu Data URL
}
// Giữ nguyên ExtendedHostProfileData nếu cần dùng signatureDataUrl
interface ExtendedHostProfileData extends HostProfileData {
    signatureDataUrl?: string;
}