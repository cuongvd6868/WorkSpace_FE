export type Promotions = {
    id: number,
    code: string,
    description: string,
    discountValue: number,
    discountType: string,
    startDate: string,
    endDate: string,
    usageLimit: number,
    remainingUsage: number
}