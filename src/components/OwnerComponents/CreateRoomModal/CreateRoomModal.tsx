// CreateRoomModal.tsx

import React, { useState, useMemo } from 'react';
import classNames from "classnames/bind";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faPlus, faTag, faUsers, faDollarSign, faImage, faCogs, faCloudUploadAlt, faTrashAlt, faWifi, faSnowflake, faPrint, faDoorClosed, faMugHot, faChair, faCouch, faLock, faCar, faHeadset, faTv, faChalkboard, faUtensils, faBellConcierge, faShieldHalved, faElevator, faLeaf, faVideo, faPlug, faEarDeaf } from '@fortawesome/free-solid-svg-icons';

// Import type từ file Workspaces (theo yêu cầu)
import { RawCreateRoomData } from "~/types/Owner"; 
import { handleCreateNewRoom } from "~/services/OwnerService"; // Hàm service thực tế

import styles from './CreateRoomModal.module.scss'; 

const cx = classNames.bind(styles);

// Dữ liệu giả định cho các loại phòng (Dựa trên image_5899d6.png)
const MOCK_ROOM_TYPES = [
    { id: 1, name: "Private Office" },
    { id: 2, name: "Meeting Room" },
    { id: 3, name: "Coworking Desk" },
    { id: 4, name: "Hot Desk" },
    { id: 5, name: "Conference Room" },
    { id: 6, name: "Virtual Office" },
    { id: 7, name: "Event Space" },
    { id: 8, name: "Training Room" },
    { id: 9, name: "Lounge Area" },
    { id: 10, name: "Studio Room" },
];

// Dữ liệu giả định cho các tiện ích (Dựa trên image_5896f2.png)
const MOCK_AMENITIES = [
    { id: 1, name: "Wi-Fi tốc độ cao", icon: faWifi },
    { id: 2, name: "Điều hòa không khí", icon: faSnowflake },
    { id: 3, name: "Máy in & máy scan", icon: faPrint },
    { id: 4, name: "Phòng họp riêng", icon: faDoorClosed },
    { id: 5, name: "Thường thức cà phê", icon: faMugHot },
    { id: 6, name: "Ghế ngồi thoải mái", icon: faChair },
    { id: 7, name: "Khu vực nghỉ ngơi", icon: faCouch },
    { id: 8, name: "Tủ locker cá nhân", icon: faLock },
    { id: 9, name: "Chỗ đỗ xe", icon: faCar },
    { id: 10, name: "Hỗ trợ kỹ thuật", icon: faHeadset },
    { id: 11, name: "Máy chiếu & màn hình", icon: faTv },
    { id: 12, name: "Bảng trắng", icon: faChalkboard },
    { id: 13, name: "Khu pantry", icon: faUtensils },
    { id: 14, name: "Dịch vụ lễ tân", icon: faBellConcierge },
    { id: 15, name: "Bảo vệ 24/7", icon: faShieldHalved },
    { id: 16, name: "Thang máy", icon: faElevator },
    { id: 17, name: "Không gian xanh", icon: faLeaf },
    { id: 18, name: "Hệ thống camera an ninh", icon: faVideo },
    { id: 19, name: "Ổ cắm & sạc điện thoại", icon: faPlug },
    { id: 20, name: "Không gian yên tĩnh", icon: faEarDeaf },
];

