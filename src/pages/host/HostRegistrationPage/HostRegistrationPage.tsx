import React, { useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from './HostRegistrationPage.module.scss';
import { saveHostProfile } from '~/services/HostProfileService'; 
import { HostProfileData } from '~/types/HostProfile'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from "~/context/useAuth";
import { toast } from "react-toastify";
import { 
    faHandshake, 
    faBuilding, 
    faPhone, 
    faGlobe, 
    faFileAlt, 
    faImage, 
    faUpload,
    faCamera,
    faCheckCircle,
    faLock
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const cx = classNames.bind(styles);

const initialProfileData: HostProfileData = {
    companyName: '',
    description: '',
    contactPhone: '',
    websiteUrl: '',
    logoUrl: '',
    avatar: '',
    coverPhoto: '',
};

const HostRegistrationPage: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState<HostProfileData>(initialProfileData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const logoFileRef = useRef<HTMLInputElement>(null);
    const avatarFileRef = useRef<HTMLInputElement>(null);
    const coverFileRef = useRef<HTMLInputElement>(null);
    
    const authToken = localStorage.getItem('token') || '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!isLoggedIn) {
            setError('Bạn cần đăng nhập để đăng ký Host. Vui lòng đăng nhập lại.');
            return;
        }
        
        if (!profileData.companyName.trim()) {
            setError('Tên công ty không được để trống.');
            return;
        }

        setIsLoading(true);

        try {
            const avatarFile = avatarFileRef.current?.files?.[0];
            const coverPhotoFile = coverFileRef.current?.files?.[0];

            const result = await saveHostProfile(
                { 
                    profileData, 
                    avatarFile, 
                    coverPhotoFile 
                }, 
                authToken
            );
            
            console.log('API Response:', result);

            navigate('/host-register');
            toast.success('Đăng ký Host thành công! Bạn sẽ được hệ thống liên hệ xác nhận lại');

        } catch (err: any) {
            console.error('Lỗi khi đăng ký Host:', err);
            setError(err.message || 'Có lỗi xảy ra khi đăng ký Host. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cx('page-container')}>
            {/* Hero Section */}
            {/* <div className={cx('hero-section')}>
                <div className={cx('hero-overlay')}>
                    <div className={cx('hero-content')}>
                        <div className={cx('hero-icon')}>
                            <FontAwesomeIcon icon={faHandshake} />
                        </div>
                        <h1 className={cx('hero-title')}>
                            Trở Thành Đối Tác Chính Thức
                        </h1>
                        <p className={cx('hero-subtitle')}>
                            Khám phá cơ hội hợp tác và phát triển cùng chúng tôi
                        </p>
                    </div>
                </div>
            </div> */}

            <div className={cx('registration-container')}>
                <div className={cx('registration-card')}>
                    {/* Progress Steps */}
                    <div className={cx('progress-steps')}>
                        <div className={cx('step', 'step-active')}>
                            <div className={cx('step-number')}>1</div>
                            <div className={cx('step-label')}>Thông tin cơ bản</div>
                        </div>
                        <div className={cx('step-divider')}></div>
                        <div className={cx('step')}>
                            <div className={cx('step-number')}>2</div>
                            <div className={cx('step-label')}>Hình ảnh</div>
                        </div>
                        <div className={cx('step-divider')}></div>
                        <div className={cx('step')}>
                            <div className={cx('step-number')}>3</div>
                            <div className={cx('step-label')}>Xác nhận</div>
                        </div>
                    </div>

                    {/* Registration Header */}
                    <div className={cx('registration-header')}>
                        <div className={cx('header-content')}>
                            <h2 className={cx('registration-title')}>
                                <FontAwesomeIcon icon={faHandshake} className={cx('title-icon')}/>
                                Đăng Ký Hồ Sơ Đối Tác
                            </h2>
                            <p className={cx('registration-subtitle')}>
                                Vui lòng cung cấp đầy đủ thông tin để xét duyệt trở thành đối tác chính thức.
                                Sau khi được phê duyệt, tài khoản của bạn sẽ được nâng cấp lên chế độ Owner Dashboard.
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={cx('error-banner')}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={cx('registration-form')}>
                        {/* Basic Information Section */}
                        <div className={cx('form-section')}>
                            <div className={cx('section-header')}>
                                <div className={cx('section-icon')}>
                                    <FontAwesomeIcon icon={faBuilding} />
                                </div>
                                <h3 className={cx('section-title')}>Thông tin Cơ bản</h3>
                            </div>
                            
                            <div className={cx('form-grid')}>
                                <div className={cx('form-group', 'col-span-2')}>
                                    <label className={cx('form-label')}>
                                        <FontAwesomeIcon icon={faBuilding} className={cx('label-icon')} />
                                        Tên Công ty/Host <span className={cx('required')}>*</span>
                                    </label>
                                    <div className={cx('input-wrapper')}>
                                        <input 
                                            id="companyName"
                                            name="companyName" 
                                            placeholder="Nhập tên tổ chức hoặc cá nhân đại diện..." 
                                            value={profileData.companyName} 
                                            onChange={handleChange} 
                                            required 
                                            className={cx('form-input')}
                                        />
                                        <div className={cx('input-underline')}></div>
                                    </div>
                                </div>

                                <div className={cx('form-group')}>
                                    <label className={cx('form-label')}>
                                        <FontAwesomeIcon icon={faPhone} className={cx('label-icon')} />
                                        Số điện thoại liên hệ <span className={cx('required')}>*</span>
                                    </label>
                                    <div className={cx('input-wrapper')}>
                                        <input 
                                            id="contactPhone"
                                            name="contactPhone" 
                                            type="tel" 
                                            placeholder="Ví dụ: 0901234567" 
                                            value={profileData.contactPhone} 
                                            onChange={handleChange} 
                                            required 
                                            className={cx('form-input')}
                                        />
                                        <div className={cx('input-underline')}></div>
                                    </div>
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label className={cx('form-label')}>
                                    <FontAwesomeIcon icon={faGlobe} className={cx('label-icon')} />
                                    Địa chỉ Website
                                </label>
                                <div className={cx('input-wrapper')}>
                                    <input 
                                        id="websiteUrl"
                                        name="websiteUrl" 
                                        type="url" 
                                        placeholder="https://yourcompany.com" 
                                        value={profileData.websiteUrl} 
                                        onChange={handleChange} 
                                        className={cx('form-input')}
                                    />
                                    <div className={cx('input-underline')}></div>
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label className={cx('form-label')}>
                                    <FontAwesomeIcon icon={faFileAlt} className={cx('label-icon')} />
                                    Mô tả về Host/Dịch vụ
                                </label>
                                <div className={cx('textarea-wrapper')}>
                                    <textarea 
                                        id="description"
                                        name="description" 
                                        placeholder="Mô tả ngắn gọn về dịch vụ, điểm mạnh và giá trị bạn mang lại..." 
                                        value={profileData.description} 
                                        onChange={handleChange} 
                                        rows={4}
                                        maxLength={500}
                                        className={cx('form-textarea')}
                                    />
                                    <div className={cx('character-count')}>
                                        {profileData.description.length}/500 ký tự
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className={cx('form-section')}>
                            <div className={cx('section-header')}>
                                <div className={cx('section-icon')}>
                                    <FontAwesomeIcon icon={faImage} />
                                </div>
                                <h3 className={cx('section-title')}>Tài sản Hình ảnh</h3>
                            </div>
                            
                            <p className={cx('section-description')}>
                                Sử dụng hình ảnh chất lượng cao để xây dựng thương hiệu chuyên nghiệp.
                                Định dạng tối ưu: PNG hoặc JPEG.
                            </p>

                            <div className={cx('image-grid')}>
                                {/* Avatar Upload */}
                                <div className={cx('image-upload-card')}>
                                    <label className={cx('upload-label')}>
                                        <div className={cx('upload-header')}>
                                            <FontAwesomeIcon icon={faCamera} className={cx('upload-icon')} />
                                            <span>Ảnh đại diện Host</span>
                                        </div>
                                        <div className={cx('upload-info')}>
                                            <span className={cx('upload-ratio')}>Tối ưu: 1:1</span>
                                            <span className={cx('upload-formats')}>PNG, JPEG</span>
                                        </div>
                                    </label>
                                    
                                    <div className={cx('upload-area')}>
                                        <input 
                                            id="avatarFile"
                                            type="file" 
                                            ref={avatarFileRef} 
                                            accept="image/png, image/jpeg" 
                                            onChange={handleAvatarChange}
                                            className={cx('file-input')}
                                        />
                                        {avatarPreview ? (
                                            <div className={cx('image-preview')}>
                                                <img 
                                                    src={avatarPreview} 
                                                    alt="Avatar preview" 
                                                    className={cx('preview-image')}
                                                />
                                                <div className={cx('preview-overlay')}>
                                                    <FontAwesomeIcon icon={faUpload} />
                                                    <span>Thay đổi ảnh</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={cx('upload-placeholder')}>
                                                <FontAwesomeIcon icon={faUpload} className={cx('placeholder-icon')} />
                                                <span className={cx('placeholder-text')}>Kéo thả hoặc click để tải lên</span>
                                                <span className={cx('placeholder-subtext')}>Kích thước tối đa: 5MB</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Cover Photo Upload */}
                                <div className={cx('image-upload-card', 'wide')}>
                                    <label className={cx('upload-label')}>
                                        <div className={cx('upload-header')}>
                                            <FontAwesomeIcon icon={faImage} className={cx('upload-icon')} />
                                            <span>Ảnh bìa (Cover Photo)</span>
                                        </div>
                                        <div className={cx('upload-info')}>
                                            <span className={cx('upload-ratio')}>Tối ưu: 16:9</span>
                                            <span className={cx('upload-formats')}>PNG, JPEG</span>
                                        </div>
                                    </label>
                                    
                                    <div className={cx('upload-area', 'wide')}>
                                        <input 
                                            id="coverPhotoFile"
                                            type="file" 
                                            ref={coverFileRef} 
                                            accept="image/png, image/jpeg" 
                                            onChange={handleCoverChange}
                                            className={cx('file-input')}
                                        />
                                        {coverPreview ? (
                                            <div className={cx('image-preview', 'wide')}>
                                                <img 
                                                    src={coverPreview} 
                                                    alt="Cover preview" 
                                                    className={cx('preview-image', 'wide')}
                                                />
                                                <div className={cx('preview-overlay')}>
                                                    <FontAwesomeIcon icon={faUpload} />
                                                    <span>Thay đổi ảnh</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={cx('upload-placeholder', 'wide')}>
                                                <FontAwesomeIcon icon={faUpload} className={cx('placeholder-icon')} />
                                                <span className={cx('placeholder-text')}>Kéo thả hoặc click để tải lên</span>
                                                <span className={cx('placeholder-subtext')}>Kích thước tối đa: 10MB</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Section */}
                        <div className={cx('submit-section')}>
                            <div className={cx('privacy-note')}>
                                <FontAwesomeIcon icon={faLock} className={cx('privacy-icon')} />
                                <span>
                                    Chúng tôi cam kết bảo mật thông tin kinh doanh của bạn. 
                                    Dữ liệu sẽ được mã hóa và chỉ sử dụng cho mục đích xác thực.
                                </span>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className={cx('submit-button', { loading: isLoading })}
                            >
                                {isLoading ? (
                                    <>
                                        <div className={cx('button-spinner')}></div>
                                        Đang gửi hồ sơ...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        Hoàn tất Đăng ký Đối tác
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

export default HostRegistrationPage;