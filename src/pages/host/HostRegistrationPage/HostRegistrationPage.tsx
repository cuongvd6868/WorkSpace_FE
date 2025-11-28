import React, { useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from './HostRegistrationPage.module.scss';
import { saveHostProfile } from '~/services/HostProfileService'; 
import { HostProfileData } from '~/types/HostProfile'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from "~/context/useAuth";
import { toast } from "react-toastify";
import { faHandshake } from "@fortawesome/free-solid-svg-icons";
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
    const {isLoggedIn} = useAuth()
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState<HostProfileData>(initialProfileData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const logoFileRef = useRef<HTMLInputElement>(null);
    const avatarFileRef = useRef<HTMLInputElement>(null);
    const coverFileRef = useRef<HTMLInputElement>(null);
    
    const authToken = localStorage.getItem('token') || '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        setError(null);
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
            toast.success('Đăng ký Host thành công! Bạn sẽ được hệ thống liên hệ xác nhận lại')

        } catch (err: any) {
            console.error('Lỗi khi đăng ký Host:', err);
            setError(err.message || 'Có lỗi xảy ra khi đăng ký Host. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('register-container')}>
                <div className={cx('header')}>
                    <div className={cx('title-container')}>
                        <FontAwesomeIcon icon={faHandshake}  className={cx('title-icon')}/>
                        <h2 className={cx('title')}>Đăng Ký Để trở thành đối tác của chúng tôi</h2>
                    </div>
                    <p className={cx('subtitle')}>Vui lòng cung cấp đầy đủ thông tin để xét duyệt trở thành đối tác chính thức của chúng tôi. Sau khi được phê duyệt, tài khoản của bạn sẽ được nâng cấp lên chế độ Owner Dashboard.</p>
                </div>
                
                {error && <p className={cx('error-message')}>{error}</p>}
                
                <form onSubmit={handleSubmit} className={cx('form')}>
                    
                    {/* KHỐI THÔNG TIN CƠ BẢN */}
                    <fieldset className={cx('fieldset')}>
                        <legend className={cx('legend')}>Thông tin Cơ bản</legend>
                        
                        <div className={cx('form-row')}>
                            <div className={cx('form-control', 'flex-2')}>
                                <label htmlFor="companyName">Tên Công ty/Host <span className={cx('required')}>*</span></label>
                                <input 
                                    id="companyName"
                                    name="companyName" 
                                    placeholder="Tên tổ chức hoặc cá nhân đại diện" 
                                    value={profileData.companyName} 
                                    onChange={handleChange} 
                                    required 
                                    className={cx('input-field')} 
                                />
                            </div>

                            <div className={cx('form-control', 'flex-1')}>
                                <label htmlFor="contactPhone">Số điện thoại liên hệ <span className={cx('required')}>*</span></label>
                                <input 
                                    id="contactPhone"
                                    name="contactPhone" 
                                    type="tel" 
                                    placeholder="Ví dụ: 0901234567" 
                                    value={profileData.contactPhone} 
                                    onChange={handleChange} 
                                    required 
                                    className={cx('input-field')} // <--- CLASS MỚI ĐƯỢC THÊM
                                />
                            </div>
                        </div>

                        <div className={cx('form-control')}>
                            <label htmlFor="websiteUrl">Địa chỉ Website (Tùy chọn)</label>
                            <input 
                                id="websiteUrl"
                                name="websiteUrl" 
                                type="url" 
                                placeholder="https://yourcompany.com" 
                                value={profileData.websiteUrl} 
                                onChange={handleChange} 
                                className={cx('input-field')} 
                            />
                        </div>

                        <div className={cx('form-control')}>
                            <label htmlFor="description">Mô tả về Host/Dịch vụ (Tối đa 500 ký tự)</label>
                            <textarea 
                                id="description"
                                name="description" 
                                placeholder="Tóm tắt ngắn gọn các dịch vụ và điểm mạnh của bạn..." 
                                value={profileData.description} 
                                onChange={handleChange} 
                                rows={4}
                                maxLength={500}
                                className={cx('input-field', 'textarea-field')} // <--- CLASS MỚI ĐƯỢC THÊM
                            />
                        </div>
                    </fieldset>

                    {/* KHỐI THÔNG TIN HÌNH ẢNH */}
                    <fieldset className={cx('fieldset')}>
                        <legend className={cx('legend')}>Tài sản Hình ảnh</legend>
                        <p className={cx('asset-note')}>Sử dụng hình ảnh chất lượng cao để xây dựng thương hiệu. Định dạng tối ưu: PNG hoặc JPEG.</p>

                        <div className={cx('file-row')}>
                            
                            {/* Input Avatar */}
                            <div className={cx('file-control')}>
                                <label htmlFor="avatarFile" className={cx('file-label')}>Ảnh đại diện Host (Tối ưu: 1:1)</label>
                                <div className={cx('file-upload-box')}>
                                    <input 
                                        id="avatarFile"
                                        type="file" 
                                        ref={avatarFileRef} 
                                        accept="image/png, image/jpeg" 
                                        className={cx('file-input')}
                                    />
                                    <span className={cx('file-placeholder')}>
                                        Tải lên Avatar...
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Input Cover Photo */}
                        <div className={cx('form-control')}>
                            <label htmlFor="coverPhotoFile">Ảnh bìa (Cover Photo) <span className={cx('note')}>(Tối ưu: 16:9)</span></label>
                            <div className={cx('file-upload-box', 'full-width')}>
                                <input 
                                    id="coverPhotoFile"
                                    type="file" 
                                    ref={coverFileRef} 
                                    accept="image/png, image/jpeg" 
                                    className={cx('file-input')}
                                />
                                <span className={cx('file-placeholder')}>
                                    Tải lên Ảnh bìa...
                                </span>
                            </div>
                        </div>
                    </fieldset>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className={cx('submit-button')}
                    >
                        {isLoading ? 'Đang gửi hồ sơ và upload ảnh...' : 'Xác nhận và Hoàn tất Đăng ký'}
                        {isLoading && <span className={cx('spinner')}></span>}
                    </button>
                    
                    <p className={cx('footer-note')}>
                        Chúng tôi cam kết bảo mật thông tin kinh doanh của bạn.
                    </p>
                </form>
            </div>
        </div>
    );
}

export default HostRegistrationPage;