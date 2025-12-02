import React, { useEffect, useState, useMemo, useCallback } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSpinner, faCheckCircle, faEnvelope, faClock, faSearch, faEllipsisV, faTags, faFileText, faCalendarAlt, faUser, faEye 
} from '@fortawesome/free-solid-svg-icons'; // Thêm faEye
import styles from './SupportTicketList.module.scss'; 
import { SupportTickets } from '~/types/Staff'; 
import { getAllSupportTickets } from '~/services/StaffService';
// Import Modal mới
import TicketDetailModal from '../TicketDetailModal/TicketDetailModal'; 

const cx = classNames.bind(styles);

const TICKET_STATUS_MAP = {
    0: { name: 'Mới', icon: faEnvelope, color: '#f72585', bgColor: '#fddde7' },
    1: { name: 'Đang xử lý', icon: faClock, color: '#ff9f1c', bgColor: '#fff0e1' },
    2: { name: 'Đã đóng', icon: faCheckCircle, color: '#06d6a0', bgColor: '#e6faf0' },
};

const SupportTicketList: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTickets[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<number | null>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // TRẠNG THÁI MỚI CHO MODAL
    const [selectedTicket, setSelectedTicket] = useState<SupportTickets | null>(null);

    // Tách logic fetch ra khỏi useEffect để gọi lại khi cần (onUpdate)
    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const data: SupportTickets[] = await getAllSupportTickets();
            setTickets(data);
            setError(null);
        } catch (err) {
            setError("Không thể tải danh sách ticket. Vui lòng kiểm tra kết nối API.");
            setTickets([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // ... (filteredTickets, formatDate giữ nguyên)
    const filteredTickets = useMemo(() => {
        let currentTickets = tickets;

        if (filter !== null) {
            currentTickets = currentTickets.filter(ticket => ticket.status === filter);
        }

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            currentTickets = currentTickets.filter(
                ticket => ticket.subject.toLowerCase().includes(lowerCaseSearch) ||
                          ticket.submittedByUserName.toLowerCase().includes(lowerCaseSearch)
            );
        }

        return currentTickets;
    }, [tickets, filter, searchTerm]);

    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }, []);

    // Hàm mở Modal
    const handleViewTicket = (ticket: SupportTickets) => {
        setSelectedTicket(ticket);
    };

    // Hàm đóng Modal
    const handleCloseModal = () => {
        setSelectedTicket(null);
    };

    if (isLoading) {
        return <div className={cx('loading-state')}><FontAwesomeIcon icon={faSpinner} spin /> Đang tải dữ liệu Ticket...</div>;
    }

    if (error) {
        return <div className={cx('error-state')}>❌ {error}</div>;
    }

    return (
        <div className={cx('ticket-list-wrapper')}>
            {/* Thanh điều khiển chính (giữ nguyên) */}
            <div className={cx('control-bar')}>
                {/* ... Bộ lọc và Tìm kiếm (giữ nguyên) ... */}
                <div className={cx('filters')}>
                    {Object.entries(TICKET_STATUS_MAP).map(([statusKey, statusInfo]) => (
                        <button
                            key={statusKey}
                            className={cx('filter-btn', { active: filter === parseInt(statusKey) })}
                            onClick={() => setFilter(parseInt(statusKey))}
                            style={{ '--status-color': statusInfo.color } as React.CSSProperties}
                        >
                            <FontAwesomeIcon icon={statusInfo.icon} /> 
                            {statusInfo.name} ({tickets.filter(t => t.status === parseInt(statusKey)).length})
                        </button>
                    ))}
                    <button
                        className={cx('filter-btn', { active: filter === null })}
                        onClick={() => setFilter(null)}
                    >
                        Tất cả ({tickets.length})
                    </button>
                </div>

                <div className={cx('search-box')}>
                    <FontAwesomeIcon icon={faSearch} className={cx('search-icon')} />
                    <input
                        type="text"
                        placeholder="Tìm theo Chủ đề hoặc Người gửi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cx('search-input')}
                    />
                </div>
            </div>

            {/* Danh sách Ticket (thêm action) */}
            <div className={cx('ticket-table-container')}>
                <table className={cx('ticket-table')}>
                    <thead>
                        <tr>
                            <th className={cx('header-id')}>ID</th>
                            <th className={cx('header-subject')}>Chủ đề</th>
                            <th className={cx('header-user')}>Người gửi</th>
                            <th className={cx('header-date')}><FontAwesomeIcon icon={faCalendarAlt} /> Ngày tạo</th>
                            <th className={cx('header-status')}>Trạng thái</th>
                            <th className={cx('header-action')}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.length > 0 ? (
                            filteredTickets.map(ticket => {
                                const statusInfo = TICKET_STATUS_MAP[ticket.status as keyof typeof TICKET_STATUS_MAP] || { name: 'Không xác định', icon: faFileText, color: '#333', bgColor: '#ccc' };
                                return (
                                    <tr key={ticket.id} className={cx('ticket-row')}>
                                        <td className={cx('ticket-id')}>{ticket.id}</td>
                                        <td className={cx('ticket-subject-cell')}>
                                            <p className={cx('subject-text')}>{ticket.subject}</p>
                                            <span className={cx('ticket-type-tag')}><FontAwesomeIcon icon={faTags} /> Type {ticket.ticketType}</span>
                                        </td>
                                        <td className={cx('ticket-user-cell')}>
                                            <FontAwesomeIcon icon={faUser} /> {ticket.submittedByUserName}
                                        </td>
                                        <td className={cx('ticket-date-cell')}>{formatDate(ticket.createUtc)}</td>
                                        <td className={cx('ticket-status-cell')}>
                                            <span 
                                                className={cx('status-tag')} 
                                                style={{ 
                                                    color: statusInfo.color, 
                                                    backgroundColor: statusInfo.bgColor, 
                                                    borderColor: statusInfo.color 
                                                } as React.CSSProperties}
                                            >
                                                <FontAwesomeIcon icon={statusInfo.icon} /> {statusInfo.name}
                                            </span>
                                        </td>
                                        <td className={cx('ticket-action-cell')}>
                                            <button 
                                                className={cx('action-btn', 'view-btn')} // Thêm class view-btn
                                                onClick={() => handleViewTicket(ticket)}
                                            >
                                                <FontAwesomeIcon icon={faEye} /> Xem
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className={cx('no-data')}>
                                    {filter === 0 ? "🎉 Không có ticket mới nào đang chờ!" : "Không tìm thấy ticket nào khớp với bộ lọc."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CHI TIẾT VÀ TRẢ LỜI */}
            {selectedTicket && (
                <TicketDetailModal 
                    ticket={selectedTicket}
                    onClose={handleCloseModal}
                    onUpdate={fetchTickets} // Gọi lại API để làm mới danh sách sau khi trả lời/cập nhật status
                />
            )}
        </div>
    );
};

export default SupportTicketList;