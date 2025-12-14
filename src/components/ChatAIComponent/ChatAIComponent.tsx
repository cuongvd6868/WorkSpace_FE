import React, { useState, FormEvent, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ChatAIComponent.module.scss';
import { ChatbotResponse, ChatMessage } from '~/types/Chat';
import { getChatResponse } from '~/services/ChatAIService'; 
import RecommendationCard from './RecommendationCard/RecommendationCard'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faPaperPlane, faRobot, faUser } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const ChatAIComponent: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Hàm xử lý định dạng tin nhắn
  const formatMessage = (text: string) => {
    if (!text) return { __html: '' };
    
    let htmlContent = text.replace(/\n/g, '<br />'); 
    htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>');
    
    htmlContent = htmlContent.replace(/  - /g, '<span class="list-indent">↳ </span>');

    return { __html: htmlContent };
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const userMessageText = inputMessage.trim();
    if (!userMessageText) return;

    // 1. Thêm tin nhắn của người dùng
    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage(''); 

    setIsLoading(true);
    setError(null);

    try {
      const data: ChatbotResponse = await getChatResponse(userMessageText); 
      
      // 2. Tạo tin nhắn AI
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.message,
        recommendations: data.recommendations,
        timestamp: new Date(),
      };
      
      // 3. Thêm tin nhắn AI
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      setError('Lỗi kết nối hoặc xử lý API. Vui lòng kiểm tra console.');
      setMessages(prev => [...prev, {
          id: Date.now() + 2,
          sender: 'ai',
          text: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.',
          timestamp: new Date(),
      } as ChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={cx('wrapper')}> 
      
      <div className={cx('chat-body')}>
        {messages.length === 0 && !isLoading && !error && (
            <div className={cx('empty-state')}>
              👋 Chào bạn, tôi là trợ lý tìm kiếm không gian làm việc thông minh. Hãy cho tôi biết nhu cầu của bạn!
            </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={msg.id} className={cx('message-row', msg.sender, { 'fade-in': true })}>
            
            {msg.sender === 'ai' && <div className={cx('avatar', 'ai-avatar')}><FontAwesomeIcon icon={faRobot} className="ai-icon" /></div>}
            
            <div className={cx('message-bubble', msg.sender)}>
              
              <p 
                className={cx('message-text')} 
                dangerouslySetInnerHTML={formatMessage(msg.text)} 
              />
              
              {msg.sender === 'ai' && msg.recommendations && msg.recommendations.length > 0 && (
                <div className={cx('recommendations-container')}>
                    <h4 className={cx('recommendations-title')}>
                        ✨ {msg.recommendations.length} Đề xuất hàng đầu:
                    </h4>
                    <div className={cx('recommendations-list')}>
                        {msg.recommendations.map((rec, recIndex) => (
                          <RecommendationCard 
                            key={rec.workSpaceId || recIndex} 
                            recommendation={rec} 
                          />
                        ))}
                    </div>
                </div>
              )}
              
            </div>
            {msg.sender === 'user' && <div className={cx('avatar', 'user-avatar')}><FontAwesomeIcon icon={faUser} className="ai-icon" /></div>}
          </div>
        ))}

        {/* Loading Bubble */}
        {isLoading && (
            <div className={cx('message-row', 'ai', 'fade-in')}>
                <div className={cx('avatar', 'ai-avatar')}><FontAwesomeIcon icon={faRobot} className="ai-icon" /></div>
                <div className={cx('message-bubble', 'ai', 'loading-bubble')}>
                    <span>Đang tìm kiếm</span>
                    <span className={cx('dot-flashing')}></span>
                </div>
            </div>
        )}

        {error && <div className={cx('error')}>⚠️ {error}</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Khung đầu vào */}
<div className={cx('chat-input-area')}>
  <form className={cx('chatForm')} onSubmit={handleSendMessage}>
    <input
      type="text"
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      placeholder="Nhập yêu cầu tìm kiếm không gian làm việc..."
      disabled={isLoading}
      className={cx('chatInput')}
    />

    <button type="submit" disabled={isLoading || !inputMessage.trim()} className={cx('sendBtn')}>
      <FontAwesomeIcon icon={faPaperPlane} />
    </button>
  </form>
</div>


    </div>
  );
};

export default ChatAIComponent;