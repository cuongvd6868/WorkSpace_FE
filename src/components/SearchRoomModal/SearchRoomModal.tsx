import React, { useState } from 'react';
import styles from './SearchRoomModal.module.scss';
import classNames from 'classnames/bind';
import { X, Search, Calendar, Clock, Users, Loader, XCircle } from 'lucide-react';
import { RoomSearchParams } from '~/services/WorkSpaceRoomService';

const cx = classNames.bind(styles);

interface SearchRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (params: Omit<RoomSearchParams, 'workspaceId'>) => void;
  onClear: () => void;
  isLoading: boolean;
}

const SearchRoomModal: React.FC<SearchRoomModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  onClear,
  isLoading
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState(1);

  // Lấy thời gian hiện tại
  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString().slice(0, 16);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      alert("Vui lòng chọn ngày giờ bắt đầu và kết thúc.");
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      alert("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }

    onSearch({
      startTime: startTime,
      endTime: endTime,
      capacity: Number(capacity) || 1
    });
  };

  const handleClear = () => {
    setStartTime('');
    setEndTime('');
    setCapacity(1);
    onClear();
    onClose(); // Đóng modal sau khi xóa
  };

  const handleClose = () => {
    onClose();
  };

  // Nếu modal không mở thì không render gì
  if (!isOpen) return null;

  return (
    <div className={cx('searchModalOverlay')} onClick={handleClose}>
      <div className={cx('searchModalContent')} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={cx('searchModalHeader')}>
          <h2 className={cx('searchModalTitle')}>
            <Search size={24} />
            Tìm Phòng Trống
          </h2>
          <button className={cx('searchModalClose')} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={cx('searchModalBody')}>
          <form className={cx('searchForm')} onSubmit={handleSubmit}>
            <div className={cx('formGrid')}>
              
              {/* Giờ bắt đầu */}
              <div className={cx('formGroup')}>
                <label htmlFor="start-time">
                  <Calendar size={16} /> 
                  Thời gian bắt đầu
                </label>
                <input
                  id="start-time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={nowLocal}
                  required
                />
              </div>

              {/* Giờ kết thúc */}
              <div className={cx('formGroup')}>
                <label htmlFor="end-time">
                  <Clock size={16} /> 
                  Thời gian kết thúc
                </label>
                <input
                  id="end-time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime || nowLocal}
                  required
                />
              </div>

              {/* Số người */}
              <div className={cx('formGroup')}>
                <label htmlFor="capacity">
                  <Users size={16} /> 
                  Số lượng người
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                />
              </div>

              {/* Nút bấm */}
              <div className={cx('formActions')}>
                <button 
                  type="submit" 
                  className={cx('actionButton', 'searchButton')} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader size={16} className={cx('buttonLoader')} />
                  ) : (
                    <Search size={16} />
                  )}
                  Tìm Phòng
                </button>
                <button 
                  type="button" 
                  className={cx('actionButton', 'clearButton')} 
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  <XCircle size={16} /> 
                  Hủy
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchRoomModal;