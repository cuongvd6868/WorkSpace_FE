import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUpload, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './DrinkServiceFormModal.module.scss';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

// Interface cho Workspace cơ bản (từ parent component)
interface WorkspaceListItem {
    id: number;
    title: string;
}

// Interface cho props của Modal
interface DrinkServiceFormModalProps {
    onClose: () => void;
    onSubmit: (data: any) => void;
    isCreating: boolean;
    initialData: any; // Có thể là DrinkServiceUpdateRequest hoặc null
    workspaces: WorkspaceListItem[]; // Danh sách Workspace để chọn khi tạo mới
}

// State nội bộ của Form
interface FormDataState {
    name: string;
    description: string;
    price: string;
    imageUrl: string; // URL ảnh cũ (chỉ có khi Edit)
    imageFile: File | null; // File ảnh mới được chọn
    isActive: boolean; // Chỉ có khi Edit
    workSpaceId: number | null; // Chỉ cần khi Create
    newImageFile?: File; // Dùng cho chế độ cập nhật
}

const DrinkServiceFormModal: React.FC<DrinkServiceFormModalProps> = ({
    onClose,
    onSubmit,
    isCreating,
    initialData,
    workspaces,
}) => {
    // Thêm state loading để điều khiển nút submit
    const [loading, setLoading] = useState(false); 
    
    const [formData, setFormData] = useState<FormDataState>({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        imageFile: null,
        isActive: true,
        workSpaceId: isCreating ? (workspaces.length > 0 ? workspaces[0].id : null) : null,
    });
    
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // --- Khởi tạo dữ liệu khi Modal mở ---
    useEffect(() => {
        if (!isCreating && initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                price: initialData.price?.toString() || '',
                imageUrl: initialData.imageUrl || '',
                imageFile: null,
                isActive: initialData.isActive ?? true,
                workSpaceId: null, // Không cần trong chế độ Edit
                newImageFile: undefined,
            });
            setPreviewUrl(initialData.imageUrl || null);
        } else if (isCreating) {
            // Đặt Workspace mặc định cho chế độ tạo mới
            setFormData(prev => ({
                ...prev,
                workSpaceId: workspaces.length > 0 ? workspaces[0].id : null
            }));
        }
    }, [isCreating, initialData, workspaces]);


    // --- Xử lý thay đổi Input ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (name === 'workSpaceId') {
            setFormData(prev => ({ ...prev, workSpaceId: parseInt(value, 10) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- Xử lý chọn File ảnh ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ 
                ...prev, 
                imageFile: file, 
                newImageFile: file // Đánh dấu là file mới được chọn (dùng cho Update)
            }));
            if (previewUrl) URL.revokeObjectURL(previewUrl); // Clean up previous preview
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // --- Xóa ảnh Preview ---
    const handleRemoveImage = () => {
        if (previewUrl && formData.imageFile) {
            URL.revokeObjectURL(previewUrl); // Giải phóng bộ nhớ preview
        }
        setFormData(prev => ({ 
            ...prev, 
            imageUrl: isCreating ? '' : (initialData?.imageUrl || ''), 
            imageFile: null,
            newImageFile: undefined
        }));
        setPreviewUrl(isCreating ? null : (initialData?.imageUrl || null));
    };


    // --- Xử lý Submit Form ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { name, description, price, workSpaceId, imageFile } = formData;
        
        // 1. Validation
        if (!name || !description || !price) {
            toast.error("Vui lòng điền đầy đủ Tên, Mô tả và Giá.");
            return;
        }

        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
             toast.error("Giá phải là một số dương hợp lệ.");
             return;
        }

        if (isCreating && (!imageFile || !workSpaceId)) {
            toast.error("Vui lòng chọn Workspace và File ảnh cho dịch vụ mới.");
            return;
        }
        
        if (!isCreating && !formData.imageUrl && !formData.imageFile) {
             toast.error("Vui lòng chọn một ảnh cho dịch vụ.");
             return;
        }


        setLoading(true);

        try {
            // 2. Chuẩn bị Payload
            const payload = {
                ...formData,
                price: parseFloat(price),
                ...(isCreating && { workSpaceId }),
                // Trong chế độ cập nhật, chúng ta cần gửi imageFile dưới tên newImageFile
                ...(formData.newImageFile && { newImageFile: formData.newImageFile }),
                // Đảm bảo không gửi imageFile (File) và imageUrl (string) cùng lúc nếu đang tạo mới
                imageFile: isCreating ? imageFile : undefined
            };

            // 3. Gọi hàm submit
            await onSubmit(payload);

        } catch (error) {
            // Nếu lỗi, toast sẽ hiển thị từ parent component
            console.error(error);
        } finally {
            // Lưu ý: Loading phải được set false sau khi modal đóng (được xử lý ở parent)
            // Tuy nhiên, để bảo đảm nút không bị kẹt khi API lỗi, ta reset ở đây.
            setLoading(false);
        }
    };

    return (
        <div className={cx('modal-overlay')} onClick={onClose}>
            <div className={cx('modal-content')} onClick={(e) => e.stopPropagation()}>
                
                <div className={cx('modal-header')}>
                    <h3>{isCreating ? '➕ Thêm Dịch Vụ Đồ Uống Mới' : '🛠️ Chỉnh Sửa Dịch Vụ Đồ Uống'}</h3>
                    <button className={cx('close-btn')} onClick={onClose} disabled={loading}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <form className={cx('drink-form')} onSubmit={handleSubmit}>
                    
                    {/* 1. Chọn Workspace (Chỉ khi Create) */}
                    {isCreating && (
                        <div className={cx('form-group')}>
                            <label htmlFor="workSpaceId">Workspace áp dụng *</label>
                            <select
                                id="workSpaceId"
                                name="workSpaceId"
                                value={formData.workSpaceId || ''}
                                onChange={handleChange}
                                required
                                disabled={workspaces.length === 0 || loading}
                            >
                                {workspaces.length === 0 ? (
                                    <option value="">Không có Workspace khả dụng</option>
                                ) : (
                                    workspaces.map(ws => (
                                        <option key={ws.id} value={ws.id}>
                                            {ws.title}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    )}

                    {/* 2. Tên Dịch Vụ */}
                    <div className={cx('form-group')}>
                        <label htmlFor="name">Tên Dịch Vụ *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ví dụ: Cà phê đen đá, Bánh ngọt Tiramisu..."
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* 3. Mô tả */}
                    <div className={cx('form-group')}>
                        <label htmlFor="description">Mô Tả</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Mô tả ngắn gọn về sản phẩm (Thành phần, hương vị...)"
                            disabled={loading}
                        />
                    </div>

                    {/* 4. Giá */}
                    <div className={cx('form-group', 'price-group')}>
                        <label htmlFor="price">Giá (VND) *</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0"
                            min="1000"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    {/* 5. Trạng thái (Chỉ khi Edit) */}
                    {!isCreating && (
                        <div className={cx('form-group', 'checkbox-group')}>
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <label htmlFor="isActive">Hoạt động (Hiển thị cho khách hàng)</label>
                        </div>
                    )}

                    {/* 6. Upload Ảnh */}
                    <div className={cx('form-group')}>
                        <label>Ảnh Dịch Vụ {isCreating && '*'}</label>
                        
                        <div className={cx('image-upload-area')}>
                            {previewUrl ? (
                                <div className={cx('image-preview')}>
                                    <img src={previewUrl} alt="Preview" />
                                    <button 
                                        type="button" 
                                        className={cx('remove-btn')} 
                                        onClick={handleRemoveImage}
                                        disabled={loading}
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="imageFile" className={cx('upload-label', { 'disabled': loading })}>
                                    <FontAwesomeIcon icon={faUpload} />
                                    <span>Chọn ảnh sản phẩm</span>
                                    {/* Input file ẩn */}
                                    <input
                                        type="file"
                                        id="imageFile"
                                        name="imageFile"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className={cx('file-input')}
                                        disabled={loading}
                                    />
                                </label>
                            )}
                            
                            {(isCreating && !previewUrl) && (
                                <p className={cx('required-info')}>Yêu cầu ảnh chất lượng cao để tạo mới.</p>
                            )}
                        </div>
                    </div>


                    <div className={cx('modal-footer')}>
                        <button type="button" className={cx('cancel-btn')} onClick={onClose} disabled={loading}>
                            Hủy
                        </button>
                        <button type="submit" className={cx('submit-btn')} disabled={loading}>
                            {isCreating ? 'Tạo Dịch Vụ' : 'Lưu Thay Đổi'}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default DrinkServiceFormModal;