import React from "react";
import classNames from "classnames/bind";
import styles from './NavbarLogin.module.scss';
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);


const NavbarLogin:React.FC = () => {
    return (
<>
      <header className={cx('wrapper')}>
        {/* Top navigation bar */}
        <div className={cx('top-nav-bar')}>
          <div className={cx('top-nav-content')}>
            <div className={cx('left-section')}>
                <Link to={'/'}>
                    <div className={cx('logo')}>CSB</div>
                </Link>
            </div>
            <div className={cx('right-section')}>
              <a href="#" className={cx('top-nav-item')}>Hoạt động</a>
              <Link to={'/login'} className={cx('top-nav-item')}>Đăng nhập</Link>
            </div>
          </div>
        </div>
      </header>
    </>
    )
}

export default NavbarLogin;