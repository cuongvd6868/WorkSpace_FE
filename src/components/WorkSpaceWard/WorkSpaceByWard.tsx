import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import styles from './WorkSpaceByWard.module.scss';
import { GetAllWard, GetWorkspaceByWard } from "~/services/WardService"; // Điều chỉnh đường dẫn service của bạn
import { WorkspaceByWardModel } from "~/types/Ward";
import WorkSpaceItem from "./WorkSpaceItem/WorkSpaceItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faRocket } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

const WorkSpaceByWard: React.FC = () => {
    const [wards, setWards] = useState<string[]>([]);
    const [selectedWard, setSelectedWard] = useState<string>("");
    const [workspaces, setWorkspaces] = useState<WorkspaceByWardModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // 1. Lấy danh sách các Quận/Huyện khi load trang
    useEffect(() => {
        const fetchWards = async () => {
            try {
                const data = await GetAllWard();
                setWards(data);
                if (data.length > 0) {
                    setSelectedWard(data[0]); // Mặc định chọn quận đầu tiên
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách quận:", error);
            }
        };
        fetchWards();
    }, []);

    // 2. Lấy danh sách Workspace khi selectedWard thay đổi
    useEffect(() => {
        if (selectedWard) {
            const fetchWorkspaces = async () => {
                setLoading(true);
                try {
                    const data = await GetWorkspaceByWard(selectedWard);
                    setWorkspaces(data);
                } catch (error) {
                    console.error("Lỗi lấy workspace theo quận:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchWorkspaces();
        }
    }, [selectedWard]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('title_container')}>
                <FontAwesomeIcon icon={faLocationDot} className={cx('icon')}/>
                <h2>Chọn phòng họp gần bạn nhất</h2>
            </div>
                {/* <h2 className={cx('title')}>Không gian làm việc theo khu vực</h2> */}
                
                {/* Thanh chọn Quận/Huyện */}
                <div className={cx('ward_tabs')}>
                    {wards.map((ward) => (
                        <button
                            key={ward}
                            className={cx('ward_btn', { active: selectedWard === ward })}
                            onClick={() => setSelectedWard(ward)}
                        >
                            {ward}
                        </button>
                    ))}
                </div>

                {/* Swiper Section */}
                <div className={cx('swiper_container')}>
                    {loading ? (
                        <div className={cx('loading')}>Đang tải dữ liệu...</div>
                    ) : workspaces.length > 0 ? (
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={20}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                                1280: { slidesPerView: 4 },
                            }}
                            className={cx('mySwiper')}
                        >
                            {workspaces.map((item) => (
                                <SwiperSlide key={item.id}>
                                    <WorkSpaceItem workSpace={item} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <div className={cx('no_data')}>Không tìm thấy không gian nào tại khu vực này.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkSpaceByWard;