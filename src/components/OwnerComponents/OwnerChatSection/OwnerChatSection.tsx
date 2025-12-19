import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './OwnerChatSection.module.scss';
import { ownerChatService } from '~/services/ChatService';
import { OwnerChatSession, OwnerChatMessage } from '~/types/ChatUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUserCircle, faCircle, faInbox } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const cx = classNames.bind(styles);

const OwnerChatSection: React.FC = () => {
    const [sessions, setSessions] = useState<OwnerChatSession[]>([]);
    const [selectedSid, setSelectedSid] = useState<string | null>(null);
    const [messages, setMessages] = useState<OwnerChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Lấy danh sách sessions
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
    }, []);

    // 2. Lấy tin nhắn và setup polling
    useEffect(() => {
        if (!selectedSid) return;

        const fetchMessages = async () => {
            try {
                const data = await ownerChatService.getOwnerChatHistory(selectedSid);
                setMessages(data);
            } catch (error) {
                console.error("Lỗi lấy tin nhắn:", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 4000); 
        return () => clearInterval(interval);
    }, [selectedSid]);

    // 3. Cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || !selectedSid || loading) return;

        const currentInput = inputValue;
        setInputValue(''); // Xóa nhanh input để tạo cảm giác mượt

        try {
            setLoading(true);
            const res = await ownerChatService.replyToCustomer(selectedSid, currentInput);
            if (res.succeeded) {
                setMessages(prev => [...prev, res.data]);
            }
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
            setInputValue(currentInput); // Trả lại text nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    const activeSession = sessions.find(s => s.sessionId === selectedSid);

    return (
        <div className={cx('chat-container')}>
            {/* Sidebar */}
            <div className={cx('session-list')}>
                <div className={cx('list-header')}>Hội thoại hỗ trợ</div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {sessions.map(s => (
                        <div 
                            key={s.sessionId} 
                            className={cx('session-item', { active: selectedSid === s.sessionId })}
                            onClick={() => setSelectedSid(s.sessionId)}
                        >
                            <div className={cx('avatar')}><FontAwesomeIcon icon={faUserCircle} /></div>
                            <div className={cx('info')}>
                                <p className={cx('name')}>{s.customerName}</p>
                                <p className={cx('workspace')}>{s.workspaceName}</p>
                            </div>
                            {s.isActive && <FontAwesomeIcon icon={faCircle} className={cx('online-status')} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat */}
            <div className={cx('chat-window')}>
                {selectedSid ? (
                    <>
                        <div className={cx('window-header')}>
                            <div className={cx('header-user-info')}>
                                <span>Đang hỗ trợ</span>
                                <strong>{activeSession?.customerName}</strong>
                            </div>
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
                                placeholder="Nhập tin nhắn phản hồi..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend} disabled={loading || !inputValue.trim()}>
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={cx('empty-state')}>
                        <FontAwesomeIcon icon={faInbox} size="3x" />
                        <p>Chọn một cuộc hội thoại để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerChatSection;