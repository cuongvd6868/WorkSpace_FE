import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './NotificationManagementSection.module.scss'; // Giả định có file CSS tương ứng
import classNames from 'classnames/bind';

// Import services và types
import { 
    getAllNotifications, 
    createNotification, 
    updateNotification, 
    deleteNotification 
} from '~/services/AdminService'; // Giả định bạn đặt các service mới vào AdminService
import { 
    Notification, 
    CreateNotificationRequest, 
    UpdateNotificationRequest 
} from '~/types/Admin'; // Giả định types nằm trong ~/types/Admin

const cx = classNames.bind(styles);

// Khởi tạo trạng thái cho form (Tạo/Cập nhật)
const initialFormState: UpdateNotificationRequest = {
    id: 0,
    title: '',
    content: ''
};

const NotificationManagementSection: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentNotification, setCurrentNotification] = useState<UpdateNotificationRequest>(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // --- Logic Tải Dữ liệu ---
    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await getAllNotifications();
            // Đảm bảo dữ liệu là mảng trước khi set
            if (Array.isArray(data)) {
                setNotifications(data);
            } else {
                setNotifications([]);
                toast.warn('Dữ liệu thông báo trả về không đúng định dạng.');
            }
        } catch (error) {
            toast.error('Lỗi tải danh sách thông báo.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // --- Logic Xử lý Form ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentNotification(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenForm = (notification?: Notification) => {
        if (notification) {
            // Chế độ Chỉnh sửa
            setCurrentNotification({
                id: Number(notification.id),
                title: notification.title,
                content: notification.content
            });
            setIsEditing(true);
        } else {
            // Chế độ Tạo mới
            setCurrentNotification(initialFormState);
            setIsEditing(false);
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setCurrentNotification(initialFormState);
        setIsEditing(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            if (isEditing) {
                // Xử lý Cập nhật
                const updateData: UpdateNotificationRequest = {
                    id: currentNotification.id,
                    title: currentNotification.title,
                    content: currentNotification.content
                };
                await updateNotification(updateData);
                toast.success('Cập nhật thông báo thành công!');
            } else {
                // Xử lý Tạo mới
                const createData: CreateNotificationRequest = {
                    title: currentNotification.title,
                    content: currentNotification.content
                };
                await createNotification(createData);
                toast.success('Tạo thông báo mới thành công!');
            }
            
            handleCloseForm();
            fetchNotifications(); // Tải lại dữ liệu
        } catch (error) {
            toast.error(`Lỗi ${isEditing ? 'cập nhật' : 'tạo mới'} thông báo.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Logic Xóa thông báo ---
    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            try {
                await deleteNotification(id);
                toast.success('Xóa thông báo thành công!');
                fetchNotifications();
            } catch (error) {
                toast.error('Lỗi khi xóa thông báo.');
                console.error(error);
            }
        }
    };

    // --- Render Form Tạo/Cập nhật ---
    const renderNotificationForm = () => (
        <div className={cx('form-overlay', { visible: showForm })}>
            <div className={cx('notification-form')}>
                <h3 className={cx('form-title')}>
                    {isEditing ? 'Cập Nhật Thông Báo' : 'Tạo Thông Báo Mới'}
                </h3>
                <form onSubmit={handleSubmit}>
                    {isEditing && (
                         <div className={cx('form-group')}>
                            <label>ID:</label>
                            <input
                                type="text"
                                value={currentNotification.id}
                                disabled
                                className={cx('input-disabled')}
                            />
                        </div>
                    )}
                    <div className={cx('form-group')}>
                        <label htmlFor="title">Tiêu đề:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={currentNotification.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="content">Nội dung:</label>
                        <textarea
                            id="content"
                            name="content"
                            rows={5}
                            value={currentNotification.content}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className={cx('form-actions')}>
                        <button type="submit" disabled={isSubmitting}>
                            <FontAwesomeIcon icon={isSubmitting ? faSpinner : faCheckCircle} spin={isSubmitting} />
                            {isEditing ? ' Cập Nhật' : ' Tạo Mới'}
                        </button>
                        <button type="button" onClick={handleCloseForm} className={cx('cancel-btn')} disabled={isSubmitting}>
                            <FontAwesomeIcon icon={faTimesCircle} /> Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // --- Render Bảng Thông báo ---
    const renderNotificationTable = () => {
        if (isLoading) {
            return <p className={cx('loading-message')}><FontAwesomeIcon icon={faSpinner} spin /> Đang tải thông báo...</p>;
        }
        
        if (notifications.length === 0) {
            return <p className={cx('empty-message')}>Chưa có thông báo nào được tạo.</p>;
        }

        return (
            <div className={cx('table-container')}>
                <table className={cx('notification-table')}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tiêu đề</th>
                            <th>Người gửi</th>
                            <th>Vai trò</th>
                            <th>Ngày tạo (UTC)</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map((notif) => (
                            <tr key={notif.id}>
                                <td>{notif.id}</td>
                                <td>{notif.title}</td>
                                <td>{notif.senderId}</td>
                                <td>{notif.senderRole}</td>
                                <td>{new Date(notif.createUtc).toLocaleString()}</td>
                                <td className={cx('action-btns')}>
                                    <button 
                                        onClick={() => handleOpenForm(notif)} 
                                        className={cx('edit-btn')}
                                        title="Chỉnh sửa"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(Number(notif.id))} 
                                        className={cx('delete-btn')}
                                        title="Xóa"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className={cx('notification-section')}>
            <div className={cx('header-control')}>
                <button 
                    onClick={() => handleOpenForm()} 
                    className={cx('create-btn')}
                >
                    <FontAwesomeIcon icon={faPlus} /> Tạo Thông Báo Mới
                </button>
            </div>
            
            {renderNotificationTable()}
            {renderNotificationForm()}
        </div>
    );
};

export default NotificationManagementSection;