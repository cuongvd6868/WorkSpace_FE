import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './FloatingChatWidget.module.scss';
import ChatComponent from '../ChatComponent/ChatComponent'; 

const cx = classNames.bind(styles);

const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cx('floating-wrapper')}>
      
      {/* Nút bật/tắt (Bubble Icon) */}
      <button 
        className={cx('chat-toggle-button', { 'is-open': isOpen })}
        onClick={toggleChat}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        {/* Dùng icon X khi mở, icon chat khi đóng */}
        {isOpen ? <span className={cx('close-icon')}>✕</span> : <span className={cx('chat-icon')}>💬</span>} 
      </button>

      {/* Box Chat */}
      <div className={cx('chat-box-container', { 'is-open': isOpen })}>
        <div className={cx('chat-header')}>
            <span className={cx('header-title')}>
                <span className={cx('dot')}></span> Trợ lý AI Tìm kiếm
            </span>
            <button 
                className={cx('close-button')} 
                onClick={toggleChat}
                aria-label="Đóng"
            >
                ✕
            </button>
        </div>
        <ChatComponent /> 
      </div>
    </div>
  );
};

export default FloatingChatWidget;