import React, { useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane, faSyncAlt, faCheckCircle, faClock, faEnvelope, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styles from './TicketDetailModal.module.scss';
import { SupportTickets, ReplyTicketPayload, UpdateStatusPayload } from '~/types/Staff';
import { replyToTicket, updateTicketStatus } from '~/services/StaffService';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

// Enum/Map trạng thái (để hiển thị)
const TICKET_STATUS_MAP = {
    0: { name: 'Mới (New)', icon: faEnvelope, color: '#f72585' },
    1: { name: 'Đang xử lý (In Progress)', icon: faClock, color: '#ff9f1c' },
    2: { name: 'Đã đóng (Closed)', icon: faCheckCircle, color: '#06d6a0' },
};

interface TicketDetailModalProps {
    ticket: SupportTickets;
    onClose: () => void;
    onUpdate: () => void; // Callback khi có cập nhật (trả lời/status)
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose, onUpdate }) => {
    const [replyMessage, setReplyMessage] = useState('');
    const [currentStatus, setCurrentStatus] = useState(ticket.status);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Xử lý gửi trả lời
    const handleSendReply = async () => {
        if (!replyMessage.trim()) {
            toast.warn("Vui lòng nhập nội dung trả lời.");
            return;
        }

        setIsSubmitting(true);
        const payload: ReplyTicketPayload = { message: replyMessage };

        try {
            // 1. Gửi phản hồi
            await replyToTicket(ticket.id, payload);
            
            // 2. Nếu thành công, tự động chuyển trạng thái sang "Đang xử lý" (1) nếu đang là "Mới" (0)
            if (currentStatus === 0) {
                const statusPayload: UpdateStatusPayload = { status: 1 };
                await updateTicketStatus(ticket.id, statusPayload);
                setCurrentStatus(1); // Cập nhật trạng thái hiển thị
            }
            
            toast.success("Đã gửi phản hồi thành công!");
            setReplyMessage('');
            onUpdate(); // Kích hoạt cập nhật danh sách cha
        } catch (error) {
            toast.error("Gửi phản hồi thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Xử lý cập nhật trạng thái
    const handleStatusChange = async (newStatus: number) => {
        // Chỉ cho phép cập nhật khi status nằm trong [0, 1, 2]
        if (newStatus === currentStatus || ![0, 1, 2].includes(newStatus)) return;

        setIsUpdatingStatus(true);
        const statusPayload: UpdateStatusPayload = { status: newStatus };

        try {
            await updateTicketStatus(ticket.id, statusPayload);
            setCurrentStatus(newStatus);
            toast.info(`Trạng thái Ticket #${ticket.id} đã được cập nhật thành ${TICKET_STATUS_MAP[newStatus as keyof typeof TICKET_STATUS_MAP].name}.`);
            onUpdate(); // Kích hoạt cập nhật danh sách cha
        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const statusInfo = TICKET_STATUS_MAP[currentStatus as keyof typeof TICKET_STATUS_MAP];

    return (
        <div className={cx('modal-overlay')} onClick={onClose}>
            <div className={cx('modal-content')} onClick={e => e.stopPropagation()}>
                <header className={cx('modal-header')}>
                    <h2 className={cx('modal-title')}>
                        Ticket Hỗ Trợ #{ticket.id}: {ticket.subject}
                    </h2>
                    <button className={cx('close-btn')} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </header>

                <div className={cx('modal-body')}>
                    {/* Thông tin Ticket */}
                    <div className={cx('info-grid')}>
                        <div className={cx('info-item')}>
                            <strong>Người gửi:</strong> {ticket.submittedByUserName}
                        </div>
                        <div className={cx('info-item')}>
                            <strong>Loại Ticket:</strong> Type {ticket.ticketType}
                        </div>
                        <div className={cx('info-item')}>
                            <strong>Ngày tạo:</strong> {new Date(ticket.createUtc).toLocaleString('vi-VN')}
                        </div>
                        
                        {/* Cập nhật trạng thái */}
                        <div className={cx('info-item', 'status-update')}>
                            <strong>Trạng thái (Status):</strong>
                            <div className={cx('status-dropdown-wrapper')}>
                                <span className={cx('current-status-display')} style={{ backgroundColor: statusInfo.color, color: 'white' }}>
                                    {isUpdatingStatus ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={statusInfo.icon} />} 
                                    {isUpdatingStatus ? ' Đang cập nhật...' : ` ${statusInfo.name}`}
                                </span>
                                
                                <select 
                                    value={currentStatus} 
                                    onChange={(e) => handleStatusChange(parseInt(e.target.value))}
                                    className={cx('status-select')}
                                    disabled={isUpdatingStatus}
                                >
                                    {/* Lặp qua các KEY SỐ (0, 1, 2) để đảm bảo giá trị là số */}
                                    {Object.keys(TICKET_STATUS_MAP).map(key => {
                                        const statusKey = parseInt(key);
                                        const info = TICKET_STATUS_MAP[statusKey as keyof typeof TICKET_STATUS_MAP];
                                        return (
                                            <option key={statusKey} value={statusKey}>
                                                {statusKey} - {info.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {/* Lịch sử/Nội dung (Placeholder) */}
                    <div className={cx('history-box')}>
                        <h3>Nội dung & Lịch sử</h3>
                        <div className={cx('placeholder-history')}>
                            <p>
                                {/* Ở đây bạn sẽ hiển thị nội dung chi tiết của ticket và các tin nhắn trao đổi trước đó. */}
                                Chi tiết vấn đề: [Mô tả chi tiết từ người dùng]
                            </p>
                            <p className={cx('placeholder-long')}>
                                [Load tin nhắn Staff/User từ API chi tiết Ticket]
                            </p>
                        </div>
                    </div>

                    {/* Form Trả lời nhanh */}
                    <div className={cx('reply-form-box')}>
                        <h3>Trả lời nhanh</h3>
                        <textarea
                            className={cx('reply-textarea')}
                            placeholder="Nhập phản hồi của bạn... (Gửi sẽ tự động chuyển trạng thái sang 'Đang xử lý' nếu ticket đang ở trạng thái 'Mới')"
                            rows={4}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <button 
                            className={cx('send-btn')} 
                            onClick={handleSendReply} 
                            disabled={isSubmitting || !replyMessage.trim()}
                        >
                            {isSubmitting ? (
                                <><FontAwesomeIcon icon={faSpinner} spin /> Đang gửi...</>
                            ) : (
                                <><FontAwesomeIcon icon={faPaperPlane} /> Gửi Phản Hồi</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailModal;