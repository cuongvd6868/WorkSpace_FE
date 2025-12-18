import React, { useEffect, useState, useRef } from "react";
import { 
  X, Users, Maximize, Clock, CheckCircle2, 
  XCircle, Info, Star, MapPin, Wifi, 
  Coffee, Tv, Wind, Shield, Zap,
  ChevronRight, Calendar, DollarSign, Heart,
  Share2, Download, Eye, Video, Mic,
  Battery, Printer, Lock
} from "lucide-react";
import classNames from "classnames/bind";
import styles from "./RoomDetailModal.module.scss";
import { WorkSpaceRoomDetail } from "~/types/WorkSpaceRoom";
import { getRoomDetail } from "~/services/WorkSpaceRoomService";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";

const cx = classNames.bind(styles);

interface Props {
    roomId: number;
    isOpen: boolean;
    onClose: () => void;
}

const RoomDetailModal: React.FC<Props> = ({ roomId, isOpen, onClose }) => {
    const [room, setRoom] = useState<WorkSpaceRoomDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const getImageUrl = (path: string) => 
        path?.startsWith('http') ? path : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${path}`;

    useEffect(() => {
        if (isOpen && roomId) {
            const fetchDetail = async () => {
                setLoading(true);
                try {
                    const data = await getRoomDetail(roomId);
                    setRoom(data);
                } catch (error) {
                    console.error("Error fetching room details:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetail();
        }
    }, [isOpen, roomId]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current) {
                const scrollTop = contentRef.current.scrollTop;
                setIsScrolled(scrollTop > 50);
            }
        };

        const contentElement = contentRef.current;
        if (contentElement) {
            contentElement.addEventListener('scroll', handleScroll);
            return () => contentElement.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const amenityIcons: Record<string, React.ReactNode> = {
        wifi: <Wifi size={20} />,
        coffee: <Coffee size={20} />,
        tv: <Tv size={20} />,
        ac: <Wind size={20} />,
        security: <Shield size={20} />,
        power: <Zap size={20} />,
        battery: <Battery size={20} />,
        printer: <Printer size={20} />,
        lock: <Lock size={20} />,
        video: <Video size={20} />,
        mic: <Mic size={20} />,
    };

    if (!isOpen) return null;

    return (
        <div 
            className={cx("overlay")} 
            onClick={handleBackdropClick}
            data-state={isOpen ? "open" : "closed"}
        >
            <div 
                ref={modalRef}
                className={cx("modal-container")} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Floating Header */}
                <div className={cx("floating-header", { scrolled: isScrolled })}>
                    <div className={cx("header-content")}>
                        <button 
                            className={cx("back-btn")} 
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                        <div className={cx("header-title")}>
                            {room && (
                                <>
                                    <span className={cx("room-type")}>{room.workSpaceRoomType}</span>
                                    <h2 className={cx("title")}>{room.title}</h2>
                                </>
                            )}
                        </div>
                        <div className={cx("header-actions")}>
                            <button className={cx("icon-btn")} aria-label="Save">
                                <Heart size={20} />
                            </button>
                            <button className={cx("icon-btn")} aria-label="Share">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className={cx("loading-state")}>
                        <div className={cx("spinner")}>
                            <div className={cx("spinner-inner")}></div>
                        </div>
                        <p className={cx("loading-text")}>Đang tải thông tin phòng...</p>
                    </div>
                ) : room ? (
                    <div ref={contentRef} className={cx("scrollable-content")}>
                        {/* Hero Gallery - Scrolls with content */}
                        <div className={cx("hero-gallery")}>
                            <div className={cx("gallery-main")}>
                                {room.images[0] && (
                                    <div className={cx("main-image-wrapper")}>
                                        <img 
                                            src={getImageUrl(room.images[0])} 
                                            alt={room.title}
                                            className={cx("hero-image")}
                                        />
                                        {/* <div className={cx("image-overlay")}>
                                            <div className={cx("image-actions")}>
                                                <button className={cx("gallery-btn")}>
                                                    <Eye size={18} />
                                                    <span>Xem ảnh</span>
                                                </button>
                                                <button className={cx("gallery-btn")}>
                                                    <Download size={18} />
                                                    <span>Tải ảnh</span>
                                                </button>
                                            </div>
                                            <div className={cx("image-counter")}>
                                                <span>1/{room.images.length}</span>
                                            </div>
                                        </div> */}
                                    </div>
                                )}
                            </div>
                            
                            {/* Additional Images Grid */}
                            {room.images.length > 1 && (
                                <div className={cx("thumbnail-grid")}>
                                    {room.images.slice(1, 5).map((img, idx) => (
                                        <div key={idx} className={cx("thumbnail-item")}>
                                            <img 
                                                src={getImageUrl(img)} 
                                                alt={`${room.title} ${idx + 2}`}
                                                className={cx("thumbnail-img")}
                                            />
                                            {idx === 3 && room.images.length > 5 && (
                                                <div className={cx("more-overlay")}>
                                                    <span>+{room.images.length - 5}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Main Content */}
                        <div className={cx("content-wrapper")}>
                            {/* Quick Info Banner */}
                            <div className={cx("quick-info-banner")}>
                                <div className={cx("banner-content")}>
                                    <div className={cx("banner-left")}>
                                        <div className={cx("price-display")}>
                                            <span className={cx("price-label")}>Giá theo giờ</span>
                                            <div className={cx("price-main")}>
                                                <DollarSign size={24} />
                                                <span className={cx("price-value")}>
                                                    {room.pricePerHour.toLocaleString()}đ
                                                </span>
                                            </div>
                                            <span className={cx("price-note")}>Đã bao gồm VAT & phí dịch vụ</span>
                                        </div>
                                    </div>
                                    <div className={cx("banner-right")}>
                                        <div className={cx("stats")}>
                                            <div className={cx("stat-item")}>
                                                <Users size={20} />
                                                <span>{room.capacity} người</span>
                                            </div>
                                            <div className={cx("stat-item")}>
                                                <Maximize size={20} />
                                                <span>{room.area} m²</span>
                                            </div>
                                            <div className={cx("stat-item")}>
                                                <Star size={20} fill="currentColor" />
                                                <span>4.8</span>
                                            </div>
                                        </div>
                                        {/* <button className={cx("primary-action-btn")}>
                                            <Calendar size={20} />
                                            <span>Chọn thời gian đặt</span>
                                            <ChevronRight size={18} />
                                        </button> */}
                                    </div>
                                </div>
                            </div>

                            {/* Room Details Sections */}
                            <div className={cx("details-container")}>
                                {/* Description Section */}
                                <section className={cx("detail-section")}>
                                    <div className={cx("section-header")}>
                                        <div className={cx("section-icon")}>
                                            <Info size={24} />
                                        </div>
                                        <div className={cx("section-title")}>
                                            <h3>Mô tả không gian</h3>
                                            <p className={cx("section-subtitle")}>Chi tiết về phòng và không gian làm việc</p>
                                        </div>
                                    </div>
                                    <div className={cx("section-content")}>
                                        <p className={cx("description")}>{room.description}</p>
                                        <div className={cx("features")}>
                                            <div className={cx("feature")}>
                                                <CheckCircle2 size={18} className={cx("check")} />
                                                <span>Thiết kế tối ưu cho làm việc nhóm</span>
                                            </div>
                                            <div className={cx("feature")}>
                                                <CheckCircle2 size={18} className={cx("check")} />
                                                <span>Ánh sáng tự nhiên và nhân tạo cân bằng</span>
                                            </div>
                                            <div className={cx("feature")}>
                                                <CheckCircle2 size={18} className={cx("check")} />
                                                <span>Cách âm tốt, đảm bảo sự riêng tư</span>
                                            </div>
                                            <div className={cx("feature")}>
                                                <CheckCircle2 size={18} className={cx("check")} />
                                                <span>Hệ thống điện hiện đại, nhiều ổ cắm</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Amenities Section */}
                                <section className={cx("detail-section")}>
                                    <div className={cx("section-header")}>
                                        <div className={cx("section-icon")}>
                                            <Zap size={24} />
                                        </div>
                                        <div className={cx("section-title")}>
                                            <h3>Tiện ích đầy đủ</h3>
                                            <p className={cx("section-subtitle")}>Mọi thứ bạn cần cho công việc hiệu quả</p>
                                        </div>
                                    </div>
                                    <div className={cx("section-content")}>
                                        <div className={cx("amenities-grid")}>
                                            {room.amenities.map((item) => (
                                                <div 
                                                    key={item.id} 
                                                    className={cx(
                                                        "amenity-item",
                                                        { "disabled": !item.isAvailable }
                                                    )}
                                                >
                                                    <div className={cx("amenity-icon")}>
                                                        {amenityIcons[item.iconClass] || <Star size={20} />}
                                                        {item.isAvailable ? (
                                                            <CheckCircle2 size={12} className={cx("status-indicator", "available")} />
                                                        ) : (
                                                            <XCircle size={12} className={cx("status-indicator", "unavailable")} />
                                                        )}
                                                    </div>
                                                    <div className={cx("amenity-info")}>
                                                        <span className={cx("amenity-name")}>{item.name}</span>
                                                        <span className={cx("amenity-status", {
                                                            available: item.isAvailable,
                                                            unavailable: !item.isAvailable
                                                        })}>
                                                            {item.isAvailable ? "Sẵn sàng" : "Sẵn sàng"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Specifications */}
                                <section className={cx("detail-section")}>
                                    <div className={cx("section-header")}>
                                        <div className={cx("section-icon")}>
                                            <Maximize size={24} />
                                        </div>
                                        <div className={cx("section-title")}>
                                            <h3>Thông số kỹ thuật</h3>
                                            <p className={cx("section-subtitle")}>Chi tiết về không gian và thiết bị</p>
                                        </div>
                                    </div>
                                    <div className={cx("section-content")}>
                                        <div className={cx("specs-grid")}>
                                            <div className={cx("spec-card")}>
                                                <div className={cx("spec-icon")}>
                                                    <Users size={24} />
                                                </div>
                                                <div className={cx("spec-content")}>
                                                    <h4>Sức chứa</h4>
                                                    <p>Tối đa {room.capacity} người</p>
                                                    <span className={cx("spec-note")}>Lý tưởng cho hội họp nhóm</span>
                                                </div>
                                            </div>
                                            <div className={cx("spec-card")}>
                                                <div className={cx("spec-icon")}>
                                                    <Maximize size={24} />
                                                </div>
                                                <div className={cx("spec-content")}>
                                                    <h4>Diện tích</h4>
                                                    <p>{room.area} m² sử dụng</p>
                                                    <span className={cx("spec-note")}>Không gian mở, thoáng đãng</span>
                                                </div>
                                            </div>
                                            <div className={cx("spec-card")}>
                                                <div className={cx("spec-icon")}>
                                                    <Clock size={24} />
                                                </div>
                                                <div className={cx("spec-content")}>
                                                    <h4>Thời gian đặt</h4>
                                                    <p>Tối thiểu 1 giờ</p>
                                                    <span className={cx("spec-note")}>Linh hoạt theo nhu cầu</span>
                                                </div>
                                            </div>
                                            <div className={cx("spec-card")}>
                                                <div className={cx("spec-icon")}>
                                                    <Shield size={24} />
                                                </div>
                                                <div className={cx("spec-content")}>
                                                    <h4>An ninh</h4>
                                                    <p>24/7 giám sát</p>
                                                    <span className={cx("spec-note")}>Ra vào bằng thẻ từ</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Location & Access */}
                                {/* <section className={cx("detail-section")}>
                                    <div className={cx("section-header")}>
                                        <div className={cx("section-icon")}>
                                            <MapPin size={24} />
                                        </div>
                                        <div className={cx("section-title")}>
                                            <h3>Vị trí & Truy cập</h3>
                                            <p className={cx("section-subtitle")}>Dễ dàng di chuyển và sử dụng</p>
                                        </div>
                                    </div>
                                    <div className={cx("section-content")}>
                                        <div className={cx("location-info")}>
                                            <div className={cx("location-details")}>
                                                <h4>Tầng 3, Tòa nhà Innovation</h4>
                                                <p>123 Đường ABC, Quận 1, TP.HCM</p>
                                                <div className={cx("access-times")}>
                                                    <div className={cx("time-slot")}>
                                                        <span className={cx("time-label")}>Giờ mở cửa:</span>
                                                        <span className={cx("time-value")}>7:00 - 22:00</span>
                                                    </div>
                                                    <div className={cx("time-slot")}>
                                                        <span className={cx("time-label")}>Thứ 2 - Thứ 6:</span>
                                                        <span className={cx("time-value")}>Toàn bộ dịch vụ</span>
                                                    </div>
                                                    <div className={cx("time-slot")}>
                                                        <span className={cx("time-label")}>Cuối tuần:</span>
                                                        <span className={cx("time-value")}>Theo đặt trước</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={cx("transport")}>
                                                <h5>Phương tiện công cộng</h5>
                                                <div className={cx("transport-options")}>
                                                    <span className={cx("transport-badge")}>🚇 Metro 200m</span>
                                                    <span className={cx("transport-badge")}>🚌 Bus 100m</span>
                                                    <span className={cx("transport-badge")}>🅿️ Bãi đỗ xe</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section> */}

                                {/* Booking CTA */}
                                <div className={cx("booking-cta")}>
                                    <div className={cx("cta-content")}>
                                        <div className={cx("cta-text")}>
                                            <h3>Sẵn sàng đặt phòng?</h3>
                                            <p>Chọn thời gian phù hợp và hoàn tất đặt chỗ trong 2 phút</p>
                                        </div>
                                        <div className={cx("cta-actions")}>
                                            <button className={cx("secondary-cta-btn")} onClick={onClose}>
                                                <ChevronRight size={18} />
                                                <span>Xem phòng khác</span>
                                            </button>
                                            {/* <button className={cx("primary-cta-btn")}>
                                                <Calendar size={20} />
                                                <span>Đặt ngay</span>
                                            </button> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={cx("error-state")}>
                        <div className={cx("error-icon")}>
                            <XCircle size={48} />
                        </div>
                        <h3>Không thể tải thông tin</h3>
                        <p>Vui lòng thử lại sau hoặc liên hệ hỗ trợ</p>
                        <button className={cx("retry-btn")} onClick={() => window.location.reload()}>
                            Thử lại
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomDetailModal;