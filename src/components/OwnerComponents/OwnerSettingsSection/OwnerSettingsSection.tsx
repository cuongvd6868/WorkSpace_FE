import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./OwnerSettingsSection.module.scss";
import { toast } from "react-toastify";
import { 
    Loader2, Camera, Save, Building2, Phone, 
    Globe, FileText, CheckCircle2, AlertCircle 
} from "lucide-react";
import { getHostProfileMe, updateHostProfile } from "~/services/HostProfileService";
import { HostProfileView } from "~/types/HostProfile";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";

const cx = classNames.bind(styles);

const OwnerSettingsSection: React.FC = () => {
    const [profile, setProfile] = useState<HostProfileView | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const token = localStorage.getItem('token') || '';

    const [avatarFile, setAvatarFile] = useState<File | undefined>();
    const [coverFile, setCoverFile] = useState<File | undefined>();
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [coverPreview, setCoverPreview] = useState<string>("");

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const data = await getHostProfileMe(token);
            setProfile(data);
            if (data.avatar) setAvatarPreview(`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${data.avatar}`);
            if (data.coverPhoto) setCoverPreview(`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${data.coverPhoto}`);
        } catch (error) {
            toast.error("Không thể tải thông tin hồ sơ.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'avatar') {
                setAvatarFile(file);
                setAvatarPreview(url);
            } else {
                setCoverFile(file);
                setCoverPreview(url);
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        try {
            setIsUpdating(true);
            await updateHostProfile({
                id: profile.id,
                profileData: profile,
                avatarFile,
                coverPhotoFile: coverFile
            }, token);
            toast.success("Hồ sơ đã được cập nhật thành công!");
            setAvatarFile(undefined);
            setCoverFile(undefined);
            fetchProfile();
        } catch (error: any) {
            toast.error(error.message || "Cập nhật thất bại.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return (
        <div className={cx('loading-state')}>
            <Loader2 className={cx('spinner')} size={48} />
            <p>Đang đồng bộ dữ liệu hệ thống...</p>
        </div>
    );

    return (
        <div className={cx('premium-settings')}>
            <form onSubmit={handleUpdate} className={cx('main-form')}>
                
                {/* Visual Identity Section */}
                <section className={cx('hero-card')}>
                    <div 
                        className={cx('cover-wrapper')} 
                        style={{ backgroundImage: `url(${coverPreview || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80'})` }}
                    >
                        <div className={cx('overlay')} />
                        <label className={cx('edit-cover')}>
                            <Camera size={18} />
                            <span>Thay đổi ảnh bìa</span>
                            <input type="file" hidden onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />
                        </label>
                    </div>

                    <div className={cx('profile-meta')}>
                        <div className={cx('avatar-outer')}>
                            <div className={cx('avatar-inner')}>
                                <img src={avatarPreview || 'https://via.placeholder.com/150'} alt="Host Avatar" />
                                <label className={cx('edit-avatar')}>
                                    <Camera size={16} />
                                    <input type="file" hidden onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" />
                                </label>
                            </div>
                        </div>
                        <div className={cx('title-group')}>
                            <h3>{profile?.companyName || 'Tên thương hiệu của bạn'}</h3>
                            <p className={cx('status')}><CheckCircle2 size={14} /> Đối tác đã xác thực</p>
                        </div>
                    </div>
                </section>

                <div className={cx('content-grid')}>
                    {/* Left Column: Information */}
                    <div className={cx('info-column')}>
                        <div className={cx('glass-card')}>
                            <div className={cx('card-header')}>
                                <Building2 size={20} />
                                <h4>Thông tin định danh</h4>
                            </div>
                            <div className={cx('card-body')}>
                                <div className={cx('input-box')}>
                                    <label>Tên Công Ty / Thương Hiệu</label>
                                    <input 
                                        type="text" 
                                        value={profile?.companyName || ''} 
                                        onChange={e => setProfile(prev => prev ? {...prev, companyName: e.target.value} : null)}
                                        placeholder="Ví dụ: Creative Hub Vietnam"
                                    />
                                </div>
                                <div className={cx('row')}>
                                    <div className={cx('input-box')}>
                                        <label>Số điện thoại</label>
                                        <input 
                                            type="text" 
                                            value={profile?.contactPhone || ''} 
                                            onChange={e => setProfile(prev => prev ? {...prev, contactPhone: e.target.value} : null)}
                                        />
                                    </div>
                                    <div className={cx('input-box')}>
                                        <label>Website</label>
                                        <input 
                                            type="url" 
                                            value={profile?.websiteUrl || ''} 
                                            onChange={e => setProfile(prev => prev ? {...prev, websiteUrl: e.target.value} : null)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

<div className={cx('glass-card')}>
    <div className={cx('card-header')}>
        <FileText size={20} />
        <h4>Mô tả doanh nghiệp</h4>
    </div>
    <div className={cx('card-body')}>
        <div className={cx('textarea-wrapper')}>
            <textarea 
                rows={6}
                value={profile?.description || ''} 
                onChange={e => setProfile(prev => prev ? {...prev, description: e.target.value} : null)}
                placeholder="Chia sẻ câu chuyện, giá trị cốt lõi và những tiện ích đặc biệt tại không gian của bạn để thu hút khách hàng..."
            />
            {/* Hiển thị số lượng ký tự để tăng tính chuyên nghiệp */}
            <div className={cx('char-counter')}>
                {profile?.description?.length || 0} ký tự
            </div>
        </div>
    </div>
</div>
                    </div>

                    {/* Right Column: Sidebar Actions */}
                    <div className={cx('side-column')}>
                        <div className={cx('sticky-panel')}>
                            <div className={cx('status-card')}>
                                <h5>Trạng thái hồ sơ</h5>
                                <div className={cx('progress-bar')}><div style={{width: '85%'}} /></div>
                                <p>Hồ sơ đạt 85% độ tin cậy</p>
                            </div>
                            
                            <button type="submit" className={cx('prime-btn')} disabled={isUpdating}>
                                {isUpdating ? (
                                    <><Loader2 className={cx('spinner')} size={20} /> Đang lưu...</>
                                ) : (
                                    <><Save size={20} /> Xuất bản thay đổi</>
                                )}
                            </button>
                            
                            <div className={cx('tip-box')}>
                                <AlertCircle size={18} />
                                <p>Hình ảnh chất lượng cao giúp tăng 40% tỷ lệ đặt phòng khách hàng.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default OwnerSettingsSection;