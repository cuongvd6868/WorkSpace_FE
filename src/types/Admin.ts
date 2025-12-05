export interface RevenueChartItem {
    month: number;
    year: number;
    label: string;
    revenue: number;
}

export interface AdminStats {
    totalRevenue: number;
    newBookingsThisMonth: number;
    newUsersThisMonth: number;
    totalUsers: number;
    revenueChart: RevenueChartItem[];
}

export interface UserAdminView {
    id: number;
    userName: string;
    email: string;
    fullName: string;
    isActive: boolean;
}

export interface OwnerRegistrationsView {
    id: number;
    companyName: string;
    description: string;
    contactPhone: string;
    userEmail: string;
    avatar: string;
}
