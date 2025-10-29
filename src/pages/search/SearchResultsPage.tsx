// File: src/pages/SearchResults/SearchResults.tsx (Đã sửa)

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
// LƯU Ý: Vui lòng kiểm tra lại đường dẫn này nếu lỗi "Module not found" tiếp tục xảy ra
import styles from './SearchResultsPage.module.scss'; 
import { searchWorkspaces } from '~/services/WorkSpaceService';
import { WorkSpaceSearch } from '~/types/WorkSpaces'; 
// Cần tạo file ~/types/Amenity.ts
// export type Amenity = { id: number, name: string, icon: string };
import { Amenity } from '~/types/Amenity'; 
import { getAllAmenities } from '~/services/AmenityService'; // Cần có Service này
import { BookingType } from '~/context/SearchContext';
import { 
    faMapMarkerAlt, 
    faUsers, 
    faSpinner, 
    faExclamationCircle, 
    faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const cx = classNames.bind(styles);

const SearchResults: React.FC = () => {
    const location = useLocation();
    const [results, setResults] = useState<WorkSpaceSearch[]>([]);
    const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = new URLSearchParams(location.search);
    const ward = searchParams.get('ward') || '';
    const starttime = searchParams.get('starttime') || '';
    const endtime = searchParams.get('endtime') || '';
    const capacity = searchParams.get('capacity') || '';
    const selectedAmenitiesFromUrl = searchParams.getAll('amenities'); 

    const summaryText = `Tìm kiếm: ${ward} | ${capacity} người | Từ ${new Date(starttime).toLocaleTimeString('vi-VN')} ngày ${new Date(starttime).toLocaleDateString('vi-VN')} đến ${new Date(endtime).toLocaleDateString('vi-VN')}`;

    useEffect(() => {
        const fetchData = async () => {
            if (!ward || !starttime || !endtime || !capacity) {
                setError("Thiếu tham số tìm kiếm cần thiết.");
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError(null);
            
            try {
                const fullSearchState = {
                    location: ward,
                    participants: parseInt(capacity),
                    selectedTime: {
                        startTime: new Date(starttime),
                        endTime: new Date(endtime),
                        date: new Date(starttime),
                        displayText: "", 
                    },
                    bookingType: 'hourly' as BookingType,
                    selectedAmenities: selectedAmenitiesFromUrl, 
                };

                // Cần ép kiểu để tránh lỗi Type nếu SearchContext.tsx chưa được sửa hoàn toàn
                const data = await searchWorkspaces(fullSearchState as any); 
                setResults(data);
                
                // Lấy danh sách Amenities
                const amenitiesData = await getAllAmenities(); 
                setAvailableAmenities(amenitiesData);


                if (data.length === 0) {
                    const baseError = `Không tìm thấy không gian làm việc nào tại ${ward} phù hợp với yêu cầu.`;
                    setError(selectedAmenitiesFromUrl.length > 0 ? 
                        `Không có kết quả nào phù hợp với các bộ lọc tiện ích đã chọn.` : baseError);
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
    }, [location.search]); 
    
    const toggleFilter = (amenityName: string) => {
        const currentAmenities = searchParams.getAll('amenities');
        const isSelected = currentAmenities.includes(amenityName);
        let newFilters: string[];

        if (isSelected) {
            newFilters = currentAmenities.filter(name => name !== amenityName);
        } else {
            newFilters = [...currentAmenities, amenityName];
        }

        const newSearchParams = new URLSearchParams();
        
        // Giữ lại các tham số tìm kiếm cơ bản
        if (ward) newSearchParams.append('ward', ward);
        if (starttime) newSearchParams.append('starttime', starttime);
        if (endtime) newSearchParams.append('endtime', endtime);
        if (capacity) newSearchParams.append('capacity', capacity);
        
        // Thêm các tham số Amenities mới
        newFilters.forEach(name => {
            newSearchParams.append('amenities', name);
        });

        // Điều hướng để kích hoạt tìm kiếm lại
        window.location.href = `${location.pathname}?${newSearchParams.toString()}`;
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}>Kết Quả Tìm Kiếm</h1>
                <p className={cx('summary')}>{summaryText}</p>
            </div>
            
            <hr className={cx('divider')} />

            {/* KHẮC PHỤC LỖI CÚ PHÁP JSX TS1109 */}
            {loading && (
                <div className={cx('loading-state')}>
                    <FontAwesomeIcon icon={faSpinner} spin className={cx('spinner-icon')} />
                    <p>Đang tải kết quả và tiện ích...</p>
                </div>
            )}
            
            {error && !loading && (
                <div className={cx('error-state')}>
                    <FontAwesomeIcon icon={faExclamationCircle} className={cx('error-icon')} />
                    <p>Lỗi: {error}</p>
                </div>
            )}

            
            {!loading && !error && (
                <div className={cx('main-content')}>
                    {/* KHU VỰC LỌC (FILTER BAR) */}
                    <div className={cx('filter-sidebar')}>
                        <h3 className={cx('filter-title')}>Lọc theo Tiện ích</h3>
                        
                        <div className={cx('amenities-list')}>
                            {availableAmenities.map(amenity => (
                                <div 
                                    key={amenity.id} 
                                    className={cx('amenity-filter-item', { 
                                        selected: selectedAmenitiesFromUrl.includes(amenity.name) 
                                    })}
                                    onClick={() => toggleFilter(amenity.name)}
                                >
                                    <FontAwesomeIcon 
                                        icon={faCheckCircle} 
                                        className={cx('check-icon')}
                                    />
                                    <span>{amenity.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* KHU VỰC KẾT QUẢ */}
                    <div className={cx('results-area')}>
                        <h2 className={cx('results-count')}>
                            Tìm thấy {results.length} không gian làm việc 
                            {selectedAmenitiesFromUrl.length > 0 && ` (Đã lọc)`}:
                        </h2>
                        
                        {results.length > 0 ? (
                            <div className={cx('results-list')}>
                                {results.map((workspace) => (
                                    <div key={workspace.id} className={cx('workspace-card')}>
                                        <div className={cx('card-content')}>
                                            <h3 className={cx('card-title')}>{workspace.title}</h3>
                                            <p className={cx('card-description')}>{workspace.description}</p>
                                            {/* ... */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={cx('no-results')}>
                                <p>Không tìm thấy bất kỳ không gian làm việc nào phù hợp với tiêu chí của bạn.</p>
                                {selectedAmenitiesFromUrl.length > 0 && (
                                    <button onClick={() => {
                                        const params = new URLSearchParams(location.search);
                                        params.delete('amenities');
                                        window.location.href = `${location.pathname}?${params.toString()}`;
                                    }}>Xóa bộ lọc</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;