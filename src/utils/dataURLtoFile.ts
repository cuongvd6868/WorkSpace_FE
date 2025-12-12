
export const dataURLtoFile = (dataurl: string, filename: string): File => {
    // 1. Tách phần Base64 và Mime Type (vd: image/png)
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error("Data URL không hợp lệ hoặc thiếu MIME type.");
    }
    const mime = mimeMatch[1];
    
    // 2. Giải mã chuỗi Base64 thành chuỗi nhị phân (Binary String)
    const bstr = atob(arr[1]);
    let n = bstr.length;
    
    // 3. Tạo một mảng 8-bit không dấu (Uint8Array) từ chuỗi nhị phân
    const u8arr = new Uint8Array(n);
    
    // 4. Sao chép dữ liệu byte từ chuỗi nhị phân vào Uint8Array
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    // 5. Tạo đối tượng File (hoặc Blob) từ Uint8Array
    // Tham số: [data], filename, { type: mime }
    return new File([u8arr], filename, { type: mime });
};