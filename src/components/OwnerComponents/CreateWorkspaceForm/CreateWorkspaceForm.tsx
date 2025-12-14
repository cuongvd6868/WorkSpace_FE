import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import { RawWorkspaceData, RawRoomData, handleCreateWorkspace } from '~/services/OwnerService'; 

import styles from './CreateWorkspaceForm.module.scss'; 

const cx = classNames.bind(styles);

// **********************************
// 1. ĐỊNH NGHĨA AMENITIES
// **********************************
interface Amenity {
    id: number;
    name: string;
    description: string;
}

// Danh sách Amenity được trích xuất từ hình ảnh
const AMENITIES_LIST: Amenity[] = [
    { id: 1, name: "Wi-Fi tốc độ cao", description: "Kết nối internet ổn định và nhanh" },
    { id: 2, name: "Điều hòa không khí", description: "Hệ thống làm mát/ấm đảm bảo nhiệt độ dễ chịu" },
    { id: 3, name: "Máy in & máy scan", description: "Tiện lợi cho việc in tài liệu, hợp đồng" },
    { id: 4, name: "Phòng họp riêng", description: "Không gian riêng biệt cho các cuộc họp" },
    { id: 5, name: "Coffee & Tea miễn phí", description: "Thưởng thức cà phê hoặc trà miễn phí" },
    { id: 6, name: "Ghế công thái học", description: "Thiết kế giúp ngồi lâu mà vẫn thoải mái" },
    { id: 7, name: "Khu vực nghỉ ngơi", description: "Nơi thư giãn ngắn ngủi sau giờ làm việc" },
    { id: 8, name: "Tủ locker cá nhân", description: "Giữ đồ dùng cá nhân an toàn, riêng tư" },
    { id: 9, name: "Chỗ đỗ xe", description: "Bãi đỗ xe thuận tiện cho nhân viên và khách hàng" },
    { id: 10, name: "Hỗ trợ kỹ thuật", description: "Nhân viên kỹ thuật luôn sẵn sàng hỗ trợ" },
    { id: 11, name: "Máy chiếu & màn hình", description: "Hỗ trợ trình chiếu và thuyết trình hiệu quả" },
    { id: 12, name: "Bảng trắng", description: "Tiện lợi cho việc brainstorm hoặc ghi chú" },
    { id: 13, name: "Khu pantry", description: "Có tủ lạnh, lò vi sóng và khu vực ăn uống" },
    { id: 14, name: "Dịch vụ lễ tân", description: "Hỗ trợ đón tiếp khách hàng, nhận thư/bưu phẩm" },
    { id: 15, name: "Bảo vệ 24/7", description: "An ninh tòa nhà và khu làm việc 24/7" },
    { id: 16, name: "Thang máy", description: "Tiện lợi cho việc di chuyển giữa các tầng" },
    { id: 17, name: "Không gian xanh", description: "Mang lại cảm giác thoải mái và thư giãn" },
    { id: 18, name: "Hệ thống camera an ninh", description: "Giám sát toàn bộ khu vực để đảm bảo an toàn" },
    { id: 19, name: "Ổ cắm & sạc điện thoại", description: "Tích hợp nhiều ổ cắm và cổng sạc tiện lợi" },
    { id: 20, name: "Không gian yên tĩnh", description: "Dành cho những ai cần tập trung cao độ" },
];

// Dữ liệu ban đầu cho một phòng (RawRoomData)
const initialRoomData: RawRoomData = {
    title: '',
    description: '',
    workSpaceRoomTypeId: 1, 
    pricePerHour: 0,
    pricePerDay: 1,
    pricePerMonth: 1,
    capacity: 1,
    area: 0,
    imageFiles: [],
    // Khởi tạo amenityIds là một mảng rỗng
    amenityIds: [], 
};

type FormState = Omit<RawWorkspaceData, 'imageFiles' | 'rooms'>;

interface CreateWorkspaceFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const initialFormData: FormState = {
    title: '',
    description: '',
    ward: '',
    street: '',
    state: '',
    postalCode: '',
    latitude: 0,
    longitude: 0,
    workSpaceTypeId: 1,
};

// --- SVG Components Thay Thế (Giữ nguyên) ---
const LocationIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.414L12 22l-5.657-5.586a5 5 0 117.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.865-1.534A2 2 0 0110.125 3h3.75a2 2 0 011.664.89l.865 1.534A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

