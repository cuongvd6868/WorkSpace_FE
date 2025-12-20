import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPlus, faPaperPlane, faTrash, faEdit, faInfoCircle, faCalendarAlt, faChevronDown, faChevronUp, faBell, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";
import styles from './NotificationManagementSection.module.scss'; 
import { 
    getPersonalNotifications, 
    createOwnerNotification, 
    updateNotification,
} from "~/services/OwnerService"; 
import { NotificationItem, NotificationCreateRequest, NotificationUpdateRequest } from "~/types/Owner";
import { useAuth } from "~/context/useAuth"; 
import { deleteNotification } from "~/services/NotificationService";

const cx = classNames.bind(styles);

// --- Hàm Định Dạng Thời Gian (Giữ nguyên) ---
const formatTime = (isoString: string) => {
    try {
        return new Date(isoString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return isoString;
    }
};

// --- 1. Form Tạo Thông Báo ---
interface CreateNotificationFormProps {
    onCreationSuccess: () => void;
    handleCreate: (payload: NotificationCreateRequest) => Promise<number>; 
}

const CreateNotificationForm: React.FC<CreateNotificationFormProps> = ({ onCreationSuccess, handleCreate }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error("Vui lòng nhập đầy đủ Tiêu đề và Nội dung.");
            return;
        }

        setIsSubmitting(true);
        const payload: NotificationCreateRequest = { title, content };

        try {
            const newId = await handleCreate(payload); 
            toast.success(`Thông báo "${title}" đã được tạo thành công! ID: ${newId}`);
            setTitle('');
            setContent('');
            onCreationSuccess();
        } catch (error) {
            toast.error(`Lỗi khi tạo thông báo: ${error instanceof Error ? error.message : 'Lỗi không xác định.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className={cx('create-form')} onSubmit={handleSubmit}>
            <h4><FontAwesomeIcon icon={faPaperPlane} /> Gửi Thông Báo Mới</h4>
            <div className={cx('form-group')}>
                <label htmlFor="title">Tiêu đề:</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Lịch bảo trì hệ thống"
                    required
                    maxLength={100}
                />
            </div>
            <div className={cx('form-group')}>
                <label htmlFor="content">Nội dung:</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung thông báo..."
                    required
                    rows={4}
                    maxLength={500}
                />
            </div>
            <button type="submit" className={cx('submit-btn')} disabled={isSubmitting}>
                <FontAwesomeIcon icon={faPlus} /> {isSubmitting ? 'Đang gửi...' : 'Gửi Thông Báo'}
            </button>
        </form>
    );
};

// --- 2.1. Component hiển thị/chỉnh sửa một thông báo ---
interface NotificationItemProps {
    notif: NotificationItem;
    onUpdateSuccess: () => void;
    expandedId: number | null;
    toggleExpand: (id: number) => void;
    editingId: number | null;
    setEditingId: (id: number | null) => void;
    handleUpdate: (payload: NotificationUpdateRequest) => Promise<string>; 
    handleDelete: (id: number) => Promise<void>; // THÊM PROP DELETE
}

const NotificationItemDisplay: React.FC<NotificationItemProps> = ({ 
    notif, 
    onUpdateSuccess, 
    expandedId, 
    toggleExpand,
    editingId,
    setEditingId,
    handleUpdate,
    handleDelete // NHẬN PROP DELETE
}) => {
    
    const isEditing = editingId === notif.id;
    const [editTitle, setEditTitle] = useState(notif.title);
    const [editContent, setEditContent] = useState(notif.content);
    const [isSaving, setIsSaving] = useState(false);
    
    const isOwner = notif.senderRole.toLowerCase() === 'owner';

    useEffect(() => {
        if (editingId === notif.id) {
            setEditTitle(notif.title);
            setEditContent(notif.content);
        }
    }, [editingId, notif.id, notif.title, notif.content]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTitle.trim() || !editContent.trim()) {
            toast.error("Vui lòng nhập đầy đủ Tiêu đề và Nội dung.");
            return;
        }

        setIsSaving(true);
        const payload: NotificationUpdateRequest = {
            id: notif.id,
            title: editTitle,
            content: editContent
        };

        try {
            const message = await handleUpdate(payload); 
            toast.success(`Cập nhật thông báo thành công: ${message}`);
            setEditingId(null);
            onUpdateSuccess(); 
        } catch (error) {
            toast.error(`Lỗi cập nhật: ${error instanceof Error ? error.message : 'Lỗi không xác định.'}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isEditing && isOwner) {
        return (
            <form className={cx('notification-item', 'edit-mode')} onSubmit={handleSave}>
                <div className={cx('item-header-edit')}>
                    <span className={cx('sender-role', 'owner')}>Đang Sửa ({notif.id})</span>
                    <input 
                        type="text" 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)} 
                        className={cx('edit-title-input')}
                        required
                        maxLength={100}
                    />
                    <div className={cx('edit-actions')}>
                        <button type="submit" className={cx('save-btn')} disabled={isSaving}>
                            <FontAwesomeIcon icon={faCheck} /> {isSaving ? 'Lưu...' : 'Lưu'}
                        </button>
                        <button type="button" className={cx('cancel-btn')} onClick={() => setEditingId(null)} disabled={isSaving}>
                            <FontAwesomeIcon icon={faTimes} /> Hủy
                        </button>
                    </div>
                </div>
                <div className={cx('item-content', 'expanded')}>
                    <textarea 
                        value={editContent} 
                        onChange={(e) => setEditContent(e.target.value)} 
                        rows={4}
                        required
                        maxLength={500}
                    />
                </div>
            </form>
        );
    }
    
    return (
        <div key={notif.id} className={cx('notification-item')}>
            <div className={cx('item-header')} onClick={() => toggleExpand(notif.id)}>
                <div className={cx('sender-info')}>
                    <span className={cx('sender-role', notif.senderRole.toLowerCase())}>
                        {notif.senderRole}
                    </span>
                    <span className={cx('item-title')}>{notif.title}</span>
                </div>
                <div className={cx('time-info')}>
                    <FontAwesomeIcon icon={faCalendarAlt} className={cx('time-icon')} />
                    {formatTime(notif.createUtc)}
                    {isOwner && (
                        <>
                            <button 
                                type="button" 
                                className={cx('edit-action-btn')} 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setEditingId(notif.id);
                                }}
                            >
                                <FontAwesomeIcon icon={faEdit} /> Sửa
                            </button>
                            {/* BỔ SUNG NÚT XÓA */}
                            <button 
                                type="button" 
                                className={cx('delete-action-btn')} 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleDelete(notif.id);
                                }}
                            >
                                <FontAwesomeIcon icon={faTrash} /> Xóa
                            </button>
                        </>
                    )}
                    <FontAwesomeIcon 
                        icon={notif.id === expandedId ? faChevronUp : faChevronDown} 
                        className={cx('toggle-icon')}
                    />
                </div>
            </div>
            
            <div className={cx('item-content', { expanded: notif.id === expandedId })}>
                <p>{notif.content}</p>
            </div>
        </div>
    );
}

