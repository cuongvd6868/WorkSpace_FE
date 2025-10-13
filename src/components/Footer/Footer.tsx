import React from "react";
import styles from './Footer.module.scss';
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const Footer: React.FC = () => {
  return (
    <footer className={cx('footer')}>
      <div className={cx('container')}>
        <div className={cx('info-section')}>
          <div className={cx('logo')}>Booking.com</div>
          <p className={cx('slogan')}>
            Khám phá những trải nghiệm du lịch đáng nhớ, bắt đầu từ những kỳ nghỉ hoàn hảo.
          </p>
          <div className={cx('social-icons')}>
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
        
        <div className={cx('links-section')}>
          <div className={cx('column')}>
            <h3 className={cx('ks')}>Khách sạn</h3>
            <ul>
              <li><a href="#">Khách sạn Việt Nam</a></li>
              <li><a href="#">Khách sạn quốc tế</a></li>
              <li><a href="#">Resort và Villas</a></li>
              <li><a href="#">Khuyến mãi</a></li>
            </ul>
          </div>
          <div className={cx('column')}>
            <h3 className={cx('ks')}>Hỗ trợ</h3>
            <ul>
              <li><a href="#">Trung tâm trợ giúp</a></li>
              <li><a href="#">Liên hệ chúng tôi</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Điều khoản sử dụng</a></li>
            </ul>
          </div>
          <div className={cx('column')}>
            <h3 className={cx('ks')}>Công ty</h3>
            <ul>
              <li><a href="#">Về chúng tôi</a></li>
              <li><a href="#">Tuyển dụng</a></li>
              <li><a href="#">Cộng đồng đối tác</a></li>
              <li><a href="#">Tin tức & blog</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={cx('copyright')}>
        © 2024 Booking.com. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
};

export default Footer;