// --- Component Chính ---
export function CreateWorkspaceForm({ onSuccess, onCancel }: CreateWorkspaceFormProps) {
    const [formData, setFormData] = useState<FormState>(initialFormData);
    const [workspaceImageFiles, setWorkspaceImageFiles] = useState<File[]>([]);
    const [roomsData, setRoomsData] = useState<RawRoomData[]>([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token: string | null = localStorage.getItem('token');
    
    // **********************************
    // 2. KHAI BÁO STATE CHO AMENITIES
    // **********************************
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [isAmenitiesLoading, setIsAmenitiesLoading] = useState(true);

    // **********************************
    // 3. EFFECT LOAD AMENITIES
    // **********************************
    useEffect(() => {
        // Giả lập việc fetch data (Thay thế bằng API call thực tế)
        setIsAmenitiesLoading(true);
        setTimeout(() => {
            setAmenities(AMENITIES_LIST);
            setIsAmenitiesLoading(false);
        }, 500);
    }, []);

    // --- Xử lý Workspace Chính (Giữ nguyên) ---

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: (type === 'number' || name === 'workSpaceTypeId' || name === 'latitude' || name === 'longitude' || ['pricePerHour', 'pricePerDay', 'pricePerMonth', 'capacity', 'area'].includes(name)) 
                         ? parseFloat(value) || 0 
                         : value,
        }));
    };

    const handleWorkspaceFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 5) {
                setError("Chỉ có thể tải lên tối đa 5 ảnh cho Workspace chính.");
                return;
            }
            setWorkspaceImageFiles(files);
            setError(null);
        }
    };

    const removeWorkspaceImage = (index: number) => {
        setWorkspaceImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    // --- Xử lý Rooms (Bổ sung Amenity Logic) ---

    const addRoom = () => {
        // Mặc định chọn tất cả tiện ích cho phòng mới
        const allAmenityIds = amenities.map(a => a.id);
        setRoomsData(prev => [...prev, { ...initialRoomData, amenityIds: allAmenityIds }]);
    };

    const removeRoom = (index: number) => {
        setRoomsData(prev => prev.filter((_, i) => i !== index));
    };

    const handleRoomInputChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setRoomsData(prev => prev.map((room, i) => {
            if (i === index) {
                // Đảm bảo các giá trị số được parse đúng
                const newValue = (type === 'number' || name === 'workSpaceRoomTypeId' || name === 'pricePerHour' || name === 'pricePerDay' || name === 'pricePerMonth' || name === 'capacity' || name === 'area') 
                                                           ? parseFloat(value) || 0 
                                                           : value;
                return { ...room, [name]: newValue };
            }
            return room;
        }));
    };

    const handleRoomFileChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 3) {
                setError(`Phòng ${index + 1}: Chỉ có thể tải lên tối đa 3 ảnh.`);
                return;
            }
            
            setRoomsData(prev => prev.map((room, i) => {
                if (i === index) {
                    return { ...room, imageFiles: files };
                }
                return room;
            }));
            setError(null);
        }
    };

    const removeRoomImage = (roomIndex: number, imageIndex: number) => {
        setRoomsData(prev => prev.map((room, i) => {
            if (i === roomIndex) {
                return {
                    ...room,
                    imageFiles: room.imageFiles.filter((_, idx) => idx !== imageIndex)
                };
            }
            return room;
        }));
    };

    // **********************************
    // 4. HÀM XỬ LÝ CHECKBOX AMENITY
    // **********************************
    const handleRoomAmenityChange = (roomIndex: number, amenityId: number, isChecked: boolean) => {
        setRoomsData(prev => prev.map((room, i) => {
            if (i === roomIndex) {
                let newAmenityIds = [...room.amenityIds];
                if (isChecked) {
                    // Thêm ID nếu chưa có
                    if (!newAmenityIds.includes(amenityId)) {
                        newAmenityIds.push(amenityId);
                    }
                } else {
                    // Loại bỏ ID
                    newAmenityIds = newAmenityIds.filter(id => id !== amenityId);
                }
                return { ...room, amenityIds: newAmenityIds };
            }
            return room;
        }));
    };

    // --- Submit (Giữ nguyên) ---

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!token) {
             setError("Lỗi xác thực: Không tìm thấy token.");
             return;
        }
        
        if (workspaceImageFiles.length === 0) {
            setError("Vui lòng chọn ít nhất một ảnh cho Workspace chính.");
            return;
        }

        if (roomsData.length === 0) {
            setError("Vui lòng thêm ít nhất một phòng.");
            return;
        }
        
        const roomWithoutImages = roomsData.findIndex(room => room.imageFiles.length === 0);
        if (roomWithoutImages !== -1) {
            setError(`Phòng ${roomWithoutImages + 1} cần ít nhất một ảnh.`);
            return;
        }
        
        const rawDataToSend: RawWorkspaceData = {
            ...formData,
            imageFiles: workspaceImageFiles,
            rooms: roomsData, 
        };

        setIsLoading(true);
        try {
            await handleCreateWorkspace(rawDataToSend, token);
            
            toast.success("Tạo Workspace thành công! Đang chờ duyệt.");
            onSuccess(); 

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Tạo Workspace thất bại. Vui lòng kiểm tra lại thông tin và kết nối mạng.";
            console.error("Lỗi tạo Workspace:", err);
            setError(errorMessage); 
        } finally {
            setIsLoading(false);
        }
    };
    
    // JSX cho Form
    return (
        <div className={cx('formOverlay')} onClick={onCancel}>
            <div className={cx('formContainer')} onClick={(e) => e.stopPropagation()}>
                <div className={cx('formHeader')}>
                    <div className={cx('headerContent')}>
                         <LocationIcon className={cx('headerIcon')} width={28} height={28} />
                         <div className={cx('headerText')}>
                            <h1 className={cx('formTitle')}>Tạo Workspace Mới</h1>
                            <p className={cx('formSubtitle')}>Điền thông tin chi tiết về không gian làm việc và các phòng</p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className={cx('closeButton')}
                        disabled={isLoading}
                    >
                        <CloseIcon width={20} height={20} /> 
                    </button>
                </div>

                <div className={cx('formContent')}>
                    <form onSubmit={handleSubmit} className={cx('form')}>
                        {error && <div className={cx('errorBanner')}>{error}</div>}
                        
                        {/* Section 1: Basic Information (Giữ nguyên) */}
                        <div className={cx('formSection', 'card')}>
                            <div className={cx('sectionHeader')}>
                                <div className={cx('sectionNumber')}>01</div>
                                <h3 className={cx('sectionTitle')}>Thông tin cơ bản</h3>
                            </div>
                            <div className={cx('formGrid')}>
                                <div className={cx('inputGroup', 'span-2')}>
                                    <label className={cx('inputLabel')}>Tiêu đề workspace <span className={cx('required')}>*</span></label>
                                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} className={cx('inputField')} placeholder="Nhập tiêu đề workspace..." required />
                                </div>
                                
                                <div className={cx('inputGroup', 'span-2')}>
                                    <label className={cx('inputLabel')}>Mô tả chi tiết <span className={cx('required')}>*</span></label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} className={cx('textareaField')} placeholder="Mô tả về không gian, tiện ích, đặc điểm nổi bật..." rows={4} required />
                                </div>

                                <div className={cx('inputGroup')}>
                                    <label className={cx('inputLabel')}>Loại Workspace <span className={cx('required')}>*</span></label>
                                    <select name="workSpaceTypeId" value={formData.workSpaceTypeId} onChange={handleInputChange} className={cx('inputField')} required>
                                         {/* Giữ nguyên các options này */}
                                        <option value={1}>Private Office</option>
                                        <option value={2}>Meeting Room</option>
                                        <option value={3}>Coworking Space</option>
                                        <option value={4}>Event Space</option>
                                        <option value={5}>Hot Desk</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Address & Location (Giữ nguyên) */}
                        <div className={cx('formSection', 'card')}>
                            <div className={cx('sectionHeader')}>
                                <div className={cx('sectionNumber')}>02</div>
                                <h3 className={cx('sectionTitle')}>Địa chỉ & Vị trí</h3>
                            </div>
                            <div className={cx('formGrid', 'threeColumns')}>
                                <div className={cx('inputGroup')}><label className={cx('inputLabel')}>Tỉnh/Thành phố <span className={cx('required')}>*</span></label><input type="text" name="state" value={formData.state} onChange={handleInputChange} className={cx('inputField')} placeholder="Bắt buộc: Đà Nẵng" required /></div>
                                <div className={cx('inputGroup')}><label className={cx('inputLabel')}>Phường/Xã <span className={cx('required')}>*</span></label><input type="text" name="ward" value={formData.ward} onChange={handleInputChange} className={cx('inputField')} placeholder="Ví dụ: Quận Hải Châu" required /></div>
                                <div className={cx('inputGroup')}><label className={cx('inputLabel')}>Mã bưu điện <span className={cx('required')}>*</span></label><input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className={cx('inputField')} placeholder="Ví dụ: 100000" required /></div>
                                <div className={cx('inputGroup', 'span-2')}><label className={cx('inputLabel')}>Đường/Phố <span className={cx('required')}>*</span></label><input type="text" name="street" value={formData.street} onChange={handleInputChange} className={cx('inputField')} placeholder="Ví dụ: Đường Duy Tân" required /></div>

                                <div className={cx('inputGroup')}><label className={cx('inputLabel')}>Vĩ độ <span className={cx('required')}>*</span></label><input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange} className={cx('inputField')} placeholder="Ví dụ: 21.0285" required /></div>
                                <div className={cx('inputGroup')}><label className={cx('inputLabel')}>Kinh độ <span className={cx('required')}>*</span></label><input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange} className={cx('inputField')} placeholder="Ví dụ: 105.8542" required /></div>
                            </div>
                        </div>

                        {/* Section 3: Images (Main Workspace) (Giữ nguyên) */}
                        <div className={cx('formSection', 'card')}>
                            <div className={cx('sectionHeader')}>
                                <div className={cx('sectionNumber')}>03</div>
                                <h3 className={cx('sectionTitle')}>Hình ảnh Workspace Chính</h3>
                            </div>
                            <div className={cx('fileUploadSection')}>
                                <label className={cx('fileInputLabel')}>
                                    <div className={cx('uploadArea', { hasFiles: workspaceImageFiles.length > 0 })}>
                                        <CameraIcon width={48} height={48} className={cx('uploadIcon')} /> 
                                        <div className={cx('uploadText')}>
                                            <span className={cx('uploadTitle')}>Tải lên hình ảnh chính</span>
                                            <span className={cx('uploadSubtitle')}>Kéo thả file hoặc click để chọn (Tối đa 5 ảnh)</span>
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        name="workspaceImageFiles"
                                        accept="image/*" 
                                        multiple 
                                        onChange={handleWorkspaceFileChange}
                                        disabled={isLoading}
                                        className={cx('fileInput')}
                                    />
                                </label>
                                
                                {workspaceImageFiles.length > 0 && (
                                    <div className={cx('filePreview')}>
                                        <p className={cx('fileCount')}>Đã chọn **{workspaceImageFiles.length}/5** ảnh</p>
                                        <div className={cx('previewGrid')}>
                                            {workspaceImageFiles.map((file, index) => (
                                                <div key={index} className={cx('previewItem')}>
                                                    <img 
                                                        src={URL.createObjectURL(file)} 
                                                        alt={`Workspace Preview ${index + 1}`}
                                                        className={cx('previewImage')}
                                                    />
                                                    <button type="button" onClick={() => removeWorkspaceImage(index)} className={cx('removeImageBtn')}>
                                                        <CloseIcon width={12} height={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 4: Rooms (Dynamic) */}
                        <div className={cx('formSection', 'card')}>
                            <div className={cx('sectionHeader', 'roomSectionHeader')}>
                                <div className={cx('sectionNumber')}>04</div>
                                <h3 className={cx('sectionTitle')}>Quản lý Phòng (Rooms)</h3>
                                <button type="button" onClick={addRoom} className={cx('addRoomBtn')} disabled={isLoading}>
                                    <PlusIcon width={16} height={16} /> Thêm Phòng 
                                </button>
                            </div>

                            {roomsData.length === 0 && (
                                <p className={cx('noRoomsText')}>Chưa có phòng nào được thêm vào. Vui lòng thêm ít nhất một phòng.</p>
                            )}

                            {roomsData.map((room, index) => (
                                <div key={index} className={cx('roomCard')}>
                                    <div className={cx('roomHeader')}>
                                        <h4>Phòng #{index + 1}: {room.title || "Chưa đặt tên"}</h4>
                                        <button type="button" onClick={() => removeRoom(index)} className={cx('deleteRoomBtn')} disabled={isLoading}>
                                            <TrashIcon width={16} height={16} /> 
                                        </button>
                                    </div>

                                    <div className={cx('formGrid', 'twoColumns')}>
                                        {/* Inputs Cơ bản (Giữ nguyên) */}
                                        <div className={cx('inputGroup', 'span-2')}>
                                            <label className={cx('inputLabel')}>Tên phòng <span className={cx('required')}>*</span></label>
                                            <input type="text" name="title" value={room.title} onChange={(e) => handleRoomInputChange(index, e)} className={cx('inputField')} placeholder="Ví dụ: Phòng họp lớn" required />
                                        </div>
                                        <div className={cx('inputGroup', 'span-2')}>
                                            <label className={cx('inputLabel')}>Mô tả phòng</label>
                                            <textarea name="description" value={room.description} onChange={(e) => handleRoomInputChange(index, e)} className={cx('textareaField')} placeholder="Chi tiết về phòng..." rows={2} />
                                        </div>

                                        <div className={cx('inputGroup')}><label className={cx('inputLabel')}>Loại phòng <span className={cx('required')}>*</span></label>
                                            <select name="workSpaceRoomTypeId" value={room.workSpaceRoomTypeId} onChange={(e) => handleRoomInputChange(index, e)} className={cx('inputField')} required>
                                                 {/* Giữ nguyên các options này */}
                                                <option value={1}>Desk</option>
                                                <option value={2}>Cabin</option>
                                                <option value={3}>Conference Room</option>
                                            </select>
                                        </div>
                                        <div className={cx('inputGroup')}><label className={cx('inputLabel')}>Sức chứa (người) <span className={cx('required')}>*</span></label><input type="number" name="capacity" value={room.capacity} onChange={(e) => handleRoomInputChange(index, e)} className={cx('inputField')} min={1} required /></div>
                                        
                                        <div className={cx('inputGroup')}><label className={cx('inputLabel')}>Giá/Giờ (VND) <span className={cx('required')}>*</span></label><input type="number" name="pricePerHour" value={room.pricePerHour} onChange={(e) => handleRoomInputChange(index, e)} className={cx('inputField')} min={0} required /></div>
                                        <div className={cx('inputGroup')}><label className={cx('inputLabel')}>Diện tích ($m^2$)</label><input type="number" name="area" value={room.area} onChange={(e) => handleRoomInputChange(index, e)} className={cx('inputField')} min={0} /></div>

                                        {/* Room Image Upload (Giữ nguyên) */}
                                        <div className={cx('inputGroup', 'span-2')}>
                                            <label className={cx('inputLabel')}>Hình ảnh phòng (Tối đa 3 ảnh) <span className={cx('required')}>*</span></label>
                                            <div className={cx('fileUploadSection', 'compact')}>
                                                <label className={cx('fileInputLabel')}>
                                                    <div className={cx('uploadArea', 'small')}>
                                                        <CameraIcon width={24} height={24} className={cx('uploadIcon')} /> 
                                                        <span className={cx('uploadSubtitle')}>Click để chọn ảnh</span>
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        multiple 
                                                        onChange={(e) => handleRoomFileChange(index, e)}
                                                        disabled={isLoading}
                                                        className={cx('fileInput')}
                                                    />
                                                </label>
                                                
                                                {room.imageFiles.length > 0 && (
                                                    <div className={cx('filePreview', 'compact')}>
                                                        <div className={cx('previewGrid', 'roomPreviewGrid')}>
                                                            {room.imageFiles.map((file, imgIndex) => (
                                                                <div key={imgIndex} className={cx('previewItem')}>
                                                                    <img src={URL.createObjectURL(file)} alt={`Room ${index + 1} Preview ${imgIndex + 1}`} className={cx('previewImage')} />
                                                                    <button type="button" onClick={() => removeRoomImage(index, imgIndex)} className={cx('removeImageBtn')}>
                                                                        <CloseIcon width={10} height={10} />
                                                                    </button> 
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ********************************** */}
                                        {/* 5. PHẦN CHỌN AMENITIES CHO PHÒNG */}
                                        {/* ********************************** */}
                                        <div className={cx('inputGroup', 'span-2')}>
                                            <label className={cx('inputLabel')}>Tiện ích trong phòng:</label>
                                            {isAmenitiesLoading ? (
                                                <p>Đang tải danh sách tiện ích...</p>
                                            ) : (
                                                <div className={cx('amenityGrid')}>
                                                    {amenities.map(amenity => (
                                                        <div key={amenity.id} className={cx('amenityItem')}>
                                                            <input
                                                                type="checkbox"
                                                                id={`room-${index}-amenity-${amenity.id}`}
                                                                name={`amenity-${amenity.id}`}
                                                                checked={room.amenityIds.includes(amenity.id)}
                                                                onChange={(e) => handleRoomAmenityChange(index, amenity.id, e.target.checked)}
                                                                className={cx('amenityCheckbox')}
                                                                disabled={isLoading}
                                                            />
                                                            <label 
                                                                htmlFor={`room-${index}-amenity-${amenity.id}`} 
                                                                className={cx('amenityLabel')}
                                                                title={amenity.description}
                                                            >
                                                                {amenity.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                        {/* Action Buttons (Giữ nguyên) */}
                        <div className={cx('buttonGroup')}>
                            <button 
                                type="button" 
                                onClick={onCancel} 
                                disabled={isLoading} 
                                className={cx('cancelBtn')}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit" 
                                disabled={isLoading || roomsData.length === 0} 
                                className={cx('submitBtn', { loading: isLoading })}
                            >
                                {isLoading ? (
                                    <span className={cx('loadingText')}>Đang tạo workspace...</span>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={cx('submitIcon')}>
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Tạo Workspace
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}