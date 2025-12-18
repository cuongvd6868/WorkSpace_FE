import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './OwnerChatSection.module.scss';
import { ownerChatService } from '~/services/ChatService';
import { OwnerChatSession, OwnerChatMessage } from '~/types/ChatUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUserCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const cx = classNames.bind(styles);

const OwnerChatSection: React.FC = () => {
    const [sessions, setSessions] = useState<OwnerChatSession[]>([]);
    const [selectedSid, setSelectedSid] = useState<string | null>(null);
    const [messages, setMessages] = useState<OwnerChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Lấy danh sách các phiên chat của khách hàng
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await ownerChatService.getOwnerSessions();
                setSessions(data);
            } catch (error) {
                console.error("Lỗi lấy danh sách chat:", error);
            }
        };
        fetchSessions();
        // Option: Thiết lập setInterval để reload danh sách mỗi 30s
    }, []);

    // 2. Lấy tin nhắn khi chọn một session
    useEffect(() => {
        if (selectedSid) {
            const fetchMessages = async () => {
                try {
                    const data = await ownerChatService.getOwnerChatHistory(selectedSid);
                    setMessages(data);
                } catch (error) {
                    console.error("Lỗi lấy tin nhắn:");
                }
            };
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Auto refresh mỗi 5s
            return () => clearInterval(interval);
        }
    }, [selectedSid]);

    // 3. Tự động cuộn xuống dưới cùng
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || !selectedSid || loading) return;

        try {
            setLoading(true);
            const res = await ownerChatService.replyToCustomer(selectedSid, inputValue);
            if (res.succeeded) {
                setMessages(prev => [...prev, res.data]);
                setInputValue('');
            }
        } catch (error) {
            console.error("Lỗi gửi tin nhắn");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('chat-container')}>
            {/* Sidebar danh sách khách hàng */}
            <div className={cx('session-list')}>
                <div className={cx('list-header')}>📍 Hội thoại khách hàng</div>
                {sessions.map(s => (
                    <div 
                        key={s.sessionId} 
                        className={cx('session-item', { active: selectedSid === s.sessionId })}
                        onClick={() => setSelectedSid(s.sessionId)}
                    >
                        <div className={cx('avatar')}><FontAwesomeIcon icon={faUserCircle} /></div>
                        <div className={cx('info')}>
                            <div className={cx('name')}>{s.customerName}</div>
                            <div className={cx('workspace')}>{s.workspaceName}</div>
                        </div>
                        {s.isActive && <FontAwesomeIcon icon={faCircle} className={cx('online-status')} />}
                    </div>
                ))}
            </div>

            {/* Cửa sổ nội dung chat */}
            <div className={cx('chat-window')}>
                {selectedSid ? (
                    <>
                        <div className={cx('window-header')}>
                            Đang chat với: <strong>{sessions.find(s => s.sessionId === selectedSid)?.customerName}</strong>
                        </div>
                        
                        <div className={cx('message-list')}>
                            {messages.map((m, index) => (
                                <div key={index} className={cx('message-row', { isOwner: m.isOwner })}>
                                    <div className={cx('bubble')}>
                                        <div className={cx('text')}>{m.content}</div>
                                        <div className={cx('time')}>{moment(m.sentAt).format('HH:mm')}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        <div className={cx('input-area')}>
                            <input 
                                type="text" 
                                placeholder="Nhập phản hồi cho khách hàng..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend} disabled={loading}>
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={cx('empty-state')}>Chọn một cuộc hội thoại để bắt đầu hỗ trợ</div>
                )}
            </div>
        </div>
    );
};

export default OwnerChatSection;