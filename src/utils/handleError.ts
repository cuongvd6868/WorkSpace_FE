export const handleError = (error: any): void => { 
    if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || `Lỗi máy chủ (HTTP ${status})`;
        
        console.error(`❌ API Error HTTP ${status}:`, message, error.response.data);
        
        throw error; 
    } else if (error.request) {
        console.error("❌ Network Error: No response received.", error);
        throw new Error("Lỗi kết nối mạng. Vui lòng kiểm tra internet.");
    } else if (error instanceof Error) {
        console.error("❌ Client Error:", error.message, error);
        throw error;
    } else {
        console.error("❌ Unknown error:", error);
        throw new Error("Đã xảy ra lỗi không xác định.");
    }
};

