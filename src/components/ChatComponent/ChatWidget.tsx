import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './ChatWidget.module.scss';
import { chatService } from '~/services/ChatService';
import { ChatMessage } from '~/types/ChatUser';
import { useAuth } from '~/context/useAuth';
import moment from 'moment';

const cx = classNames.bind(styles);

interface ChatWidgetProps {
    workspaceId?: number;
    hostName?: string;
    isOpen: boolean;
    onClose: () => void;
    externalSessionId?: string | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
    workspaceId, hostName, isOpen, onClose, externalSessionId 
}) => {
    const { user, isLoggedIn } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [currentSid, setCurrentSid] = useState<string | null>(externalSessionId || null);
    const [displayOwnerName, setDisplayOwnerName] = useState<string>(hostName || 'Chủ nhà');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Theo dõi sự thay đổi từ Props (Khi click từ Navbar)
    useEffect(() => {
        if (externalSessionId) {
            setCurrentSid(externalSessionId);
            setMessages([]); // Xóa tin nhắn cũ ngay lập tức để tránh hiện nhầm nội dung
            setDisplayOwnerName(hostName || 'Hỗ trợ');
        }
    }, [externalSessionId, hostName]);

    // 2. Khởi tạo Chat (Dành cho trường hợp vào từ trang chi tiết Workspace)
    useEffect(() => {
        // Nếu đã có externalSessionId hoặc không mở widget thì bỏ qua
        if (!isOpen || !user || externalSessionId) return;

        const initChat = async () => {
            try {
                const mySessions = await chatService.getMySessions();
                const existing = mySessions?.find((s: any) => s.workspaceId === workspaceId);
                if (existing) {
                    setCurrentSid(existing.sessionId);
                    setDisplayOwnerName(hostName || existing.assignedOwnerName || 'Chủ nhà');
                } else {
                    // Reset nếu là workspace mới chưa từng chat
                    setCurrentSid(null);
                    setMessages([]);
                }
            } catch (error) { 
                console.error("Lỗi khởi tạo chat:", error); 
            }
        };
        initChat();
    }, [isOpen, workspaceId, hostName, user, externalSessionId]);

    // 3. Cơ chế Real-time: Tự động lấy tin nhắn khi có SID
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const fetchMsg = async () => {
            if (!currentSid) return;
            try {
                const history = await chatService.getChatHistory(currentSid);
                setMessages(history || []);
            } catch (e) {
                console.error("Lỗi đồng bộ tin nhắn:", e);
            }
        };

        if (isOpen && currentSid && isLoggedIn()) {
            fetchMsg(); // Gọi ngay lần đầu
            interval = setInterval(fetchMsg, 4000); // Polling mỗi 4 giây
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, currentSid, isLoggedIn]);

    // 4. Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ 
                top: scrollRef.current.scrollHeight, 
                behavior: 'smooth' 
            });
        }
    }, [messages]);

    // 5. Xử lý gửi tin nhắn
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text || !user || loading) return;

        setLoading(true);
        try {
            let sid = currentSid;

            // Nếu chưa có phiên chat (Chat mới từ trang chi tiết)
            if (!sid && workspaceId) {
                const res = await chatService.startChat({ 
                    initialMessage: text, 
                    workSpaceId: workspaceId 
                });
                if (res.succeeded) {
                    sid = res.data.sessionId;
                    setCurrentSid(sid);
                }
            } 
            // Nếu đã có phiên chat (Tiếp tục hội thoại)
            else if (sid) {
                await chatService.sendMessage({ 
                    sessionId: sid, 
                    message: text 
                });
            }

            setInputValue('');
            // Refresh tin nhắn ngay sau khi gửi
            if (sid) {
                const history = await chatService.getChatHistory(sid);
                setMessages(history);
            }
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={cx('fixed-wrapper')}>
            <div className={cx('chat-card')}>
                <div className={cx('header')}>
                    <div className={cx('user-meta')}>
                        <div className={cx('avatar-frame')}>
                            {displayOwnerName.charAt(0).toUpperCase()}
                            <span className={cx('online-indicator')} />
                        </div>
                        <div className={cx('name-stack')}>
                            <div className={cx('label')}>
                                <span className={cx('owner-name')}>{displayOwnerName}</span>
                            </div>
                            <span className={cx('sub-text')}>Đang trực tuyến</span>
                        </div>
                    </div>
                    <button className={cx('close-icon')} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={cx('chat-body')} ref={scrollRef}>
                    {messages.length > 0 ? (
                        messages.map((msg) => (
                            <div 
                                key={msg.id || Math.random()} 
                                className={cx('message-row', { 'is-me': !msg.isOwner })}
                            >
                                <div className={cx('message-container')}>
                                    <div className={cx('message-bubble')}>{msg.content}</div>
                                    <div className={cx('message-time')}>
                                        {moment(msg.sentAt).format('HH:mm')}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={cx('empty-chat')}>
                            Bắt đầu cuộc trò chuyện với {displayOwnerName}
                        </div>
                    )}
                </div>

                <form className={cx('footer')} onSubmit={handleSend}>
                    <div className={cx('input-pill')}>
                        <input 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)} 
                            placeholder="Nhập tin nhắn..." 
                            disabled={loading}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputValue.trim() || loading}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatWidget;