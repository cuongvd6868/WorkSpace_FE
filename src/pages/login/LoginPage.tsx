import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './LoginPage.module.scss'; 
import { useAuth } from '~/context/useAuth'; 
import { toast } from 'react-toastify'; 
import NavbarLogin from '~/components/NavbarLogin/NavbarLogin';
import logImg from '~/assets/img/login/log.svg';
import resImg from '~/assets/img/login/register.svg';
import { useGoogleLogin } from '@react-oauth/google';

import { registerAPI } from '~/services/AuthService'; 
import { Link } from 'react-router-dom';


const cx = classNames.bind(styles);

const LoginPage: React.FC = () => {
    // 2. Bỏ registerUser khỏi useAuth vì chúng ta sẽ tự xử lý
    const { loginUser, googleLogin } = useAuth();
    const [isSignUpMode, setIsSignUpMode] = useState(false);

    // State for login form
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // State for register form
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');

    // Custom Google Login - Sử dụng authorization code flow
    const googleAuth = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                console.log('Token response:', tokenResponse);
                if (tokenResponse.code) {
                    await googleLogin(tokenResponse.code);
                } else {
                    toast.error("Không thể lấy authorization code từ Google.");
                }
            } catch (error) {
                console.error('Google Login Failed:', error);
                toast.error("Đăng nhập Google thất bại.");
            }
        },
        onError: (errorResponse) => {
            console.error('Google Login Failed:', errorResponse);
            toast.error("Đăng nhập Google thất bại.");
        },
        flow: 'auth-code',
        scope: 'openid profile email',
    });

    // Handle login form submission
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) {
            toast.error("Vui lòng nhập email và mật khẩu.");
            return;
        }
        await loginUser(loginEmail, loginPassword);
    };

    // 3. Sửa lại hàm xử lý Đăng Ký
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate input
        if (!registerUsername || !registerEmail || !registerPassword || !registerPasswordConfirm) {
            toast.error("Vui lòng điền đầy đủ tất cả các trường.");
            return;
        }
        if (registerPassword !== registerPasswordConfirm) {
            toast.error("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            // Gọi API đăng ký trực tiếp
            const res = await registerAPI(registerEmail, registerUsername, registerPassword, registerPasswordConfirm);
            
            // Kiểm tra kết quả (thường backend trả về 200 OK)
            if (res && res.status === 200) {
                // Hiện thông báo thành công và nhắc check mail
                toast.success("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.", {
                    autoClose: 5000 // Hiện lâu chút cho user đọc
                });

                // Chuyển giao diện về form Đăng Nhập
                setIsSignUpMode(false);

                // Reset form đăng ký
                setRegisterUsername('');
                setRegisterEmail('');
                setRegisterPassword('');
                setRegisterPasswordConfirm('');
            }
        } catch (error) {
            // Lỗi đã được xử lý bên trong registerAPI (handleError) hoặc hiển thị log tại đây
            console.error("Register failed:", error);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <NavbarLogin/>
            <div className={cx('container', { 'sign-up-mode': isSignUpMode })}>
                <div className={cx('forms-container')}>
                    <div className={cx('signin-signup')}>
                        {/* Sign In Form */}
                        <form action="#" className={cx('sign-in-form')} onSubmit={handleLoginSubmit}>
                            <h2 className={cx('title')}>Đăng Nhập</h2>
                            <div className={cx('input-field')}>
                                <i className="fas fa-envelope"></i>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
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
                                    required
                                />
                            </div>
                            <input type="submit" value="Đăng nhập" className={cx('btn', 'solid')} />
                            
                            <p className={cx('social-text')}>Hoặc đăng nhập với</p>
                            <div className={cx('social-media')}>
                                <button 
                                    type="button"
                                    className={cx('google-custom-button')}
                                    onClick={() => googleAuth()}
                                >
                                    <img 
                                        src="https://www.svgrepo.com/show/475656/google-color.svg" 
                                        alt="Google" 
                                        className={cx('google-icon')}
                                    />
                                    Đăng nhập với Google
                                </button>
                            </div>
                            <div className={cx('password-service')}>
                                <Link to={'/change-password'}>

                                <p className={cx('change-password')}>Đổi mật khẩu</p>
                                </Link>
                                <p className={cx('forget-password')}>Quên mật khẩu</p>
                            </div>

                        </form>

                        {/* Sign Up Form */}
                        <form action="#" className={cx('sign-up-form')} onSubmit={handleRegisterSubmit}>
                            <h2 className={cx('title')}>Đăng Ký</h2>
                            <div className={cx('input-field')}>
                                <i className="fas fa-user"></i>
                                <input
                                    type="text"
                                    placeholder="Tên đăng nhập"
                                    value={registerUsername}
                                    onChange={(e) => setRegisterUsername(e.target.value)}
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
                                    required
                                />
                            </div>
                            <input type="submit" className={cx('btn')} value="Đăng ký" />
                            {/* <p className={cx('social-text')}>Hoặc đăng ký với</p> */}
                            <div className={cx('social-media')}>
                                <button 
                                    type="button"
                                    className={cx('google-custom-button')}
                                    onClick={() => googleAuth()}
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

                {/* Panels Container */}
                <div className={cx('panels-container')}>
                    <div className={cx('panel', 'left-panel')}>
                        <div className={cx('content')}>
                            <h3>Bạn là người mới ?</h3>
                            <p>
                                Hãy đăng ký để nhận được nhiều ưu đãi từ CSB!
                            </p>
                            <button
                                className={cx('btn', 'transparent')}
                                id="sign-up-btn"
                                onClick={() => setIsSignUpMode(true)}
                            >
                                Đăng ký
                            </button>
                        </div>
                        <img src={logImg} className={cx('image')} alt="Login illustration" />
                    </div>
                    <div className={cx('panel', 'right-panel')}>
                        <div className={cx('content')}>
                            <h3>Bạn là khách hàng của CSB?</h3>
                            <p>
                                Nếu bạn đã có tài khoản, click vào đây để đăng nhập!
                            </p>
                            <button
                                className={cx('btn', 'transparent')}
                                id="sign-in-btn"
                                onClick={() => setIsSignUpMode(false)}
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