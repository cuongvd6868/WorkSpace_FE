import React, { useEffect, useState } from 'react';
import { Bell, Info, Loader, AlertCircle } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './WorkspaceNotifications.module.scss'; // Tạo file scss tương ứng
import { getAllNotificationByWorkspace } from '~/services/NotificationService';
import { NotificationView } from '~/types/Notification';

const cx = classNames.bind(styles);

interface Props {
    workspaceId: number;
}

const WorkspaceNotifications: React.FC<Props> = ({ workspaceId }) => {
    const [notifications, setNotifications] = useState<NotificationView[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkspaceNotifications = async () => {
            setLoading(true);
            try {
                // Lưu ý: API personal thường dựa trên token, 
                // nhưng nếu API cần workspaceId thì bạn truyền vào params
                const data = await getAllNotificationByWorkspace();
                setNotifications(data || []);
            } catch (err) {
                setError("Không thể tải thông báo của không gian này.");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaceNotifications();
    }, [workspaceId]);

    if (loading) return (
        <div className={cx('status-box')}>
            <Loader className={cx('spin')} size={18} /> <span>Đang tải thông báo...</span>
        </div>
    );

    if (error) return (
        <div className={cx('status-box', 'error')}>
            <AlertCircle size={18} /> <span>{error}</span>
        </div>
    );

    return (
        <div className={cx('noti-container')}>
            <div className={cx('noti-header')}>
                <Bell size={20} />
                <h3>Thông báo từ Host</h3>
            </div>
            
            <div className={cx('noti-list')}>
                {notifications.length > 0 ? (
                    notifications.map((noti) => (
                        <div key={noti.id} className={cx('noti-item')}>
                            <div className={cx('noti-icon')}>
                                <Info size={16} />
                            </div>
                            <div className={cx('noti-content')}>
                                <p className={cx('title')}>{noti.title}</p>
                                <p className={cx('text')}>{noti.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={cx('empty-msg')}>Hiện chưa có thông báo mới nào dành cho bạn.</p>
                )}
            </div>
        </div>
    );
};

export default WorkspaceNotifications;