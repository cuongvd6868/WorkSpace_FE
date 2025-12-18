import React from "react";
import classNames from "classnames/bind";
import styles from './HostInfo.module.scss';
import { ExternalLink, Phone, Users } from "lucide-react";

const cx = classNames.bind(styles);


interface HostInfoProps {
    hostId: number;
    hostName: string;
    hostPhone: string;
    hostEmail: string;
    hostAvatarUrl: string;
    workspaceTitle: string;
    onOpenChat: () => void;
}

const HostInfo: React.FC<HostInfoProps> = ({hostId, hostName, hostPhone, hostEmail, hostAvatarUrl, workspaceTitle, onOpenChat }) => {
    return (
        <section className={cx('host-section')}>
            <h2 className={cx('section-heading')}>
                <Users size={24} />
                Liên Hệ Chủ Hộ
            </h2>
            <div className={cx('host-card')}>
                <img src={hostAvatarUrl} alt={hostName} className={cx('host-avatar')} />
                <div className={cx('host-details')}>
                    <strong>{hostName}</strong>
                    <p>Đại diện {workspaceTitle}</p>
                </div>
            </div>
            <div className={cx('host-contact')}>
                <p><Phone size={14} /> **Hotline:** {hostPhone}</p>
                <p><ExternalLink size={14} /> **Company:** {hostEmail}</p>
                <button className={cx('chat-button')} onClick={onOpenChat}>
                    Nhắn tin trực tiếp
                </button>
            </div>
        </section>
    );
};

export default HostInfo;