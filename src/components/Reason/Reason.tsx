import React, { useState } from "react";
import styles from './Reason.module.scss';
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshake, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import planIcon from '~/assets/img/reason/plan.svg';
import rec1 from '~/assets/img/reason/Rectangle1.svg';
import rec2 from '~/assets/img/reason/Rectangle2.svg';
import rec3 from '~/assets/img/reason/Rectangle3.svg';
import rec4 from '~/assets/img/reason/Rectangle4.svg';

const cx = classNames.bind(styles);

interface Feature {
    id: number;
    title: string;
    detail: string;
    initialOpen: boolean;
}

const features: Feature[] = [
    { id: 1, title: "Làm việc nhóm dễ dàng", detail: "Tạo nhóm, chia sẻ không gian và cùng nhau lựa chọn nơi phù hợp nhất.", initialOpen: true },
    { id: 2, title: "Tích hợp đặt phòng & tiện ích", detail: "Đặt phòng họp, bàn làm việc hoặc văn phòng riêng — tất cả trong một nền tảng.", initialOpen: false },
    { id: 3, title: "Gợi ý không gian phù hợp", detail: "CSB tự động đề xuất địa điểm theo vị trí, thói quen và ngân sách của bạn.", initialOpen: false },
    { id: 4, title: "Quản lý đặt chỗ thông minh", detail: "Theo dõi lịch sử, chỉnh sửa hoặc hủy đặt chỗ nhanh chóng ngay trên hệ thống.", initialOpen: false },
    { id: 5, title: "Tối ưu thời gian & chi phí", detail: "Tìm được không gian gần bạn nhất, phù hợp ngân sách và mục đích làm việc.", initialOpen: false },
    { id: 6, title: "Thanh toán linh hoạt & an toàn", detail: "Hỗ trợ nhiều phương thức thanh toán, đảm bảo nhanh chóng và bảo mật.", initialOpen: false },
];

interface FeatureItemProps {
    feature: Feature;
    isOpen: boolean;
    onToggle: (id: number) => void;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature, isOpen, onToggle }) => {
    // Sử dụng FontAwesome icons
    const ToggleIcon = isOpen ? faMinus : faPlus;

    return (
        <div className={cx('feature-item', { 'is-open': isOpen })}>
            <button className={cx('feature-header')} onClick={() => onToggle(feature.id)}>
                <div className={cx('toggle-icon-wrapper', { 'bg-orange': isOpen })}>
                    <FontAwesomeIcon icon={ToggleIcon} className={cx('toggle-icon', { 'icon-white': isOpen, 'icon-gray': !isOpen })} />
                </div>
                <span className={cx('feature-title', { 'title-active': isOpen })}>
                    {feature.title}
                </span>
            </button>
            <div className={cx('feature-detail', { 'detail-visible': isOpen })}>
                <p>{feature.detail}</p>
            </div>
        </div>
    );
};


const Reason : React.FC = () => {
    const [openItemId, setOpenItemId] = useState<number | null>(features.find(f => f.initialOpen)?.id || null);

    const handleToggle = (id: number) => {
        setOpenItemId(openItemId === id ? null : id);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('content-col')}>
                    <h2 className={cx('main-title')}>
                        Vì Sao bạn chọn <span className={cx('highlight')}>CSB</span>?
                    </h2>
                    <div className={cx('accordion-list')}>
                        {features.map((feature) => (
                            <FeatureItem
                                key={feature.id}
                                feature={feature}
                                isOpen={openItemId === feature.id}
                                onToggle={handleToggle}
                            />
                        ))}
                    </div>
                </div>

                <div className={cx('illustration-col')}>
                    <div className={cx('illustration-card')}>
                        <img src={planIcon} alt="Trip Plan Mockup" className={cx('mockup-image')} />
                        <img src={rec1} alt="" />
                        <img src={rec2} alt="" />
                        <img src={rec3} alt="" />
                        <img src={rec4} alt="" />

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reason;