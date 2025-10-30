import React, { useEffect, useState, useMemo } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom'; 
import classNames from 'classnames/bind';
import styles from './SearchResultsPage.module.scss'; 
import { searchWorkspaces } from '~/services/WorkSpaceService';
import { WorkSpaceSearch } from '~/types/WorkSpaces'; 
import { Amenity } from '~/types/Amenity'; 
import { getAllAmenities } from '~/services/AmenityService'; 
import { BookingType } from '~/context/SearchContext';
import { 
    faSpinner, 
    faExclamationCircle, 
    faCheckCircle,
    faMapMarkedAlt 
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// === RANGE SLIDER IMPORTS ===
import Slider from 'rc-slider'; 
import 'rc-slider/assets/index.css'; 
// Giả định LoadingSpinner đã có sẵn (hoặc dùng giao diện loading nội bộ)
// import LoadingSpinner from '~/components/LoadingSpinner/LoadingSpinner'; 

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Range = Slider;
// ============================================


const cx = classNames.bind(styles);

const DEFAULT_MIN_PRICE = 100000;
const DEFAULT_MAX_PRICE = 5000000;
const PRICE_STEP = 50000;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
};

const SearchResultsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate(); 
    
    const [results, setResults] = useState<WorkSpaceSearch[]>([]);
    const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    
    const ward = searchParams.get('ward') || '';
    const starttime = searchParams.get('starttime') || '';
    const endtime = searchParams.get('endtime') || '';
    const capacity = searchParams.get('capacity') || '';
    const selectedAmenitiesFromUrl = searchParams.getAll('amenities'); 
    
    const minPriceFromUrl = parseInt(searchParams.get('minprice') || DEFAULT_MIN_PRICE.toString());
    const maxPriceFromUrl = parseInt(searchParams.get('maxprice') || DEFAULT_MAX_PRICE.toString());
    
    const [currentPriceRange, setCurrentPriceRange] = useState<[number, number]>([minPriceFromUrl, maxPriceFromUrl]);
    
    useEffect(() => {
        setCurrentPriceRange([minPriceFromUrl, maxPriceFromUrl]);
    }, [minPriceFromUrl, maxPriceFromUrl]);

    const summaryText = `Tìm kiếm: ${ward} | ${capacity} người | Từ ${new Date(starttime).toLocaleTimeString('vi-VN')} ngày ${new Date(starttime).toLocaleDateString('vi-VN')} đến ${new Date(endtime).toLocaleDateString('vi-VN')}`;

    // === LOGIC XỬ LÝ CHUYỂN TRANG BẢN ĐỒ RIÊNG ===
    const handleViewMapClick = () => {
        navigate('/map-view', { 
            state: { 
                results: results
            } 
        });
    };
    // ===========================================

    // === LOGIC TẠO MARKERS (Vẫn giữ để có results.length) ===
    const mapMarkers = useMemo(() => {
        return results
            .filter(ws => ws.latitude !== undefined && ws.longitude !== undefined)
            .map(ws => ({
                id: ws.id.toString(), 
                position: [ws.latitude, ws.longitude] as [number, number],
                title: ws.title,
            }));
    }, [results]);
    // ========================================================

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
                    minPrice: minPriceFromUrl, 
                    maxPrice: maxPriceFromUrl, 
                };

                const data = await searchWorkspaces(fullSearchState as any); 
                setResults(data);
                
                const amenitiesData = await getAllAmenities(); 
                setAvailableAmenities(amenitiesData);

                if (data.length === 0) {
                    const baseError = `Không tìm thấy không gian làm việc nào tại ${ward} phù hợp với yêu cầu.`;
                    setError(selectedAmenitiesFromUrl.length > 0 || minPriceFromUrl > DEFAULT_MIN_PRICE || maxPriceFromUrl < DEFAULT_MAX_PRICE ? 
                        `Không có kết quả nào phù hợp với các bộ lọc đã chọn.` : baseError);
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
    
    
    const handlePriceChange = (value: number | number[]) => {
        if (!Array.isArray(value)) {
            return; 
        }

        const [newMinPrice, newMaxPrice] = value;
        
        const newSearchParams = new URLSearchParams();
        
        if (ward) newSearchParams.append('ward', ward);
        if (starttime) newSearchParams.append('starttime', starttime);
        if (endtime) newSearchParams.append('endtime', endtime);
        if (capacity) newSearchParams.append('capacity', capacity);
        
        selectedAmenitiesFromUrl.forEach(name => {
            newSearchParams.append('amenities', name);
        });
        
        if (newMinPrice !== DEFAULT_MIN_PRICE) {
            newSearchParams.append('minprice', newMinPrice.toString());
        }
        if (newMaxPrice !== DEFAULT_MAX_PRICE) {
            newSearchParams.append('maxprice', newMaxPrice.toString());
        }

        window.location.href = `${location.pathname}?${newSearchParams.toString()}`;
    }


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
        
        if (ward) newSearchParams.append('ward', ward);
        if (starttime) newSearchParams.append('starttime', starttime);
        if (endtime) newSearchParams.append('endtime', endtime);
        if (capacity) newSearchParams.append('capacity', capacity);
        
        if (minPriceFromUrl !== DEFAULT_MIN_PRICE) {
            newSearchParams.append('minprice', minPriceFromUrl.toString());
        }
        if (maxPriceFromUrl !== DEFAULT_MAX_PRICE) {
            newSearchParams.append('maxprice', maxPriceFromUrl.toString());
        }
        
        newFilters.forEach(name => {
            newSearchParams.append('amenities', name);
        });

        window.location.href = `${location.pathname}?${newSearchParams.toString()}`;
    }


    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}>Kết Quả Tìm Kiếm</h1>
                <p className={cx('summary')}>{summaryText}</p>
            </div>
            
            <hr className={cx('divider')} />

            {/* HIỂN THỊ TRẠNG THÁI LOADING */}
            {loading && (
                <div className={cx('loading-state')}>
                    {/* Sử dụng FontAwesomeIcon nếu không muốn import LoadingSpinner */}
                    <FontAwesomeIcon icon={faSpinner} spin className={cx('spinner-icon')} />
                    <p>Đang tải kết quả và tiện ích...</p>
                </div>
            )}
            
            {/* HIỂN THỊ TRẠNG THÁI LỖI */}
            {error && !loading && (
                <div className={cx('error-state')}>
                    <FontAwesomeIcon icon={faExclamationCircle} className={cx('error-icon')} />
                    <p>Lỗi: {error}</p>
                    {(selectedAmenitiesFromUrl.length > 0 || minPriceFromUrl !== DEFAULT_MIN_PRICE || maxPriceFromUrl !== DEFAULT_MAX_PRICE) && (
                        <button onClick={() => {
                            const params = new URLSearchParams(location.search);
                            params.delete('amenities');
                            params.delete('minprice');
                            params.delete('maxprice');
                            window.location.href = `${location.pathname}?${params.toString()}`;
                        }} className={cx('reset-filter-button')}>Xóa tất cả bộ lọc</button>
                    )}
                </div>
            )}

            
            {!loading && !error && (
                <div className={cx('main-content')}>
                    <div className={cx('filter-sidebar')}>
                        
                        {/* === KHỐI NÚT XEM BẢN ĐỒ CÓ HÌNH NỀN === */}
                        {results.length > 0 && mapMarkers.length > 0 && (
                            <>
                                <div className={cx('map-button-container')}>
                                    <button 
                                        onClick={handleViewMapClick} 
                                        className={cx('view-map-button')}
                                    >
                                        <FontAwesomeIcon icon={faMapMarkedAlt} /> 
                                        Xem {mapMarkers.length} vị trí trên Bản Đồ
                                    </button>
                                </div>
                            </>
                        )}
                        {/* =========================================== */}

                        <div className={cx('price-filter-section')}>
                            {/* ... Lọc theo Giá */}
                            <h3 className={cx('filter-title')}>Lọc theo Giá (VNĐ/giờ)</h3>
                            <div className={cx('price-range-display')}>
                                <span className={cx('price-min')}>{formatCurrency(currentPriceRange[0])} VNĐ</span>
                                <span> - </span>
                                <span className={cx('price-max')}>{formatCurrency(currentPriceRange[1])} VNĐ</span>
                            </div>

                            <div className={cx('price-slider-container')}>
                                <Range 
                                    range={true} 
                                    min={DEFAULT_MIN_PRICE}
                                    max={DEFAULT_MAX_PRICE}
                                    step={PRICE_STEP}
                                    value={currentPriceRange}
                                    onChange={(value: number | number[]) => { 
                                        if (Array.isArray(value)) {
                                            setCurrentPriceRange(value as [number, number]);
                                        }
                                    }} 
                                    onAfterChange={handlePriceChange} 
                                    allowCross={false}
                                    className={cx('custom-range-slider')}
                                />
                            </div>
                        </div>

                        {/* <hr className={cx('filter-divider')} /> */}
                        
                        {/* ... Lọc theo Tiện ích */}
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
                    
                    <div className={cx('results-area')}>
                        {/* ... Hiển thị Kết quả */}
                        <h2 className={cx('results-count')}>
                            Tìm thấy {results.length} không gian làm việc 
                            {(selectedAmenitiesFromUrl.length > 0 || minPriceFromUrl !== DEFAULT_MIN_PRICE || maxPriceFromUrl !== DEFAULT_MAX_PRICE) && ` (Đã lọc)`}:
                        </h2>
                        
                        {results.length > 0 ? (
                            <div className={cx('results-list')}>
                                {results.map((workspace) => (
                                    // Chuyển hướng đến trang chi tiết khi click vào card
                                    <div 
                                        key={workspace.id} 
                                        className={cx('workspace-card')} 
                                        onClick={() => navigate(`/workspace/${workspace.id}`)}
                                    >
                                        <div className={cx('card-content')}>
                                            <h3 className={cx('card-title')}>{workspace.title}</h3>
                                            <p className={cx('card-description')}>{workspace.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className={cx('no-results')}>
                                <p>Không tìm thấy bất kỳ không gian làm việc nào phù hợp với tiêu chí của bạn.</p>
                                {(selectedAmenitiesFromUrl.length > 0 || minPriceFromUrl !== DEFAULT_MIN_PRICE || maxPriceFromUrl !== DEFAULT_MAX_PRICE) && (
                                    <button onClick={() => {
                                        const params = new URLSearchParams(location.search);
                                        params.delete('amenities');
                                        params.delete('minprice');
                                        params.delete('maxprice');
                                        window.location.href = `${location.pathname}?${params.toString()}`;
                                    }} className={cx('reset-filter-button')}>Xóa bộ lọc</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;