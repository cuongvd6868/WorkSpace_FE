import React, { useEffect, useState } from "react";
import styles from './WorkSpaceByType.module.scss';
import classNames from "classnames/bind";
import { WorkSpaceType } from "~/types/WorkSpaceType";
import { WorkSpace } from "~/types/WorkSpaces";
import { GetAllWorkSpaceByType, GetAllWorkSpaceTypes } from "~/services/WorkSpaceTypeService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faUsers,
  faPeopleGroup,
  faCalendarAlt,
  faChair,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import WorkSpaceItem from "./WorkSpaceItem/WorkSpaceItem";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

const iconMap: Record<string, any> = {
  faBuilding: faBuilding,
  faUsers: faUsers,
  faPeopleGroup: faPeopleGroup,
  faCalendarAlt: faCalendarAlt,
  faChair: faChair,
};

const ChevronLeftIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/>
    </svg>
);
const ChevronRightIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z" fill="currentColor"/>
    </svg>
);


const cx = classNames.bind(styles);

const WorkSpaceByType: React.FC = () => {
    // workspace type
    const [workSpaceTypes, setWorkSpaceTypes] = useState<WorkSpaceType[]>([]);
    const [typeLoading, setTypeLoading] = useState<boolean>(true);
    const [workSpaceTypesError, setWorkSpaceTypesError] = useState<string | null>(null);
    const [workSpaceType, setWorkSpaceType] = useState<number | null>(null);

    // workspace
    const [workSpace, setWorkSpace] = useState<WorkSpace[]>([]);
    const [workSpaceLoading, setWorkSpaceLoading] = useState<boolean>(true);
    const [workSpaceError, setWorkSpaceError] = useState<string | null>(null);

    // fetch workspace type
    useEffect(() => {
        const fetchWorkSpaceType = async () => {
            try {
                setTypeLoading(true);
                setWorkSpaceError(null);
                const apiResponse = await GetAllWorkSpaceTypes();
                setWorkSpaceTypes(apiResponse);
                
                // Mặc định active cái đầu tiên khi có dữ liệu
                if (apiResponse.length > 0) {
                    setWorkSpaceType(apiResponse[0].id);
                }
            } catch (error) {
                console.log('lỗi khi lấy dữ liệu', error);
                setWorkSpaceTypesError('Không tải được dữ liệu, vui lòng thử lại sau');
            } finally {
                setTypeLoading(false);
            }
        }
        fetchWorkSpaceType();
    }, []);

    // fetch workspace
    useEffect(() => {
        const fetchWorkSpace = async (id: number) => {
            try {
                setWorkSpaceLoading(true);
                setWorkSpaceError(null);
                const apiResponse = await GetAllWorkSpaceByType(id);
                setWorkSpace(apiResponse)
                console.log(apiResponse)
            } catch (error) {
                console.log('lỗi khi lấy dữ liệu', error);
                setWorkSpaceError('Không tải được dữ liệu, vui lòng thử lại sau');
            } finally {
                setWorkSpaceLoading(false);
            }
        }
        
        // Chỉ fetch khi workSpaceType có giá trị hợp lệ
        if (workSpaceType) {
            fetchWorkSpace(workSpaceType);
        }
    }, [workSpaceType]);

    const handleTypeClick = (id: number) => {
        setWorkSpaceType(id)
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('title_container')}>
                <FontAwesomeIcon icon={faRocket} className={cx('icon')}/>
                <h2>Bắt đầu với không gian phù hợp nhất</h2>
            </div>
            <p className={cx('desc')}>Khám phá các loại không gian làm việc linh hoạt, đáp ứng mọi nhu cầu từ cá nhân đến nhóm.</p>
            <div className={cx('workspace-type_container')}>
                {workSpaceTypes.map((type) => (
                    <div className={cx('workspace-type_item', { active: workSpaceType === type.id })} key={type.id} onClick={() => handleTypeClick(type.id)}>
                        <FontAwesomeIcon icon={iconMap[type.description]}  className={cx('icon')}/>  
                        <p className={cx('workspace-type_name')}>{type.name}</p>
                    </div>
                ))}
            </div>
            <div className={cx('slider-container')}>
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={24} 
                    slidesPerView={3}
                    navigation={{
                        nextEl: `.${cx('nav-btn')}.${cx('next-btn')}`,
                        prevEl: `.${cx('nav-btn')}.${cx('prev-btn')}`,
                    }}
                    className={cx('promotion-slider')}
                    breakpoints={{
                        320: { slidesPerView: 1, spaceBetween: 16 },
                        768: { slidesPerView: 2, spaceBetween: 20 },
                        1024: { slidesPerView: 4, spaceBetween: 14 },
                    }}
                >
                {workSpace.map((w) => (
                    <SwiperSlide key={w.id} className={cx('promotion-slide')}>
                        <WorkSpaceItem workSpace={w} />
                    </SwiperSlide>
                ))}
                </Swiper>

                <button className={cx('nav-btn', 'prev-btn')}>
                    <ChevronLeftIcon />
                </button>
                <button className={cx('nav-btn', 'next-btn')}>
                    <ChevronRightIcon />
                </button>
            </div>
        </div>
    )
}

export default WorkSpaceByType;