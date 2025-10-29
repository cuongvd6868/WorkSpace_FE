// File: src/pages/SearchResults/SearchResults.tsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './SearchResultsPage.module.scss';
import { searchWorkspaces } from '~/services/WorkSpaceService';
import { WorkSpaceSearch } from '~/types/WorkSpaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faUsers, faClock, faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const SearchResults: React.FC = () => {
    const location = useLocation();
    const [results, setResults] = useState<WorkSpaceSearch[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Lấy tham số tìm kiếm từ URL
    const searchParams = new URLSearchParams(location.search);
    const ward = searchParams.get('ward') || '';
    const starttime = searchParams.get('starttime') || '';
    const endtime = searchParams.get('endtime') || '';
    const capacity = searchParams.get('capacity') || '';

    // Tạo một chuỗi tóm tắt để hiển thị trên trang
    const summaryText = `Tìm kiếm: ${ward} | ${capacity} người | Từ ${new Date(starttime).toLocaleTimeString('vi-VN')} ngày ${new Date(starttime).toLocaleDateString('vi-VN')} đến ${new Date(endtime).toLocaleDateString('vi-VN')}`;

    useEffect(() => {
        const fetchData = async () => {
            // Kiểm tra các tham số bắt buộc
            if (!ward || !starttime || !endtime || !capacity) {
                setError("Thiếu tham số tìm kiếm cần thiết (Ward, Thời gian, Số người).");
                setLoading(false);
                return;
            }

            // Chuyển đổi tham số thành đối tượng SearchState đơn giản để gọi Service
            // Lưu ý: Chúng ta phải tạo lại Date object từ chuỗi ISO để Service hoạt động đúng,
            // nhưng vì Service chỉ cần chuỗi, chúng ta có thể gọi API trực tiếp
            // HOẶC dùng Service đã định nghĩa. Ta dùng Service để đảm bảo tính nhất quán:
            
            setLoading(true);
            setError(null);
            
            try {
                // Ta cần giả lập SearchState để hàm searchWorkspaces nhận được
                const fakeSearchState = {
                    location: ward,
                    participants: parseInt(capacity),
                    // TẠO LẠI DATE OBJECT TỪ CHUỖI ĐỂ TRUYỀN VÀO SERVICE
                    selectedTime: {
                        startTime: new Date(starttime),
                        endTime: new Date(endtime),
                        date: new Date(starttime), // giá trị này không quan trọng trong ngữ cảnh này
                        displayText: "", 
                    },
                    bookingType: 'hourly' as any,
                };

                const data = await searchWorkspaces(fakeSearchState);
                setResults(data);

                if (data.length === 0) {
                    setError(`Không tìm thấy không gian làm việc nào tại ${ward} phù hợp với yêu cầu.`);
                }

            } catch (err) {
                console.error("Lỗi khi tải kết quả:", err);
                setError("Lỗi không thể kết nối đến máy chủ hoặc xử lý tìm kiếm.");
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]); // Chạy lại mỗi khi URL search query thay đổi

    // === PHẦN RENDER ===

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}>Kết Quả Tìm Kiếm</h1>
                <p className={cx('summary')}>{summaryText}</p>
            </div>
            
            <hr className={cx('divider')} />

            {loading && (
                <div className={cx('loading-state')}>
                    <FontAwesomeIcon icon={faSpinner} spin className={cx('spinner-icon')} />
                    <p>Đang tải kết quả...</p>
                </div>
            )}

            {error && !loading && (
                <div className={cx('error-state')}>
                    <FontAwesomeIcon icon={faExclamationCircle} className={cx('error-icon')} />
                    <p>Lỗi: {error}</p>
                </div>
            )}

            {!loading && !error && results.length > 0 && (
                <div className={cx('results-list')}>
                    <h2 className={cx('results-count')}>Tìm thấy {results.length} không gian làm việc:</h2>
                    {results.map((workspace) => (
                        <div key={workspace.id} className={cx('workspace-card')}>
                            <div className={cx('card-image')}>
                                {/*  */}
                            </div>
                            <div className={cx('card-content')}>
                                <h3 className={cx('card-title')}>{workspace.title}</h3>
                                <p className={cx('card-description')}>{workspace.description}</p>
                                <div className={cx('card-details')}>
                                    <div className={cx('detail-item')}>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className={cx('detail-icon')} />
                                        <span>{workspace.street}, **{workspace.ward}**</span>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <FontAwesomeIcon icon={faUsers} className={cx('detail-icon')} />
                                        <span>Sức chứa tối đa: {capacity} người</span>
                                    </div>
                                </div>
                                <div className={cx('card-actions')}>
                                    <button className={cx('view-button')}>Xem chi tiết</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Trường hợp không có lỗi và không có kết quả */}
            {!loading && !error && results.length === 0 && (
                <div className={cx('no-results')}>
                    <p>Không tìm thấy bất kỳ không gian làm việc nào phù hợp với tiêu chí của bạn.</p>
                </div>
            )}
        </div>
    );
};

export default SearchResults;