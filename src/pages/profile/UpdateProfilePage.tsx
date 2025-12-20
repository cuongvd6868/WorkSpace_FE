import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCamera, 
  faUser, 
  faPhone, 
  faEnvelope, 
  faCalendarAlt, 
  faCheckCircle,
  faSave,
  faSpinner,
  faIdCard,
  faUserEdit,
  faPen
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import styles from './UpdateProfilePage.module.scss';
import { useAuth } from "~/context/useAuth";
import { updateProfile } from "~/services/ProfileService";
import { UpdateProfileRequest } from "~/types/Profile";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

const UpdateProfilePage: React.FC = () => {
    const { user, token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        dateOfBirth: "",
        avatar: "" 
    });
    
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (user) {
            console.log("Đang chỉnh sửa hồ sơ cho:", user.email);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!token) {
            toast.error("Phiên làm việc hết hạn.");
            return;
        }

        setLoading(true);
        try {
            const payload: UpdateProfileRequest = {
                ...formData,
                dateOfBirth: formData.dateOfBirth 
                    ? new Date(formData.dateOfBirth).toISOString() 
                    : new Date().toISOString()
            };

            await updateProfile({ profileData: payload, avatarFile: selectedFile }, token);
            toast.success("Cập nhật thông tin thành công!");
        } catch (error: any) {
            toast.error(error.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                {/* Header với thiết kế đẹp hơn */}
                <div className={cx('header')}>
                    <div className={cx('header-content')}>
                        <div className={cx('header-icon')}>
                            <FontAwesomeIcon icon={faUserEdit} />
                        </div>
                        <div>
                            <h1 className={cx('title')}>Cập Nhật Hồ Sơ</h1>
                            <p className={cx('subtitle')}>Cập nhật hồ sơ của bạn để trải nghiệm dịch vụ tốt hơn</p>
                        </div>
                    </div>
                </div>

                <div className={cx('content')}>
                    {/* Left Panel - Avatar Section */}
                    <div className={cx('left-panel')}>
                        <div className={cx('profile-card')}>
                            <div className={cx('avatar-section')}>
                                <div 
                                    className={cx('avatar-wrapper')}
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                >
                                    <img 
                                        src={avatarPreview || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"} 
                                        alt="Profile" 
                                        className={cx('avatar-img')}
                                    />
                                    
                                    <div className={cx('avatar-overlay', { 'active': isHovering })}>
                                        <button 
                                            className={cx('upload-btn')} 
                                            onClick={() => fileInputRef.current?.click()}
                                            title="Đổi ảnh đại diện"
                                        >
                                            <FontAwesomeIcon icon={faCamera} />
                                        </button>
                                    </div>
                                    
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*"/>
                                </div>
                                
                                <div className={cx('user-info')}>
                                    <h3 className={cx('username')}>
                                        <FontAwesomeIcon icon={faUser} />
                                        {user?.email.split('@')[0]}
                                    </h3>
                                    <div className={cx('status')}>
                                        <span className={cx('email-text')}>{user?.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Form Section */}
                    <div className={cx('right-panel')}>
                        <div className={cx('form-card')}>
                            <div className={cx('form-section')}>
                                {/* Form Grid với 2 cột */}
                                <div className={cx('input-grid')}>
                                    <div className={cx('input-group')}>
                                        <label className={cx('input-label')}>
                                            <FontAwesomeIcon icon={faUser} className={cx('label-icon')} />
                                            Họ
                                        </label>
                                        <div className={cx('input-wrapper')}>
                                            <input 
                                                name="lastName" 
                                                value={formData.lastName} 
                                                onChange={handleInputChange} 
                                                type="text" 
                                                placeholder="Nhập họ..." 
                                                className={cx('form-input')}
                                            />
                                            <FontAwesomeIcon icon={faPen} className={cx('input-icon')} />
                                        </div>
                                    </div>
                                    
                                    <div className={cx('input-group')}>
                                        <label className={cx('input-label')}>
                                            <FontAwesomeIcon icon={faUser} className={cx('label-icon')} />
                                            Tên
                                        </label>
                                        <div className={cx('input-wrapper')}>
                                            <input 
                                                name="firstName" 
                                                value={formData.firstName} 
                                                onChange={handleInputChange} 
                                                type="text" 
                                                placeholder="Nhập tên..." 
                                                className={cx('form-input')}
                                            />
                                            <FontAwesomeIcon icon={faPen} className={cx('input-icon')} />
                                        </div>
                                    </div>
                                </div>

                                {/* Email field - không thay đổi */}
                                <div className={cx('input-group')}>
                                    <label className={cx('input-label')}>
                                        <FontAwesomeIcon icon={faEnvelope} className={cx('label-icon')} />
                                        Email
                                    </label>
                                    <div className={cx('input-wrapper')}>
                                        <input 
                                            type="email" 
                                            value={user?.email || ""} 
                                            disabled 
                                            className={cx('form-input', 'disabled')}
                                        />
                                        <div className={cx('input-note')}>
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                            <span>Email đã xác thực</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone field */}
                                <div className={cx('input-group')}>
                                    <label className={cx('input-label')}>
                                        <FontAwesomeIcon icon={faPhone} className={cx('label-icon')} />
                                        Số điện thoại
                                    </label>
                                    <div className={cx('input-wrapper')}>
                                        <input 
                                            name="phoneNumber" 
                                            value={formData.phoneNumber} 
                                            onChange={handleInputChange} 
                                            type="text" 
                                            placeholder="09xx xxx xxx" 
                                            className={cx('form-input')}
                                        />
                                        <FontAwesomeIcon icon={faPhone} className={cx('input-icon')} />
                                    </div>
                                </div>

                                {/* Date of Birth field */}
                                <div className={cx('input-group')}>
                                    <label className={cx('input-label')}>
                                        <FontAwesomeIcon icon={faCalendarAlt} className={cx('label-icon')} />
                                        Ngày sinh
                                    </label>
                                    <div className={cx('input-wrapper')}>
                                        <input 
                                            name="dateOfBirth" 
                                            value={formData.dateOfBirth} 
                                            onChange={handleInputChange} 
                                            type="date" 
                                            className={cx('form-input')}
                                        />
                                        <FontAwesomeIcon icon={faCalendarAlt} className={cx('input-icon')} />
                                    </div>
                                </div>
                                <div className={cx('change-password')}>
                                    <Link to={'/change-password'}>
                                            Đổi mật khẩu
                                    </Link>
                                    
                                </div>

                                {/* Save button */}
                                <div className={cx('actions')}>
                                    <button 
                                        className={cx('save-btn', { 'loading': loading })} 
                                        onClick={handleSave} 
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} spin />
                                                <span>Đang xử lý...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faSave} />
                                                <span>Lưu thay đổi</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    <div className={cx('form-footer')}>
                                        <p>
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                            <span>Thông tin sẽ được cập nhật ngay lập tức</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdateProfilePage;