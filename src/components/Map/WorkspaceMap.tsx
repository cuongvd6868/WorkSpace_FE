import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css'; 

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// === KHẮC PHỤC LỖI HIỂN THỊ ICON CỦA LEAFLET ===
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
// ===============================================

interface WorkspaceMapProps {
    center: [number, number]; 
    zoom: number; 
    markers?: {
        id: string; 
        position: [number, number];
        title: string;
    }[];
    // THÊM: Callback function để xử lý khi Marker được click
    onMarkerClick: (workspaceId: number) => void; 
}

const WorkspaceMap: React.FC<WorkspaceMapProps> = ({ center, zoom, markers = [], onMarkerClick }) => {
    return (
        <MapContainer 
            center={center} 
            zoom={zoom} 
            scrollWheelZoom={false} 
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {markers.map(marker => (
                <Marker 
                    key={marker.id} 
                    position={marker.position}
                    // Gắn eventHandlers để bắt sự kiện click
                    eventHandlers={{
                        // Ép kiểu string thành number cho ID khi gọi callback
                        click: () => onMarkerClick(parseInt(marker.id)), 
                    }}
                >
                    <Popup>{marker.title}</Popup>
                </Marker>
            ))}
            
        </MapContainer>
    );
};

export default WorkspaceMap;