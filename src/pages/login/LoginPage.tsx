import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './LoginPage.module.scss'; 
import { useAuth } from '~/context/useAuth'; 
import { toast } from 'react-toastify'; 
import NavbarLogin from '~/components/NavbarLogin/NavbarLogin';
import logImg from '~/assets/img/login/log.svg';
import resImg from '~/assets/img/login/register.svg';
import { useGoogleLogin } from '@react-oauth/google';
import { forgotPassword } from '~/services/ProfileService';
import { registerAPI } from '~/services/AuthService'; 

const cx = classNames.bind(styles);

const LoginPage: React.FC = () => {
    const { loginUser, googleLogin } = useAuth();
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    
    // State quản lý trạng thái loading chung cho toàn trang
    const [isLoading, setIsLoading] = useState(false);

    // State cho form đăng nhập
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // State cho form đăng ký
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');

    // Xử lý Đăng nhập Google
    const googleAuth = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                if (tokenResponse.code) {
                    await googleLogin(tokenResponse.code);
                } else {
                    toast.error("Không thể lấy authorization code từ Google.");
                }
            } catch (error) {
                console.error('Google Login Failed:', error);
                toast.error("Đăng nhập Google thất bại.");
            } finally {
                setIsLoading(false);
            }
        },
        onError: (errorResponse) => {
            console.error('Google Login Failed:', errorResponse);
            toast.error("Đăng nhập Google thất bại.");
            setIsLoading(false);
        },
        flow: 'auth-code',
        scope: 'openid profile email',
    });

    // Xử lý Quên mật khẩu
    const handleForgetPassword = async () => {
        if (!loginEmail) {
            toast.error("Vui lòng nhập Email của bạn vào ô đăng nhập để lấy lại mật khẩu.");
            return;
        }

        setIsLoading(true);
        try {
            const message = await forgotPassword({ email: loginEmail });
            toast.success(message);
        } catch (error: any) {
            toast.error(error.message || "Gửi yêu cầu thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý Submit Đăng nhập
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) {
            toast.error("Vui lòng nhập email và mật khẩu.");
            return;
        }

        setIsLoading(true);
        try {
            await loginUser(loginEmail, loginPassword);
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const validateRegister = () => {
    // Check trống
    if (!registerUsername || !registerEmail || !registerPassword || !registerPasswordConfirm) {
        toast.error("Vui lòng điền đầy đủ thông tin.");
        return false;
    }
    // Email max 256 ký tự
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail) || registerEmail.length > 256) {
        toast.error("Email không hợp lệ hoặc quá dài (tối đa 256 ký tự).");
        return false;
    }
    // Username từ 6-50 ký tự
    if (registerUsername.length < 6 || registerUsername.length > 50) {
        toast.error("Tên đăng nhập phải từ 6 đến 50 ký tự.");
        return false;
    }
    // Password từ 6-100 ký tự & đúng định dạng BE yêu cầu
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,100}$/;
    if (!passwordRegex.test(registerPassword)) {
        toast.error("Mật khẩu phải từ 6-100 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.");
        return false;
    }
    // Khớp mật khẩu
    if (registerPassword !== registerPasswordConfirm) {
        toast.error("Mật khẩu xác nhận không khớp.");
        return false;
    }
    return true;
};

    // Xử lý Submit Đăng ký
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateRegister()) return;
        
        if (!registerUsername || !registerEmail || !registerPassword || !registerPasswordConfirm) {
            toast.error("Vui lòng điền đầy đủ tất cả các trường.");
            return;
        }
        if (registerPassword !== registerPasswordConfirm) {
            toast.error("Mật khẩu xác nhận không khớp.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await registerAPI(registerEmail, registerUsername, registerPassword, registerPasswordConfirm);
            
            if (res && res.status === 200) {
                toast.success("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.", {
                    autoClose: 5000 
                });
                setIsSignUpMode(false);
                // Reset form
                setRegisterUsername('');
                setRegisterEmail('');
                setRegisterPassword('');
                setRegisterPasswordConfirm('');
            }
        } catch (error) {
            console.error("Register failed:", error);
            const msg: any = error || "Đăng ký thất bại.";
            toast.error(msg)
        } finally {
            setIsLoading(false);
        }
    };

    

    return (
        <div className={cx('wrapper')}>
            <NavbarLogin/>
            <div className={cx('container', { 'sign-up-mode': isSignUpMode })}>
                <div className={cx('forms-container')}>
                    <div className={cx('signin-signup')}>
                        
                        {/* Form Đăng Nhập */}
                        <form className={cx('sign-in-form')} onSubmit={handleLoginSubmit}>
                            <h2 className={cx('title')}>Đăng Nhập</h2>
                            <div className={cx('input-field')}>
                                <i className="fas fa-envelope"></i>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className={cx('input-field')}>
                                <i className="fas fa-lock"></i>
                                <input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className={cx('btn', 'solid', { 'btn-disabled': isLoading })} 
                                disabled={isLoading}
                            >
                                {isLoading ? <div className={cx('loader')}></div> : "Đăng nhập"}
                            </button>
                            
                            <p className={cx('social-text')}>Hoặc đăng nhập với</p>
                            <div className={cx('social-media')}>
                                <button 
                                    type="button"
                                    className={cx('google-custom-button', { 'btn-disabled': isLoading })}
                                    onClick={() => !isLoading && googleAuth()}
                                    disabled={isLoading}
                                >
                                    <img 
                                        src="https://www.svgrepo.com/show/475656/google-color.svg" 
                                        alt="Google" 
                                        className={cx('google-icon')}
                                    />
                                    {isLoading ? "Đang xử lý..." : "Đăng nhập với Google"}
                                </button>
                            </div>
                            <div className={cx('password-service')}>
                                <p 
                                    className={cx('forget-password')} 
                                    onClick={!isLoading ? handleForgetPassword : undefined}
                                    style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                                >
                                    Quên mật khẩu?
                                </p>
                            </div>
                        </form>

                        {/* Form Đăng Ký */}
                        <form className={cx('sign-up-form')} onSubmit={handleRegisterSubmit}>
                            <h2 className={cx('title')}>Đăng Ký</h2>
                            <div className={cx('input-field')}>
                                <i className="fas fa-user"></i>
                                <input
                                    type="text"
                                    placeholder="Tên đăng nhập"
                                    value={registerUsername}
                                    onChange={(e) => setRegisterUsername(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className={cx('input-field')}>
                                <i className="fas fa-envelope"></i>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className={cx('input-field')}>
                                <i className="fas fa-lock"></i>
                                <input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className={cx('input-field')}>
                                <i className="fas fa-lock"></i>
                                <input
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={registerPasswordConfirm}
                                    onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className={cx('btn', { 'btn-disabled': isLoading })} 
                                disabled={isLoading}
                            >
                                {isLoading ? <div className={cx('loader')}></div> : "Đăng ký"}
                            </button>

                            <div className={cx('social-media')}>
                                <button 
                                    type="button"
                                    className={cx('google-custom-button', { 'btn-disabled': isLoading })}
                                    onClick={() => !isLoading && googleAuth()}
                                    disabled={isLoading}
                                >
                                    <img 
                                        src="https://www.svgrepo.com/show/475656/google-color.svg" 
                                        alt="Google" 
                                        className={cx('google-icon')}
                                    />
                                    Đăng nhập với Google
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className={cx('panels-container')}>
                    <div className={cx('panel', 'left-panel')}>
                        <div className={cx('content')}>
                            <h3>Bạn là người mới ?</h3>
                            <p>Hãy đăng ký để nhận được nhiều ưu đãi từ CSB!</p>
                            <button
                                className={cx('btn', 'transparent')}
                                onClick={() => !isLoading && setIsSignUpMode(true)}
                                disabled={isLoading}
                            >
                                Đăng ký
                            </button>
                        </div>
                        <img src={logImg} className={cx('image')} alt="Login illustration" />
                    </div>
                    <div className={cx('panel', 'right-panel')}>
                        <div className={cx('content')}>
                            <h3>Bạn là khách hàng của CSB?</h3>
                            <p>Nếu bạn đã có tài khoản, click vào đây để đăng nhập!</p>
                            <button
                                className={cx('btn', 'transparent')}
                                onClick={() => !isLoading && setIsSignUpMode(false)}
                                disabled={isLoading}
                            >
                                Đăng nhập
                            </button>
                        </div>
                        <img src={resImg} className={cx('image')} alt="Register illustration" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;