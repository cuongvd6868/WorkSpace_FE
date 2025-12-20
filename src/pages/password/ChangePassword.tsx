import React, { useState } from "react";
import styles from './ChangePassword.module.scss';
import classNames from "classnames/bind";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Key,
  RefreshCw,
  ChevronRight
} from "lucide-react";

import { changePassword } from "~/services/ProfileService";
import { ChangePasswordRequest } from "~/types/Profile";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRequirements = [
    { id: 1, text: "8+ ký tự", regex: /.{8,}/ },
    { id: 2, text: "Chữ hoa", regex: /[A-Z]/ },
    { id: 3, text: "Chữ thường", regex: /[a-z]/ },
    { id: 4, text: "Số", regex: /[0-9]/ },
    { id: 5, text: "Ký tự đặc biệt", regex: /[!@#$%^&*(),.?":{}|<>]/ },
  ];

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    passwordRequirements.forEach(req => {
      if (req.regex.test(password)) strength++;
    });
    return strength;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Nhập mật khẩu hiện tại";
    }

    if (!newPassword) {
      newErrors.newPassword = "Nhập mật khẩu mới";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Tối thiểu 8 ký tự";
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- HÀM SUBMIT ĐÃ ĐƯỢC GẮN API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    const data: ChangePasswordRequest = {
      currentPassword,
      newPassword,
      confirmPassword
    };

    try {
      const message = await changePassword(data);
      toast.success(message);
      
      // Reset form khi thành công
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (error: any) {
      // Lỗi được xử lý qua handleError ở service
      toast.error(error.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = checkPasswordStrength(newPassword);
  const strengthPercentage = (passwordStrength / passwordRequirements.length) * 100;

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "#ef4444";
    if (passwordStrength <= 3) return "#f59e0b";
    return "#10b981";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Rất yếu";
    if (passwordStrength <= 2) return "Yếu";
    if (passwordStrength <= 3) return "Trung bình";
    if (passwordStrength <= 4) return "Mạnh";
    return "Rất mạnh";
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container')}>
        {/* Left Panel - Information */}
        <div className={cx('left-panel')}>
          <div className={cx('info-section')}>
            <div className={cx('icon-wrapper')}>
              <Shield size={40} className={cx('icon')} />
            </div>
            <h1 className={cx('title')}>
              Cập nhật <span className={cx('highlight')}>Mật khẩu</span>
            </h1>
            <p className={cx('subtitle')}>
              Tăng cường bảo mật tài khoản của bạn bằng mật khẩu mạnh và độc nhất
            </p>
            
            <div className={cx('features')}>
              <div className={cx('feature-item')}>
                <div className={cx('feature-icon')}>
                  <Key size={20} />
                </div>
                <div>
                  <h4>Bảo mật tối ưu</h4>
                  <p>Mã hóa AES-256 bit</p>
                </div>
              </div>
              
              <div className={cx('feature-item')}>
                <div className={cx('feature-icon')}>
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h4>Cập nhật tức thì</h4>
                  <p>Áp dụng ngay lập tức</p>
                </div>
              </div>
              
              <div className={cx('feature-item')}>
                <div className={cx('feature-icon')}>
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h4>Kiểm tra độ mạnh</h4>
                  <p>Đánh giá mật khẩu thời gian thực</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className={cx('security-tips')}>
            <h3 className={cx('tips-title')}>
              <AlertCircle size={18} />
              Mẹo bảo mật quan trọng
            </h3>
            <ul className={cx('tips-list')}>
              <li>
                <ChevronRight size={16} />
                <span>Không dùng mật khẩu cho nhiều tài khoản</span>
              </li>
              <li>
                <ChevronRight size={16} />
                <span>Kết hợp chữ, số và ký tự đặc biệt</span>
              </li>
              <li>
                <ChevronRight size={16} />
                <span>Thay đổi định kỳ 3 tháng/lần</span>
              </li>
              <li>
                <ChevronRight size={16} />
                <span>Sử dụng trình quản lý mật khẩu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className={cx('right-panel')}>
          <div className={cx('form-container')}>
            <div className={cx('form-header')}>
              <h2 className={cx('form-title')}>Đổi mật khẩu</h2>
              <p className={cx('form-subtitle')}>Nhập thông tin bên dưới để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit} className={cx('form')}>
              {/* Current Password */}
              <div className={cx('form-group', 'horizontal-group')}>
                <div className={cx('label-section')}>
                  <label htmlFor="currentPassword" className={cx('label')}>
                    <Lock size={16} />
                    <span>Mật khẩu hiện tại</span>
                  </label>
                  {errors.currentPassword && (
                    <div className={cx('error-message', 'compact')}>
                      <AlertCircle size={12} />
                      <span>{errors.currentPassword}</span>
                    </div>
                  )}
                </div>
                <div className={cx('input-section')}>
                  <div className={cx('input-wrapper')}>
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={cx('input', { 'error': errors.currentPassword })}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className={cx('toggle-button')}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* New Password */}
              <div className={cx('form-group', 'horizontal-group')}>
                <div className={cx('label-section')}>
                  <label htmlFor="newPassword" className={cx('label')}>
                    <Lock size={16} />
                    <span>Mật khẩu mới</span>
                  </label>
                  {errors.newPassword && (
                    <div className={cx('error-message', 'compact')}>
                      <AlertCircle size={12} />
                      <span>{errors.newPassword}</span>
                    </div>
                  )}
                </div>
                <div className={cx('input-section')}>
                  <div className={cx('input-wrapper')}>
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={cx('input', { 'error': errors.newPassword })}
                      placeholder="Mật khẩu mới"
                    />
                    <button
                      type="button"
                      className={cx('toggle-button')}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Password Strength */}
                  {newPassword && (
                    <div className={cx('strength-section')}>
                      <div className={cx('strength-info')}>
                        <span>Độ mạnh: </span>
                        <span
                          style={{ color: getStrengthColor() }}
                          className={cx('strength-text')}
                        >
                          {getStrengthText()}
                        </span>
                      </div>
                      <div className={cx('strength-bar')}>
                        <div
                          className={cx('strength-fill')}
                          style={{
                            width: `${strengthPercentage}%`,
                            backgroundColor: getStrengthColor(),
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className={cx('form-group', 'horizontal-group')}>
                <div className={cx('label-section')}>
                  <label htmlFor="confirmPassword" className={cx('label')}>
                    <Lock size={16} />
                    <span>Xác nhận mật khẩu</span>
                  </label>
                  {errors.confirmPassword && (
                    <div className={cx('error-message', 'compact')}>
                      <AlertCircle size={12} />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>
                <div className={cx('input-section')}>
                  <div className={cx('input-wrapper')}>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cx('input', { 'error': errors.confirmPassword })}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      className={cx('toggle-button')}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className={cx('requirements-grid')}>
                <p className={cx('requirements-title')}>Yêu cầu mật khẩu:</p>
                <div className={cx('requirements-badges')}>
                  {passwordRequirements.map((req) => {
                    const isMet = req.regex.test(newPassword);
                    return (
                      <div
                        key={req.id}
                        className={cx('requirement-badge', { 'met': isMet })}
                        title={req.text}
                      >
                        {isMet ? (
                          <CheckCircle size={14} />
                        ) : (
                          <div className={cx('badge-circle')} />
                        )}
                        <span>{req.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Actions */}
              <div className={cx('actions')}>
                <button
                  type="button"
                  className={cx('cancel-button')}
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setErrors({});
                  }}
                  disabled={isLoading}
                >
                  Đặt lại
                </button>
                <button
                  type="submit"
                  className={cx('submit-button')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className={cx('spinner')} />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Đổi mật khẩu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;