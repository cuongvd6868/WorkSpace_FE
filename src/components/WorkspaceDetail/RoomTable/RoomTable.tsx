import React from "react";
import { useNavigate } from "react-router-dom";
import { BookingData, useBooking } from "~/context/BookingContext";
import { WorkSpaceRoom } from "~/types/WorkSpaceRoom";
import classNames from "classnames/bind";
import styles from './RoomTable.module.scss';
import { 
    Building, 
    Calendar, 
    ChevronRight, 
    Users, 
    Layers, 
    CheckCircle2, 
    Info,
    CreditCard
} from "lucide-react";

interface RoomTableProps {
    rooms: WorkSpaceRoom[];
    lastSearchTime: { startTimeUtc: string; endTimeUtc: string; numberOfParticipants: number } | null;
    workspaceName: string;
    workspaceAddressLine: string;
    roomsToCompare: number[];
    toggleRoomComparison: (roomId: number) => void;
}

const calculateTotalHours = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60));
};

const cx = classNames.bind(styles);

const RoomTable: React.FC<RoomTableProps> = ({
    rooms,
    lastSearchTime,
    workspaceName,
    workspaceAddressLine,
    roomsToCompare,
    toggleRoomComparison
}) => {
    const navigate = useNavigate();
    const { setBookingData } = useBooking();

    const handleBookRoom = (room: WorkSpaceRoom) => {
        if (!lastSearchTime) return;

        const totalHours = calculateTotalHours(lastSearchTime.startTimeUtc, lastSearchTime.endTimeUtc);
        const totalAmount = totalHours * room.pricePerHour;

        const booking: BookingData = {
            room,
            totalAmount,
            totalHours,
            startTimeUtc: lastSearchTime.startTimeUtc,
            endTimeUtc: lastSearchTime.endTimeUtc,
            numberOfParticipants: lastSearchTime.numberOfParticipants,
            workspaceName,
            workspaceAddressLine,
        };
        
        setBookingData(booking);
        navigate('/booking/checkout');
    };

    const maxComparison = 3;

    return (
        <div className={cx('wrapper')}>
            {!rooms || rooms.length === 0 ? (
                <div className={cx('empty-state')}>
                    <div className={cx('icon-box')}>
                        <Building size={48} />
                    </div>
                    <h3>Chưa có phòng trống</h3>
                    <p>Rất tiếc, hiện tại không tìm thấy phòng nào phù hợp với yêu cầu của bạn.</p>
                </div>
            ) : (
                <div className={cx('container')}>
                    {!lastSearchTime && (
                        <div className={cx('banner-warning')}>
                            <div className={cx('banner-content')}>
                                <Info className={cx('info-icon')} size={20} />
                                <span>Vui lòng chọn <strong>thời gian đặt phòng</strong> để xem giá chính xác và kích hoạt đặt chỗ.</span>
                            </div>
                        </div>
                    )}

                    <div className={cx('table-scroll')}>
                        <table className={cx('modern-table')}>
                            <thead>
                                <tr>
                                    <th>Thông tin phòng</th>
                                    <th>Thông số</th>
                                    <th>Giá thuê / Giờ</th>
                                    <th className={cx('center')}>So sánh</th>
                                    <th className={cx('right')}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((room) => {
                                    const isChecked = roomsToCompare.includes(room.id);
                                    const isDisabled = roomsToCompare.length >= maxComparison && !isChecked;
                                    const isBookingDisabled = !lastSearchTime;

                                    return (
                                        <tr key={room.id} className={cx('room-row', { selected: isChecked })}>
                                            <td className={cx('info-cell')}>
                                                <div className={cx('room-main-info')}>
                                                    <span className={cx('room-name')}>{room.title}</span>
                                                    <span className={cx('badge', room.roomType.toLowerCase().replace(/\s/g, '-'))}>
                                                        {room.roomType}
                                                    </span>
                                                </div>
                                                <p className={cx('room-desc')}>{room.description}</p>
                                            </td>
                                            
                                            <td className={cx('stats-cell')}>
                                                <div className={cx('stat-item')}>
                                                    <Users size={14} />
                                                    <span>Tối đa {room.capacity}</span>
                                                </div>
                                                <div className={cx('stat-item')}>
                                                    <Layers size={14} />
                                                    <span>{room.area} m²</span>
                                                </div>
                                            </td>

                                            <td className={cx('price-cell')}>
                                                <div className={cx('price-wrapper')}>
                                                    <span className={cx('currency')}>₫</span>
                                                    <span className={cx('amount')}>{room.pricePerHour.toLocaleString()}</span>
                                                </div>
                                            </td>

                                            <td className={cx('compare-cell')}>
                                                <label className={cx('checkbox-wrapper', { disabled: isDisabled })}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleRoomComparison(room.id)}
                                                        disabled={isDisabled}
                                                    />
                                                    <div className={cx('custom-check')}>
                                                        {isChecked && <CheckCircle2 size={16} />}
                                                    </div>
                                                    <span className={cx('check-text')}>
                                                        {isChecked ? 'Đã chọn' : isDisabled ? 'Đã đủ' : 'So sánh'}
                                                    </span>
                                                </label>
                                            </td>

                                            <td className={cx('action-cell')}>
                                                <button
                                                    className={cx('book-btn', { disabled: isBookingDisabled })}
                                                    onClick={() => handleBookRoom(room)}
                                                    disabled={isBookingDisabled}
                                                >
                                                    <span>{isBookingDisabled ? 'Khóa' : 'Đặt ngay'}</span>
                                                    <ChevronRight size={18} />
                                                </button>
                                                {isBookingDisabled && <span className={cx('hint')}>Cần chọn giờ</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomTable;