import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFire, faCrown, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './TopBookedSection.module.scss';
import { TopBookedWorkspace } from '~/types/Admin';
import { getTopBookedWorkspaces } from '~/services/AdminService';
import { CLOUD_NAME } from '~/config/cloudinaryConfig';

const cx = classNames.bind(styles);

const TopBookedSection: React.FC = () => {
    const [workspaces, setWorkspaces] = useState<TopBookedWorkspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getTopBookedWorkspaces(5);
                setWorkspaces(data);
            } catch (error) {
                console.error("Lỗi khi lấy top booked:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className={cx('loading')}>
                <FontAwesomeIcon icon={faSpinner} spin /> <span>Đang phân tích dữ liệu...</span>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header-ranking')}>
                <FontAwesomeIcon icon={faFire} className={cx('icon-fire')} />
                <p>Số liệu dựa trên tổng số lượt đặt chỗ thành công trong tháng</p>
            </div>

            <div className={cx('table-container')}>
                <table className={cx('top-table')}>
                    <thead>
                        <tr>
                            <th>Hạng</th>
                            <th>Không gian làm việc</th>
                            <th>Thông tin chủ sở hữu</th>
                            <th>Tổng doanh thu</th>
                            <th>Địa chỉ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workspaces.map((ws, index) => (
                            <tr key={ws.id} className={cx({ 'top-1': index === 0 })}>
                                <td className={cx('rank-cell')}>
                                    {index === 0 ? (
                                        <FontAwesomeIcon icon={faCrown} className={cx('crown')} />
                                    ) : (
                                        <span className={cx('rank-num')}>{index + 1}</span>
                                    )}
                                </td>
                                <td className={cx('workspace-info')}>
                                    <div className={cx('info-flex')}>
                                        <div className={cx('text')}>
                                            <span className={cx('ws-name')}>{ws.title}</span>
                                            <span className={cx('ws-id')}>ID: #{ws.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={cx('host-info')}>
                                    <div className={cx('host-flex')}>
                                        {/* <img src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${ws.hostAvatar}`} alt={ws.hostName} className={cx('host-avatar')} /> */}
                                        <div className={cx('host-text')}>
                                            <p className={cx('host-name')}>{ws.hostName}</p>
                                            <p className={cx('host-email')}>
                                                <FontAwesomeIcon icon={faEnvelope} /> {ws.hostEmail}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className={cx('price-cell')}>
                                    {ws.minPrice.toLocaleString()} VND
                                </td>
                                <td className={cx('address-cell')}>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {ws.address}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopBookedSection;