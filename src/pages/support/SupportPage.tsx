import React, { useState, useCallback } from "react";
import styles from './SupportPage.module.scss';
import classNames from "classnames/bind";
import { CreateTicketPayload } from "~/types/Ticket";
import { createSupportTicket } from "~/services/SupportService";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope,
  faClock,
  faHeadset,
  faCheckCircle,
  faCode,
  faCreditCard,
  faLightbulb,
  faFileAlt,
  faPaperPlane,
  faSpinner,
  faExclamationCircle,
  faComments
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const TICKET_TYPES = [
    { 
      id: 1, 
      name: "Vấn đề kỹ thuật", 
      icon: faCode, 
      color: "#4361ee" 
    },

    { 
      id: 3, 
      name: "Yêu cầu tính năng mới", 
      icon: faLightbulb, 
      color: "#f72585" 
    },

];

const SupportPage: React.FC = () => {
    const [formData, setFormData] = useState<CreateTicketPayload>({
        subject: '',
        message: '',
        ticketType: TICKET_TYPES[0].id,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [selectedType, setSelectedType] = useState(TICKET_TYPES[0].id);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'ticketType' ? parseInt(value) : value,
        }));
        if (name === 'ticketType') {
            setSelectedType(parseInt(value));
        }
        setMessage(null);
    }, []);

    const handleTypeSelect = (typeId: number) => {
        setFormData(prev => ({
            ...prev,
            ticketType: typeId,
        }));
        setSelectedType(typeId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (!formData.subject.trim() || !formData.message.trim()) {
            setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ Chủ đề và Nội dung.' });
            setIsLoading(false);
            return;
        }

        try {
            await createSupportTicket(formData);
            setMessage({ 
                type: 'success', 
                text: 'Yêu cầu hỗ trợ của bạn đã được gửi thành công! Đội ngũ hỗ trợ sẽ liên hệ với bạn trong thời gian sớm nhất.' 
            });
            setFormData({
                subject: '',
                message: '',
                ticketType: TICKET_TYPES[0].id,
            });
            setSelectedType(TICKET_TYPES[0].id);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: 'Đã xảy ra lỗi trong quá trình gửi yêu cầu. Vui lòng kiểm tra kết nối và thử lại sau.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedTypeData = TICKET_TYPES.find(type => type.id === selectedType);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('support-container')}>
                {/* Header Section */}
                <div className={cx('header-section')}>
                    <div className={cx('header-icon')}>
                        <FontAwesomeIcon icon={faComments} size="2x" />
                    </div>
                    <div>
                        <h1 className={cx('title')}>Trung Tâm Hỗ Trợ</h1>
                        <p className={cx('subtitle')}>
                            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy mô tả chi tiết vấn đề bạn gặp phải.
                        </p>
                    </div>
                </div>

                {/* Contact Info Cards */}
                <div className={cx('info-grid')}>
                    <div className={cx('info-card')}>
                        <div className={cx('info-icon', 'response-time')}>
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                        <h3>Thời Gian Phản Hồi</h3>
                        <p>Trong vòng 24 giờ làm việc</p>
                    </div>
                    <div className={cx('info-card')}>
                        <div className={cx('info-icon', 'support-team')}>
                            <FontAwesomeIcon icon={faHeadset} />
                        </div>
                        <h3>Đội Ngũ Hỗ Trợ</h3>
                        <p>Chuyên gia kỹ thuật 24/7</p>
                    </div>
                    <div className={cx('info-card')}>
                        <div className={cx('info-icon', 'success-rate')}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <h3>Tỷ Lệ Thành Công</h3>
                        <p>98% vấn đề được giải quyết</p>
                    </div>
                </div>

                {/* Main Form Section */}
                <div className={cx('form-wrapper')}>
                    {/* Ticket Type Selection */}
                    <div className={cx('type-section')}>
                        <h2 className={cx('section-title')}>
                            <FontAwesomeIcon icon={faFileAlt} className={cx('title-icon')} />
                            Loại Yêu Cầu
                        </h2>
                        <div className={cx('type-grid')}>
                            {TICKET_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={cx('type-card', { active: selectedType === type.id })}
                                    onClick={() => handleTypeSelect(type.id)}
                                    style={{ 
                                        borderColor: selectedType === type.id ? type.color : 'transparent'
                                    } as React.CSSProperties}
                                >
                                    <div className={cx('type-icon')} style={{ color: type.color }}>
                                        <FontAwesomeIcon icon={type.icon} />
                                    </div>
                                    <span className={cx('type-name')}>{type.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notification Area */}
                    {message && (
                        <div className={cx('alert-container', message.type)}>
                            <div className={cx('alert-icon')}>
                                <FontAwesomeIcon 
                                    icon={message.type === 'success' ? faCheckCircle : faExclamationCircle} 
                                />
                            </div>
                            <div className={cx('alert-content')}>
                                <h4>{message.type === 'success' ? 'Thành Công!' : 'Có Lỗi Xảy Ra'}</h4>
                                <p>{message.text}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form className={cx('support-form')} onSubmit={handleSubmit}>
                        <div className={cx('form-grid')}>
                            {/* Subject Field */}
                            <div className={cx('form-group', 'full-width')}>
                                <label htmlFor="subject" className={cx('form-label')}>
                                    <span className={cx('label-text')}>Chủ Đề</span>
                                    <span className={cx('required')}>*</span>
                                </label>
                                <input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Lỗi đăng nhập trên ứng dụng..."
                                    required
                                    className={cx('input-field')}
                                    maxLength={100}
                                />
                                <div className={cx('input-footer')}>
                                    <span className={cx('char-count')}>
                                        {formData.subject.length}/100 ký tự
                                    </span>
                                </div>
                            </div>

                            {/* Message Field */}
                            <div className={cx('form-group', 'full-width')}>
                                <label htmlFor="message" className={cx('form-label')}>
                                    <span className={cx('label-text')}>Mô Tả Chi Tiết</span>
                                    <span className={cx('required')}>*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={8}
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder={`Vui lòng cung cấp thông tin chi tiết về vấn đề:
• Mô tả vấn đề gặp phải
• Các bước tái hiện lỗi
• Thiết bị và trình duyệt đang sử dụng`}
                                    required
                                    className={cx('textarea-field')}
                                    maxLength={2000}
                                />
                                <div className={cx('textarea-footer')}>
                                    <div className={cx('hint')}>
                                        <FontAwesomeIcon icon={faLightbulb} className={cx('hint-icon')} />
                                        Cung cấp càng nhiều thông tin, chúng tôi càng hỗ trợ bạn nhanh hơn
                                    </div>
                                    <span className={cx('char-count')}>
                                        {formData.message.length}/2000 ký tự
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Selected Type Indicator */}
                        {selectedTypeData && (
                            <div className={cx('selected-type-indicator')}>
                                <div className={cx('indicator-icon')} style={{ color: selectedTypeData.color }}>
                                    <FontAwesomeIcon icon={selectedTypeData.icon} />
                                </div>
                                <div className={cx('indicator-content')}>
                                    <span className={cx('indicator-label')}>Đang chọn:</span>
                                    <span className={cx('indicator-value')} style={{ color: selectedTypeData.color }}>
                                        {selectedTypeData.name}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className={cx('submit-section')}>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className={cx('submit-button', { loading: isLoading })}
                            >
                                {isLoading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className={cx('loading-icon')} />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faPaperPlane} className={cx('send-icon')} />
                                        Gửi Yêu Cầu Hỗ Trợ
                                    </>
                                )}
                            </button>
                            <p className={cx('submit-hint')}>
                                Nhấp vào "Gửi Yêu Cầu Hỗ Trợ" đồng nghĩa với việc bạn đồng ý với 
                                <a href="/terms" className={cx('terms-link')}> Điều khoản dịch vụ</a> của chúng tôi
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SupportPage;