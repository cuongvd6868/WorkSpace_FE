import React, { useState, FormEvent, ChangeEvent } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

// ⚠️ Cần import styles và các hàm/kiểu dữ liệu chính xác
import styles from './CreateWorkspaceForm.module.scss'; 
import { RawWorkspaceData, handleCreateWorkspace } from '~/services/OwnerService'; 

const cx = classNames.bind(styles);

// --- Định nghĩa Kiểu dữ liệu và Props ---

type FormState = Omit<RawWorkspaceData, 'imageFiles'>;

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

export function CreateWorkspaceForm({ onSuccess, onCancel }: CreateWorkspaceFormProps) {
    
    const [formData, setFormData] = useState<FormState>(initialFormData);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token : any = localStorage.getItem('token');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: (type === 'number' || name === 'workSpaceTypeId' || name === 'latitude' || name === 'longitude') 
                    ? parseFloat(value) || 0 
                    : value,
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 5) {
                setError("Chỉ có thể tải lên tối đa 5 ảnh.");
                return;
            }
            setImageFiles(files);
            setError(null);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (imageFiles.length === 0) {
            setError("Vui lòng chọn ít nhất một ảnh để tạo Workspace.");
            return;
        }

        const rawDataToSend: RawWorkspaceData = {
            ...formData,
            imageFiles: imageFiles,
        };

        setIsLoading(true);
        try {
            await handleCreateWorkspace(rawDataToSend, token);
            
            toast.success("Tạo Workspace thành công! Đang chờ duyệt.");
            onSuccess(); 

        } catch (err) {
            console.error("Lỗi tạo Workspace:", err);
            setError("Tạo Workspace thất bại. Vui lòng kiểm tra lại thông tin và kết nối mạng."); 
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className={cx('formOverlay')} onClick={onCancel}>
            <div className={cx('formContainer')} onClick={(e) => e.stopPropagation()}>
                <div className={cx('formHeader')}>
                    <div className={cx('headerContent')}>
                        {/* <div className={cx('headerIcon')}>🏢</div> */}
                        <div className={cx('headerText')}>
                            <h1 className={cx('formTitle')}>Tạo Workspace Mới</h1>
                            <p className={cx('formSubtitle')}>Điền thông tin chi tiết để tạo không gian làm việc mới</p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className={cx('closeButton')}
                        disabled={isLoading}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <div className={cx('formContent')}>
                    <form onSubmit={handleSubmit} className={cx('form')}>
                        {error && <div className={cx('errorBanner')}>{error}</div>}
                        
                        {/* Section 1: Basic Information */}
                        <div className={cx('formSection')}>
                            <div className={cx('sectionHeader')}>
                                <div className={cx('sectionNumber')}>01</div>
                                <h3 className={cx('sectionTitle')}>Thông tin cơ bản</h3>
                            </div>
                            <div className={cx('formGrid')}>
                                <div className={cx('inputGroup')}>
                                    <label className={cx('inputLabel')}>
                                        <span className={cx('labelText')}>Tiêu đề workspace</span>
                                        <span className={cx('required')}>*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={formData.title} 
                                        onChange={handleInputChange} 
                                        className={cx('inputField')}
                                        placeholder="Nhập tiêu đề workspace..."
                                        required 
                                    />
                                </div>
                                
                                <div className={cx('inputGroup', 'fullWidth')}>
                                    <label className={cx('inputLabel')}>
                                        <span className={cx('labelText')}>Mô tả chi tiết</span>
                                        <span className={cx('required')}>*</span>
                                    </label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleInputChange} 
                                        className={cx('textareaField')}
                                        placeholder="Mô tả về không gian, tiện ích, đặc điểm nổi bật..."
                                        rows={4}
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Address */}
                        <div className={cx('formSection')}>
                            <div className={cx('sectionHeader')}>
                                <div className={cx('sectionNumber')}>02</div>
                                <h3 className={cx('sectionTitle')}>Địa chỉ</h3>
                            </div>
                            <div className={cx('formGrid', 'threeColumns')}>
                                <div className={cx('inputGroup')}>
                                    <label className={cx('inputLabel')}>
                                        <span className={cx('labelText')}>Tỉnh/Thành phố</span>
                                        <span className={cx('required')}>*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="state" 
                                        value={formData.state} 
                                        onChange={handleInputChange} 
                                        className={cx('inputField')}
                                        placeholder="Ví dụ: Hà Nội"
                                        required 
                                    />
                                </div>
                                
                                <div className={cx('inputGroup')}>
                                    <label className={cx('inputLabel')}>
                                        <span className={cx('labelText')}>Quận/Huyện</span>
                                        <span className={cx('required')}>*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="ward" 
                                        value={formData.ward} 
                                        onChange={handleInputChange} 
                                        className={cx('inputField')}
                                        placeholder="Ví dụ: Quận Cầu Giấy"
                                        required 
                                    />
                                </div>
                                
                                <div className={cx('inputGroup')}>
                                    <label className={cx('inputLabel')}>
                                        <span className={cx('labelText')}>Đường/Phố</span>
                                        <span className={cx('required')}>*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="street" 
                                        value={formData.street} 
                                        onChange={handleInputChange} 
                                        className={cx('inputField')}
                                        placeholder="Ví dụ: Đường Duy Tân"
                                        required 
                                    />
                                </div>
                                
                                <div className={cx('inputGroup')}>
                                    <label className={cx('inputLabel')}>
                                        <span className={cx('labelText')}>Mã bưu điện</span>
                                        <span className={cx('required')}>*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="postalCode" 
                                        value={formData.postalCode} 
                                        onChange={handleInputChange} 
                                        className={cx('inputField')}
                                        placeholder="Ví dụ: 100000"
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Additional Information */}
                        <div className={cx('formSection')}>
                            <div className={cx('sectionHeader')}>
                                <div className={cx('sectionNumber')}>03</div>
                                <h3 className={cx('sectionTitle')}>Thông tin bổ sung</h3>
                            </div>
                            <div className={cx('formGrid', 'threeColumns')}>
                                <div className={cx('inputGroup')}>
                                    <label className={cx('inputLabel')}>
                                        <span className={cx('labelText')}>Vĩ độ</span>
                                        <span className={cx('required')}>*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        step="any" 
                                        name="latitude" 
                                        value={formData.latitude} 
                                        onChange={handleInputChange} 
                                        className={cx('inputField')}
                                        placeholder="Ví dụ: 21.0285"
                                        required 
                                    />
                                </div>
                                
                                <div className={cx('inputGroup')}>
                                    <label className={cx('inputLabel')}>
                                        <span className={cx('labelText')}>Kinh độ</span>
                                        <span className={cx('required')}>*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        step="any" 
                                        name="longitude" 
                                        value={formData.longitude} 
                                        onChange={handleInputChange} 
                                        className={cx('inputField')}
                                        placeholder="Ví dụ: 105.8542"
                                        required 
                                    />
                                </div>
                                
                                <div className={cx('inputGroup')}>
                                    <label className={cx('inputLabel')}>
                                        <span className={cx('labelText')}>Loại Workspace</span>
                                        <span className={cx('required')}>*</span>
                                    </label>
                                    <select 
                                        name="workSpaceTypeId" 
                                        value={formData.workSpaceTypeId} 
                                        onChange={(e) => setFormData(prev => ({...prev, workSpaceTypeId: parseInt(e.target.value)}))}
                                        className={cx('inputField')}
                                        required
                                    >
                                        <option value={1}>Private Office</option>
                                        <option value={2}>Meeting Room</option>
                                        <option value={3}>Coworking Space</option>
                                        <option value={4}>Event Space</option>
                                        <option value={5}>Hot Desk</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Images */}
                        <div className={cx('formSection')}>
                            <div className={cx('sectionHeader')}>
                                <div className={cx('sectionNumber')}>04</div>
                                <h3 className={cx('sectionTitle')}>Hình ảnh workspace</h3>
                            </div>
                            <div className={cx('fileUploadSection')}>
                                <div className={cx('fileInputGroup')}>
                                    <label className={cx('fileInputLabel')}>
                                        <div className={cx('uploadArea', { hasFiles: imageFiles.length > 0 })}>
                                            <div className={cx('uploadIcon')}>
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                                    <path d="M14.2699 2.99999H9.71988C9.28988 2.99999 8.85988 3.14999 8.52988 3.43999L4.26988 7.32999C3.93988 7.61999 3.70988 8.04999 3.70988 8.47999V19.93C3.70988 20.88 4.46988 21.65 5.40988 21.65H18.5799C19.5199 21.65 20.2799 20.88 20.2799 19.93V8.72999C20.2799 7.77999 19.5199 6.99999 18.5799 6.99999H15.6299L14.2699 2.99999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M9.13086 14.23L11.1309 16.23L15.1309 12.23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M11.1309 16.23V9.22998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <div className={cx('uploadText')}>
                                                <span className={cx('uploadTitle')}>Tải lên hình ảnh</span>
                                                <span className={cx('uploadSubtitle')}>Kéo thả file hoặc click để chọn (Tối đa 5 ảnh)</span>
                                            </div>
                                        </div>
                                        <input 
                                            type="file" 
                                            name="imageFiles"
                                            accept="image/*" 
                                            multiple 
                                            onChange={handleFileChange}
                                            disabled={isLoading}
                                            className={cx('fileInput')}
                                        />
                                    </label>
                                    
                                    {imageFiles.length > 0 && (
                                        <div className={cx('filePreview')}>
                                            <p className={cx('fileCount')}>Đã chọn {imageFiles.length}/5 ảnh</p>
                                            <div className={cx('previewGrid')}>
                                                {imageFiles.map((file, index) => (
                                                    <div key={index} className={cx('previewItem')}>
                                                        <img 
                                                            src={URL.createObjectURL(file)} 
                                                            alt={`Preview ${index + 1}`}
                                                            className={cx('previewImage')}
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className={cx('removeImageBtn')}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
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
                                disabled={isLoading} 
                                className={cx('submitBtn', { loading: isLoading })}
                            >
                                {isLoading ? (
                                    <>
                                        <div className={cx('spinner')}></div>
                                        Đang tạo workspace...
                                    </>
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