// --- 2. Danh Sách Thông Báo ---
const NotificationList: React.FC<{ 
    notifications: NotificationItem[], 
    isLoading: boolean, 
    error: string | null, 
    onUpdateSuccess: () => void,
    handleUpdate: (payload: NotificationUpdateRequest) => Promise<string>,
    handleDelete: (id: number) => Promise<void> // THÊM PROP DELETE
}> = ({ notifications, isLoading, error, onUpdateSuccess, handleUpdate, handleDelete }) => {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    if (isLoading) {
        return <div className={cx('loading-state')}>Đang tải thông báo...</div>;
    }

    if (error) {
        return <div className={cx('error-state')}><FontAwesomeIcon icon={faInfoCircle} /> Lỗi: {error}</div>;
    }

    if (notifications.length === 0) {
        return <div className={cx('empty-state')}><FontAwesomeIcon icon={faBell} size="2x"/> Chưa có thông báo nào.</div>;
    }

    const toggleExpand = (id: number) => {
        if (editingId !== id) {
             setExpandedId(id === expandedId ? null : id);
        }
    };

    return (
        <div className={cx('notification-list')}>
            {notifications
                .sort((a, b) => new Date(b.createUtc).getTime() - new Date(a.createUtc).getTime())
                .map((notif) => (
                    <NotificationItemDisplay 
                        key={notif.id}
                        notif={notif}
                        onUpdateSuccess={onUpdateSuccess}
                        expandedId={expandedId}
                        toggleExpand={toggleExpand}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        handleUpdate={handleUpdate}
                        handleDelete={handleDelete} // TRUYỀN PROP DELETE
                    />
                ))}
        </div>
    );
};


