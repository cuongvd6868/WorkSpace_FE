import React from "react";
import styles from './Footer.module.scss';
import classNames from "classnames/bind";
import footer_banner from '~/assets/img/footer/footer_banner_img.svg';
import footer_check from '~/assets/img/footer/footer_check_img.svg';
import instagram from '~/assets/img/footer/instagram.svg'
import linkedin from '~/assets/img/footer/linkedin.svg'
import facebook from '~/assets/img/footer/facebook.svg'
import { useLocation } from "react-router-dom";

const cx = classNames.bind(styles);

const Footer: React.FC = () => {


  return (
    <div className={cx('wrapper')}>
      <div className={cx('footer_container')}>
        <div className={cx('footer_banner')}>
          <div className={cx('left')}>
            <h2 className={cx('title')}>Tận hưởng không gian làm việc lý tưởng!</h2>
            <button className={cx('booking_btn')}>Đặt chỗ ngay</button>
            <div className={cx('sub_title')}>
              <img src={footer_check} alt="" />
              <p>Không cần cài đặt, sử dụng ngay.</p>
            </div>
            <div className={cx('sub_title')}>
              <img src={footer_check} alt="" />
              <p>Hỗ trợ mọi loại không gian làm việc.</p>
            </div>
          </div>
          <div className={cx('right')}>
            <img src={footer_banner} alt="footer banner"/>
          </div>
        </div>
        <div className={cx('footer_info')}>
          <div className={cx('logo')}>
            <p>CSB</p>
          </div>
          <div className={cx('us')}>
            <a href="">Pricing</a>
            <a href="">Space</a>
            <a href="">Company</a>
            <a href="">Contact us</a>
          </div>
          <div className={cx('social')}>
              <img src={instagram} alt="instagram" />
              <img src={linkedin} alt="linkedin" />
              <img src={facebook} alt="facebook" />
          </div>
        </div>
      </div>
    </div>

  );
};

export default Footer;