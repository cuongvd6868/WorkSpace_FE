import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTimes, faMapMarkerAlt, faUser, faEnvelope, faCalendarAlt, 
    faInfoCircle, faDoorOpen, faRulerCombined, faUsers, faMoneyBillWave,
    faCheckCircle, faTimesCircle, faImages, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { WorkspaceItem } from '~/types/Staff';
import styles from './PendingWorkspaceDetailModal.module.scss';
import { CLOUD_NAME } from '~/config/cloudinaryConfig';

const cx = classNames.bind(styles);

interface Props {
    workspace: WorkspaceItem;
    onClose: () => void;
    onApprove: (id: number, title: string) => void;
    onReject: (id: number, title: string) => void;
}

const PendingWorkspaceDetailModal: React.FC<Props> = ({ workspace, onClose, onApprove, onReject }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'images' | 'rooms'>('info');

    return (
        <div className={cx('modal-overlay')} onClick={onClose}>
            <div className={cx('modal-container')} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <header className={cx('header')}>
                    <div className={cx('header-title')}>
                        <span className={cx('badge')}>ĐANG CHỜ DUYỆT</span>
                        <h2>{workspace.title}</h2>
                    </div>
                    <button className={cx('close-btn')} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </header>

                {/* Main Content */}
                <div className={cx('content')}>
                    {/* Sidebar Info */}
                    <aside className={cx('sidebar')}>
                        <div className={cx('host-card')}>
                            <h3>Chủ sở hữu</h3>
                            <div className={cx('host-info')}>
                                <div className={cx('avatar')}>{workspace.hostName.charAt(0)}</div>
                                <div>
                                    <p className={cx('name')}>{workspace.hostName}</p>
                                    <p className={cx('email')}>{workspace.hostEmail}</p>
                                </div>
                            </div>
                        </div>

                        <div className={cx('quick-stats')}>
                            <div className={cx('stat-item')}>
                                <FontAwesomeIcon icon={faLayerGroup} />
                                <span>{workspace.workSpaceTypeName}</span>
                            </div>
                            <div className={cx('stat-item')}>
                                <FontAwesomeIcon icon={faDoorOpen} />
                                <span>{workspace.totalRooms} Phòng tổng cộng</span>
                            </div>
                            <div className={cx('stat-item')}>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span>Ngày đăng ký: {new Date(workspace.createdDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </aside>

                    {/* Main Details */}
                    <main className={cx('main-scroll')}>
                        <section className={cx('section')}>
                            <h3 className={cx('section-title')}><FontAwesomeIcon icon={faInfoCircle} /> Chi tiết địa chỉ & Mô tả</h3>
                            <p className={cx('address')}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} /> {workspace.addressLine}, {workspace.city}
                            </p>
                            <div className={cx('description-box')}>
                                {workspace.description || "Không có mô tả chi tiết từ chủ sở hữu."}
                            </div>
                        </section>

                        <section className={cx('section')}>
                            <h3 className={cx('section-title')}><FontAwesomeIcon icon={faImages} /> Tất cả hình ảnh ({workspace.imageUrls.length})</h3>
                            <div className={cx('image-grid')}>
                                {workspace.imageUrls.map((url, index) => (
                                    <div key={index} className={cx('image-item')}>
                                        <img src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${url}`} alt={`workspace-${index}`} loading="lazy" />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={cx('section')}>
                            <h3 className={cx('section-title')}><FontAwesomeIcon icon={faDoorOpen} /> Danh sách các phòng chi tiết</h3>
                            <div className={cx('room-cards')}>
                                {workspace.rooms.map(room => (
                                    <div key={room.id} className={cx('room-card')}>
                                        <div className={cx('room-details')}>
                                            <h4>{room.title}</h4>
                                            <div className={cx('room-specs')}>
                                                <span><FontAwesomeIcon icon={faUsers} /> {room.capacity}</span>
                                                <span><FontAwesomeIcon icon={faRulerCombined} /> {room.area}m²</span>
                                                <span className={cx('price')}><FontAwesomeIcon icon={faMoneyBillWave} /> {room.pricePerDay.toLocaleString()}đ</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>
                </div>

                {/* Footer Actions */}
                <footer className={cx('footer')}>
                    <button className={cx('btn-approve')} onClick={() => onApprove(workspace.id, workspace.title)}>
                        <FontAwesomeIcon icon={faCheckCircle} /> Phê duyệt ngay
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default PendingWorkspaceDetailModal;