interface CreateRoomModalProps {
    workspaceId: number;
    onClose: () => void;
    onRoomCreated: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ workspaceId, onClose, onRoomCreated }) => {
    
    const token: any = localStorage.getItem('token'); 

    const [formData, setFormData] = useState<Omit<RawCreateRoomData, 'imageFiles'>>({
        title: '',
        description: '',
        workSpaceRoomTypeId: MOCK_ROOM_TYPES[0]?.id || 1, 
        pricePerHour: 0,
        pricePerDay: 1,
        pricePerMonth: 1,
        capacity: 1,
        area: 1,
        amenityIds: [],
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        let finalValue: string | number;

        if (name === 'workSpaceRoomTypeId') {
             finalValue = parseInt(value) || 0;
        } else if (['pricePerHour', 'pricePerDay', 'pricePerMonth', 'capacity', 'area'].includes(name)) {
            const numValue = parseInt(value) || 0;
            const minValue = (name === 'capacity' || name === 'area') ? 1 : 0;
            finalValue = Math.max(numValue, minValue);
        } else {
            finalValue = value;
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleAmenityChange = (amenityId: number, isChecked: boolean) => {
        setFormData(prev => {
            const currentAmenities = prev.amenityIds;
            const updatedAmenities = isChecked
                ? [...currentAmenities, amenityId]
                : currentAmenities.filter(id => id !== amenityId);
            
            return { ...prev, amenityIds: updatedAmenities };
        });
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const maxFiles = 5; 
            const totalFiles = imageFiles.length + newFiles.length;

            if (totalFiles > maxFiles) {
                const remainingSlots = maxFiles - imageFiles.length;
                if (remainingSlots > 0) {
                     toast.warning(`Chỉ được tải lên tối đa ${maxFiles} ảnh. Chỉ thêm được ${remainingSlots} ảnh nữa.`);
                    setImageFiles(prev => [...prev, ...newFiles.slice(0, remainingSlots)]);
                } else {
                    toast.warning(`Đã đạt giới hạn tối đa ${maxFiles} ảnh.`);
                }
            } else {
                setImageFiles(prev => [...prev, ...newFiles]);
            }
            e.target.value = ''; 
        }
    };

    const handleRemoveFile = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const imagePreviews = useMemo(() => {
        return imageFiles.map(file => URL.createObjectURL(file));
    }, [imageFiles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // --- Validation ---
        if (formData.title.trim() === '') {
            toast.warning("Vui lòng nhập tên phòng.");
            return;
        }
        if (imageFiles.length === 0) {
            toast.warning("Vui lòng tải lên ít nhất một ảnh cho phòng.");
            return;
        }
        const hasPrice = formData.pricePerHour > 0 || formData.pricePerDay > 0 || formData.pricePerMonth > 0;
        if (!hasPrice) {
            toast.warning("Phải có ít nhất một mức giá (theo giờ, ngày, hoặc tháng) lớn hơn 0.");
            return;
        }
        // --- End Validation ---

        setIsSubmitting(true);
        toast.info(`Đang tạo phòng cho Workspace ID ${workspaceId}...`, { autoClose: 5000 });

        const rawRoomData: RawCreateRoomData = {
            ...formData,
            imageFiles: imageFiles,
        };

        try {
            const newRoom = await handleCreateNewRoom(workspaceId, rawRoomData, token);
            
            toast.success(`Phòng "${newRoom.title}" đã được tạo thành công!`);
            onRoomCreated(); 
            onClose();

        } catch (e: any) {
            console.error("Lỗi tạo phòng:", e);
            toast.error(e.message || "Tạo phòng thất bại. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cx('modal-backdrop')} onClick={onClose}>
            <div className={cx('modal-container')} onClick={(e) => e.stopPropagation()}>
                <div className={cx('modal-header')}>
                    <h2><FontAwesomeIcon icon={faPlus} /> Thêm Phòng mới (Workspace #{workspaceId})</h2>
                    <button className={cx('close-btn')} onClick={onClose} disabled={isSubmitting}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <form className={cx('room-form')} onSubmit={handleSubmit}> {/* THÊM CLASS room-form */}
                    <div className={cx('modal-body')}>
                        
                        <div className={cx('form-grid')}>
                            {/* Cột 1: Thông tin cơ bản & Thông số */}
                            <div className={cx('grid-column')}>
                                
                                {/* Thông tin cơ bản */}
                                <div className={cx('form-section', 'basic-info-section')}>
                                    <h4 className={cx('section-title')}><FontAwesomeIcon icon={faTag} /> Thông tin cơ bản</h4>
                                    
                                    <label>Tên phòng:</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Ví dụ: Meeting Room A1" />
                                    
                                    <label>Loại phòng:</label>
                                    <select name="workSpaceRoomTypeId" value={formData.workSpaceRoomTypeId} onChange={handleChange} required>
                                        {MOCK_ROOM_TYPES.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>

                                    <label>Mô tả:</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} placeholder="Mô tả chi tiết về phòng..." />
                                </div>

                                {/* Thông số kỹ thuật */}
                                <div className={cx('form-section', 'specs-section')}>
                                    <h4 className={cx('section-title')}><FontAwesomeIcon icon={faUsers} /> Thông số & Diện tích</h4>
                                    
                                    <div className={cx('input-group-grid', 'grid-2')}>
                                        <div>
                                            <label>Sức chứa (người):</label>
                                            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" required />
                                        </div>
                                        <div>
                                            <label>Diện tích (m²):</label>
                                            <input type="number" name="area" value={formData.area} onChange={handleChange} min="1" required />
                                        </div>
                                    </div>
                                </div>
                            </div> {/* Kết thúc Cột 1 */}

                            {/* Cột 2: Giá thuê & Tiện ích */}
                            <div className={cx('grid-column')}>

                                {/* Giá thuê */}
                                <div className={cx('form-section', 'price-section')}>
                                    <h4 className={cx('section-title')}><FontAwesomeIcon icon={faDollarSign} /> Giá thuê (VND)</h4>
                                    <p className={cx('hint')}>*Cần nhập ít nhất một mức giá lớn hơn 0.</p>
                                    
                                    <label>Giá/Giờ:</label>
                                    <input type="number" name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} min="0" placeholder="0" />
                                    
                                    {/* <label>Giá/Ngày:</label>
                                    <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} min="0" placeholder="0" />
                                    
                                    <label>Giá/Tháng:</label>
                                    <input type="number" name="pricePerMonth" value={formData.pricePerMonth} onChange={handleChange} min="0" placeholder="0" /> */}
                                </div>

                                {/* Tiện ích */}
                                <div className={cx('form-section', 'amenities-section')}>
                                    <h4 className={cx('section-title')}><FontAwesomeIcon icon={faCogs} /> Tiện ích (Amenities)</h4>
                                    <div className={cx('amenities-checkboxes')}>
                                        {MOCK_AMENITIES.map(amenity => (
                                            <label key={amenity.id} className={cx('amenity-label')}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.amenityIds.includes(amenity.id)}
                                                    onChange={(e) => handleAmenityChange(amenity.id, e.target.checked)}
                                                />
                                                <FontAwesomeIcon icon={amenity.icon} /> {amenity.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                            </div> {/* Kết thúc Cột 2 */}
                        </div> {/* Kết thúc form-grid */}

                        {/* Hình ảnh Phòng (Toàn chiều rộng) */}
                        <div className={cx('form-section', 'image-upload-section')}>
                            <h4 className={cx('section-title')}><FontAwesomeIcon icon={faImage} /> Hình ảnh Phòng (Tối đa 5 ảnh)</h4>
                            
                            <label className={cx('upload-label')}>
                                <FontAwesomeIcon icon={faCloudUploadAlt} className={cx('upload-icon')} />
                                Tải lên ảnh (Kéo & thả hoặc click)
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*"
                                    onChange={handleImageChange} 
                                    className={cx('hidden-input')}
                                />
                            </label>
                            
                            {/* Preview Ảnh */}
                            {imageFiles.length > 0 && (
                                <div className={cx('image-preview-list')}>
                                    {imageFiles.map((file, index) => (
                                        <div key={index} className={cx('image-preview-item')}>
                                            <img src={imagePreviews[index]} alt={`Preview ${index}`} />
                                            <button 
                                                type="button" 
                                                className={cx('remove-btn')} 
                                                onClick={() => handleRemoveFile(index)}
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                            <span className={cx('file-name')}>{file.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {imageFiles.length === 0 && (
                                <p className={cx('hint', 'warning')}>*Chưa có ảnh nào được chọn.</p>
                            )}
                        </div>

                    </div>
                    
                    {/* Footer */}
                    <div className={cx('modal-footer')}>
                        <button type="button" className={cx('btn-secondary')} onClick={onClose} disabled={isSubmitting}>Hủy</button>
                        <button type="submit" className={cx('btn-primary')} disabled={isSubmitting}>
                            <FontAwesomeIcon icon={isSubmitting ? faSpinner : faPlus} spin={isSubmitting} /> 
                            {isSubmitting ? ' Đang tạo phòng...' : ' Lưu & Tạo Phòng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;