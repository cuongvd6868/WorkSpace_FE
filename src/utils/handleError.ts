export const handleError = async (error: any) => {
    if (error.response) {
        // Lỗi từ axios hoặc fetch tự ném lỗi thủ công
        const status = error.response.status;
        const message = error.response.data?.message || "Lỗi máy chủ";

        console.error(`❌ HTTP ${status}:`, message);
        alert(`Lỗi (${status}): ${message}`);
    } else if (error instanceof Error) {
        // Lỗi thông thường
        console.error("❌ Error:", error.message);
        alert("Lỗi: " + error.message);
    } else {
        console.error("❌ Unknown error:", error);
        alert("Đã xảy ra lỗi không xác định.");
    }
};