// --- 3. Component Quản Lý Tổng Thể ---
const NotificationManagementSection: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    const { user } = useAuth(); 
    const ownerToken: any = localStorage.getItem('token');

    const checkToken = (): boolean => {
        if (!ownerToken) {
            toast.error("Lỗi xác thực: Vui lòng đăng nhập lại để thực hiện hành động này.");
            return false;
        }
        return true;
    }

    const handleCreateNotification = async (payload: NotificationCreateRequest) => {
        if (!checkToken()) throw new Error("Missing Token");
        return createOwnerNotification(payload, ownerToken); 
    };

    const handleUpdateNotification = async (payload: NotificationUpdateRequest) => {
        if (!checkToken()) throw new Error("Missing Token");
        return updateNotification(payload, ownerToken); 
    };

    // BỔ SUNG HÀM XỬ LÝ XÓA
    const handleDeleteNotification = async (id: number) => {
        if (!checkToken()) return;
        if (!window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;

        try {
            await deleteNotification(id);
            toast.success("Xóa thông báo thành công!");
            fetchNotifications(); // Tải lại danh sách
        } catch (error) {
            toast.error("Không thể xóa thông báo.");
        }
    };

    const fetchNotifications = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPersonalNotifications();
            setNotifications(data);
        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách thông báo.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleCreationOrUpdateSuccess = () => {
        setShowCreateForm(false); 
        fetchNotifications();      
    };

    return (
        <div className={cx('notification-management-wrapper')}>
            
            <div className={cx('action-bar')}>
                <button 
                    className={cx('toggle-form-btn', {active: showCreateForm})} 
                    onClick={() => setShowCreateForm(prev => !prev)}
                >
                    <FontAwesomeIcon icon={faPlus} /> 
                    {showCreateForm ? 'Ẩn Form Tạo' : 'Tạo Thông Báo Chủ Động'}
                </button>
                <button 
                    className={cx('refresh-btn')} 
                    onClick={fetchNotifications}
                    disabled={isLoading}
                >
                    <FontAwesomeIcon icon={faBell} /> Tải Lại Danh Sách
                </button>
            </div>

            {showCreateForm && (
                <div className={cx('create-section-container')}>
                    <CreateNotificationForm 
                        onCreationSuccess={handleCreationOrUpdateSuccess} 
                        handleCreate={handleCreateNotification} 
                    />
                </div>
            )}
            
            <h3 className={cx('list-header')}>
                <FontAwesomeIcon icon={faEnvelope} /> Thông Báo Cá Nhân Đã Nhận ({notifications.length})
            </h3>

            <NotificationList 
                notifications={notifications} 
                isLoading={isLoading} 
                error={error} 
                onUpdateSuccess={handleCreationOrUpdateSuccess}
                handleUpdate={handleUpdateNotification}
                handleDelete={handleDeleteNotification} // TRUYỀN HÀM DELETE
            />
        </div>
    );
};

export default NotificationManagementSection;