import React, { useEffect, useMemo } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import WorkspaceMap from '~/components/Map/WorkspaceMap'; 
import { WorkSpaceSearch } from '~/types/WorkSpaces'; 
import classNames from 'classnames/bind';
import styles from './MapPageView.module.scss'; 
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const cx = classNames.bind(styles);

const DEFAULT_MAP_CENTER: [number, number] = [21.0285, 105.8542]; 
const DEFAULT_MAP_ZOOM = 10;

const MapPageView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const results = (location.state?.results as WorkSpaceSearch[] || []);
    

    const mapMarkers = useMemo(() => {
        if (!results || results.length === 0) return [];
        return results
            .filter(ws => ws.latitude !== undefined && ws.longitude !== undefined)
            .map(ws => ({
                id: ws.id.toString(), 
                position: [ws.latitude, ws.longitude] as [number, number],
                title: ws.title,
            }));
    }, [results]);

    const handleMarkerClick = (workspaceId: number) => {
        navigate(`/workspace/${workspaceId}`, { state: { from: location.pathname } }); 
    };

    const mapCenter: [number, number] = mapMarkers.length > 0 ? mapMarkers[0].position : DEFAULT_MAP_CENTER;

    useEffect(() => {
        requestAnimationFrame(() => {
            window.scrollTo({
                top: 210, 
                behavior: 'smooth' 
            });
        });

    }, []);

    return (
        <div className={cx('wrapper')}>
            <header className={cx('header')}>
                <button 
                    onClick={() => navigate(-1)} 
                    className={cx('back-button')}
                >
                    <FontAwesomeIcon icon={faArrowLeft} /> Quay lại kết quả
                </button>
                <h1 className={cx('title')}>Bản Đồ Kết Quả Tìm Kiếm ({mapMarkers.length} vị trí)</h1>
            </header>

            <div className={cx('map-full-container')}>
                <WorkspaceMap 
                    center={mapCenter}
                    zoom={DEFAULT_MAP_ZOOM} 
                    markers={mapMarkers}
                    onMarkerClick={handleMarkerClick}
                />
            </div>
        </div>
    );
};

export default MapPageView;