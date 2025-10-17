import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './LoginPage.module.scss'; 
import { useAuth } from '~/context/useAuth'; 
import { toast } from 'react-toastify'; 
import NavbarLogin from '~/components/NavbarLogin/NavbarLogin';
import logImg from '~/assets/img/login/log.svg';
import resImg from '~/assets/img/login/register.svg';

const cx = classNames.bind(styles);

const LoginPage: React.FC = () => {
    const { loginUser, registerUser } = useAuth();
    const [isSignUpMode, setIsSignUpMode] = useState(false);

    // State for login form
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // State for register form
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');

    // Handle login form submission
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginUsername || !loginPassword) {
            toast.error("Please enter both username and password.");
            return;
        }
        await loginUser(loginUsername, loginPassword);
    };

    // Handle register form submission
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!registerUsername || !registerEmail || !registerPassword) {
            toast.error("Please fill in all fields.");
            return;
        }
        await registerUser(registerEmail, registerUsername, registerPassword, registerPasswordConfirm);
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
                                <i className="fas fa-user"></i>
                                <input
                                    type="text"
                                    placeholder="Tên đăng nhập"
                                    value={loginUsername}
                                    onChange={(e) => setLoginUsername(e.target.value)}
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
                            <input type="submit" value="Login" className={cx('btn', 'solid')} />
                            <p className={cx('social-text')}>Or Sign in with social platforms</p>
                            <div className={cx('social-media')}>
                                <a href="#" className={cx('social-icon')}>
                                    <i className={cx('fab fa-facebook-f')}></i>
                                </a>
                                <a href="#" className={cx('social-icon')}>
                                    <i className={cx('fab fa-twitter')}></i>
                                </a>
                                <a href="#" className={cx('social-icon')}>
                                    <i className={cx('fab fa-google')}></i>
                                </a>
                                <a href="#" className={cx('social-icon')}>
                                    <i className={cx('fab fa-linkedin-in')}></i>
                                </a>
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
                            <input type="submit" className={cx('btn')} value="Sign up" />
                            <p className={cx('social-text')}>Or Sign up with social platforms</p>
                            <div className={cx('social-media')}>
                                <a href="#" className={cx('social-icon')}>
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" className={cx('social-icon')}>
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="#" className={cx('social-icon')}>
                                    <i className="fab fa-google"></i>
                                </a>
                                <a href="#" className={cx('social-icon')}>
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
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
                                Hãy đăng ký để Khám phá hàng nghìn chỗ làm việc, đặt phòng ngay hôm nay với trải nghiệm nhanh chóng và thuận tiện.
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