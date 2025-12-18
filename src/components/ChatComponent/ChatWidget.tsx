import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './ChatWidget.module.scss';
import { chatService } from '~/services/ChatService';
import { ChatMessage } from '~/types/ChatUser';
import { useAuth } from '~/context/useAuth';

const cx = classNames.bind(styles);

interface ChatWidgetProps {
    workspaceId?: number;
    hostName?: string;
    isOpen: boolean;
    onClose: () => void;
    externalSessionId?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
    workspaceId, hostName, isOpen, onClose, externalSessionId 
}) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [currentSid, setCurrentSid] = useState<string | null>(externalSessionId || null);
    const [displayOwnerName, setDisplayOwnerName] = useState<string>(hostName || 'Chủ nhà');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || !user) return;
        const initChat = async () => {
            try {
                const mySessions = await chatService.getMySessions();
                const existing = mySessions?.find((s: any) => s.workspaceId === workspaceId);
                if (existing) {
                    setCurrentSid(existing.sessionId);
                    setDisplayOwnerName(hostName || existing.assignedOwnerName || 'Chủ nhà');
                }
            } catch (error) { console.error(error); }
        };
        initChat();
    }, [isOpen, workspaceId, hostName, user]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen && currentSid && user) {
            const fetchMsg = async () => {
                try {
                    const history = await chatService.getChatHistory(currentSid);
                    setMessages(history);
                } catch (e) {}
            };
            fetchMsg();
            interval = setInterval(fetchMsg, 4000);
        }
        return () => clearInterval(interval);
    }, [isOpen, currentSid, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text || !user || loading) return;
        setLoading(true);
        try {
            let sid = currentSid;
            if (!sid && workspaceId) {
                const res = await chatService.startChat({ initialMessage: text, workSpaceId: workspaceId });
                if (res.succeeded) {
                    sid = res.data.sessionId;
                    setCurrentSid(sid);
                }
            } else if (sid) {
                await chatService.sendMessage({ sessionId: sid, message: text });
            }
            setInputValue('');
            if (sid) {
                const history = await chatService.getChatHistory(sid);
                setMessages(history);
            }
        } catch (error) {} finally { setLoading(false); }
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
                                <span></span>
                                <span className={cx('owner-name')}>{displayOwnerName}</span>
                            </div>
                            <span className={cx('sub-text')}>Đang trực tuyến</span>
                        </div>
                    </div>
                    <button className={cx('close-icon')} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={cx('chat-body')} ref={scrollRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={cx('message-row', { 'is-me': !msg.isOwner })}>
                            <div className={cx('message-bubble')}>{msg.content}</div>
                        </div>
                    ))}
                </div>

                <form className={cx('footer')} onSubmit={handleSend}>
                    <div className={cx('input-pill')}>
                        <input 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)} 
                            placeholder="Nhập tin nhắn..." 
                        />
                        <button type="submit" disabled={!inputValue.trim()}><Send size={18} /></button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatWidget;