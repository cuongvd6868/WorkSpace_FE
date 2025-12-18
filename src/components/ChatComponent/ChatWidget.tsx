import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader, User, MessageCircle } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './ChatWidget.module.scss';
import { chatService } from '~/services/ChatService';
import { ChatMessage } from '~/types/ChatUser';

const cx = classNames.bind(styles);

interface ChatWidgetProps {
    workspaceId: number;
    hostName: string;
    onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ workspaceId, hostName, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem(`chat_sid_${workspaceId}`));
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    // 2. Load lịch sử chat nếu đã có SessionId từ localStorage
    useEffect(() => {
        const fetchHistory = async () => {
            if (sessionId) {
                try {
                    const history = await chatService.getChatHistory(sessionId);
                    setMessages(history);
                } catch (error) {
                    console.error("Session hết hạn hoặc không tồn tại");
                    setSessionId(null);
                    localStorage.removeItem(`chat_sid_${workspaceId}`);
                }
            }
        };
        fetchHistory();
    }, [sessionId, workspaceId]);

    // 3. Polling: Tự động lấy tin nhắn mới mỗi 4 giây
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sessionId) {
            interval = setInterval(async () => {
                try {
                    const history = await chatService.getChatHistory(sessionId);
                    if (history.length !== messages.length) {
                        setMessages(history);
                    }
                } catch (e) {
                    console.error("Lỗi cập nhật tin nhắn");
                }
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [sessionId, messages.length]);

    // 4. Xử lý Gửi tin nhắn
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text || loading) return;

        setLoading(true);
        try {
            if (!sessionId) {
                // CHƯA CÓ SESSION: Khởi tạo chat lần đầu
                const res = await chatService.startChat({
                    initialMessage: text,
                    workSpaceId: workspaceId
                });
                if (res.succeeded) {
                    const newSid = res.data.sessionId;
                    setSessionId(newSid);
                    localStorage.setItem(`chat_sid_${workspaceId}`, newSid);
                    const history = await chatService.getChatHistory(newSid);
                    setMessages(history);
                }
            } else {
                // ĐÃ CÓ SESSION: Gửi tin nhắn tiếp theo
                const res = await chatService.sendMessage({
                    sessionId: sessionId,
                    message: text
                });
                if (res.succeeded) {
                    setMessages(prev => [...prev, res.data]);
                }
            }
            setInputValue('');
        } catch (error) {
            alert("Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('fixed-container')}>
            <div className={cx('widget-wrapper')}>
                {/* Header */}
                <div className={cx('widget-header')}>
                    <div className={cx('user-info')}>
                        <div className={cx('avatar-stack')}>
                            <div className={cx('avatar')}>
                                <User size={20} color="#fff" />
                            </div>
                            <div className={cx('status-dot')}></div>
                        </div>
                        <div className={cx('text-details')}>
                            <span className={cx('name')}>{hostName}</span>
                            <span className={cx('status')}>Đang trực tuyến</span>
                        </div>
                    </div>
                    <button className={cx('close-btn')} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Message List */}
                <div className={cx('message-list')} ref={scrollRef}>
                    {messages.length === 0 && !loading && (
                        <div className={cx('empty-state')}>
                            <div className={cx('icon')}><MessageCircle size={40} /></div>
                            <p>Hãy nhắn tin để nhận tư vấn từ <strong>{hostName}</strong></p>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div key={msg.id} className={cx('message-row', { 'is-me': !msg.isOwner })}>
                            <div className={cx('bubble-container')}>
                                <div className={cx('bubble')}>
                                    {msg.content}
                                </div>
                                <span className={cx('time')}>
                                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <form className={cx('input-area')} onSubmit={handleSend}>
                    <div className={cx('input-wrapper')}>
                        <input 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                        />
                        <button type="submit" className={cx('send-btn')} disabled={loading || !inputValue.trim()}>
                            {loading ? <Loader className={cx('spin')} size={18} /> : <Send size={18} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatWidget;