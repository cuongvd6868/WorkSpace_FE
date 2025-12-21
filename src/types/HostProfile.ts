export interface HostProfileData {
    companyName: string;
    description: string;
    contactPhone: string;
    logoUrl: string; 
    websiteUrl: string;
    avatar: string;
    coverPhoto: string;
    documentUrls: string[]; 
}
interface ExtendedHostProfileData extends HostProfileData {
    signatureDataUrl?: string;
}

export interface HostProfileUpdateRequest {
    id: number;
    companyName: string;
    description: string;
    contactPhone: string;
    logoUrl: string; 
    websiteUrl: string;
    avatar: string;
    coverPhoto: string;
}

export interface HostProfileView {
    id: number;
    companyName: string;
    description: string;
    contactPhone: string;
    logoUrl: string; 
    websiteUrl: string;
    avatar: string;
    coverPhoto: string;
}