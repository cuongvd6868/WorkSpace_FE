import classNames from "classnames/bind";
import styles from './TestChat.module.scss';
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { chatService } from "~/services/ChatService"; // Kiểm tra lại đường dẫn
import { ChatMessage } from "~/types/ChatUser"; // Kiểm tra lại đường dẫn

const cx = classNames.bind(styles);

const TestChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // THAY THẾ: Lấy sessionId thật từ dự án của bạn (hoặc từ URL/State)
    const sessionId = "5c55e201-cbdf-494e-a128-26f43079916a"; 

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        // Đảm bảo token luôn được gắn vào axios trước khi Polling
        const token = localStorage.getItem("token"); // Hoặc key bạn dùng để lưu token
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        if (!sessionId) return;

        const fetchMessages = async () => {
            try {
                // Gọi API lấy lịch sử
                const data = await chatService.getChatHistory(sessionId);
                setMessages(data);
                console.log("Polling: Đã nhận dữ liệu mới");
            } catch (error: any) {
                // Nếu bị 401 (hết hạn), setInterval sẽ bị ảnh hưởng bởi Interceptor của bạn
                console.error("Lỗi Polling hoặc chưa Login:", error);
            }
        };

        // Thực hiện lần đầu
        fetchMessages();

        // Thiết lập Polling mỗi 3 giây
        const timer = setInterval(fetchMessages, 3000);

        // Cleanup: Xóa vòng lặp khi thoát màn hình này
        return () => clearInterval(timer);
    }, [sessionId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || loading) return;

        setLoading(true);
        try {
            const res = await chatService.sendMessage({ 
                sessionId: sessionId, 
                message: content 
            });
            
            if (res.succeeded) {
                setContent(""); // Xóa input sau khi gửi
                // Lưu ý: Chúng ta không cần setMessages thủ công vì 
                // vòng lặp Polling sẽ tự tải tin nhắn mới về sau tối đa 3s.
            }
        } catch (error) {
            console.error("Gửi tin nhắn lỗi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')} style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Chat Test (Polling 3s)</h2>
            
            <div 
                ref={scrollRef}
                className={cx('chat-window')} 
                style={{ 
                    height: '400px', 
                    overflowY: 'auto', 
                    border: '1px solid #ddd', 
                    padding: '15px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px'
                }}
            >
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: msg.isOwner ? 'flex-end' : 'flex-start',
                            marginBottom: '10px'
                        }}
                    >
                        <div style={{
                            padding: '8px 12px',
                            borderRadius: '15px',
                            maxWidth: '70%',
                            backgroundColor: msg.isOwner ? '#0084ff' : '#e4e6eb',
                            color: msg.isOwner ? '#fff' : '#000',
                        }}>
                            <small style={{ display: 'block', fontSize: '10px', marginBottom: '4px' }}>
                                {msg.senderName}
                            </small>
                            {msg.content}
                        </div>
                        <span style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                            {new Date(msg.sentAt).toLocaleTimeString()}
                        </span>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', marginTop: '15px', gap: '10px' }}>
                <input 
                    type="text" 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung chat..."
                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#0084ff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? "Đang gửi..." : "Gửi"}
                </button>
            </form>
        </div>
    );
}

export default TestChat;