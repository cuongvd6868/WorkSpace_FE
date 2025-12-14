import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import { PostRequest, PostUpdateRequest } from '~/types/Posts';
import { handleCreatePost, handleUpdatePost } from '~/services/PostService';
import { toast } from 'react-toastify';
import styles from './PostFormModal.module.scss';

// Nhập Markdown Editor
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css'; 
import MarkdownIt from 'markdown-it';

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faEdit,
  faPlus,
  faImage,
  faStar,
  faUpload,
  faEye,
  faEyeSlash,
  faSave,
  faHeading,
  faFileAlt,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const mdParser = new MarkdownIt();

interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
  postData: PostUpdateRequest | PostRequest | null;
  onSuccess?: () => void;
}

const defaultNewPost: PostRequest = { 
  title: '', 
  contentMarkdown: '', 
  contentHtml: '', 
  imageData: '', 
  isFeatured: false 
};

const PostFormModal: React.FC<PostFormProps> = ({ 
  isOpen, 
  onClose, 
  postData,
  onSuccess 
}) => {
  const isEditing = postData && 'id' in postData;
  
  const [formData, setFormData] = useState<PostRequest>(defaultNewPost);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (postData) {
      const data = postData as PostRequest;
      setFormData(data);
      setCharCount(data.contentMarkdown?.length || 0);
      
      // Nếu có imageData, hiển thị preview
      if (data.imageData && typeof data.imageData === 'string' && data.imageData.startsWith('http')) {
        setImagePreview(data.imageData);
      }
    } else {
      setFormData(defaultNewPost);
      setCharCount(0);
      setImagePreview(null);
    }
    setImageFile(undefined);
  }, [postData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(undefined);
      if (!formData.imageData) {
        setImagePreview(null);
      }
    }
  };

  const handleEditorChange = ({ text, html }: { text: string; html: string; }) => {
    setFormData(prev => ({
      ...prev,
      contentMarkdown: text || '',
      contentHtml: html || '',
    }));
    setCharCount(text?.length || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate - sử dụng optional chaining để tránh lỗi undefined
    if (!formData.title?.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết');
      return;
    }
    
    if (!formData.contentMarkdown?.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết');
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const updateData: PostUpdateRequest = { 
          ...formData, 
          id: (postData as PostUpdateRequest).id 
        };
        await handleUpdatePost(updateData, imageFile);
        toast.success(`✅ Cập nhật bài viết "${formData.title}" thành công!`);
      } else {
        await handleCreatePost(formData, imageFile);
        toast.success(`✨ Tạo bài viết mới "${formData.title}" thành công!`);
      }
      
      onClose();
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData(defaultNewPost);
      setImageFile(undefined);
      setImagePreview(null);
      setCharCount(0);
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error(isEditing 
        ? "❌ Cập nhật thất bại. Vui lòng thử lại!" 
        : "❌ Tạo bài viết thất bại. Vui lòng thử lại!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal-container')} ref={modalRef}>
        {/* Header */}
        <div className={cx('modal-header')}>
          <div className={cx('header-content')}>
            <div className={cx('header-icon')}>
              <FontAwesomeIcon 
                icon={isEditing ? faEdit : faPlus} 
                className={cx('header-icon-svg')}
              />
            </div>
            <div>
              <h2 className={cx('modal-title')}>
                {isEditing ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
              </h2>
              <p className={cx('modal-subtitle')}>
                {isEditing 
                  ? 'Cập nhật thông tin bài viết của bạn' 
                  : 'Bắt đầu sáng tạo nội dung mới của bạn'
                }
              </p>
            </div>
          </div>
          <button 
            className={cx('close-button')} 
            onClick={onClose}
            aria-label="Đóng"
            type="button"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={cx('modal-form')}>
          <div className={cx('form-scroll')}>
            {/* Tiêu đề */}
            <div className={cx('form-section')}>
              <div className={cx('section-header')}>
                <FontAwesomeIcon icon={faHeading} className={cx('section-icon')} />
                <h3 className={cx('section-title')}>Tiêu đề bài viết</h3>
              </div>
              <div className={cx('form-group')}>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title || ''}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề hấp dẫn cho bài viết của bạn..."
                  className={cx('input-field')}
                  maxLength={200}
                  required
                />
                <div className={cx('input-info')}>
                  <span className={cx('char-count', { 
                    'max': (formData.title?.length || 0) >= 200 
                  })}>
                    {(formData.title?.length || 0)}/200 ký tự
                  </span>
                </div>
              </div>
            </div>

            {/* Nội dung Markdown */}
            <div className={cx('form-section')}>
              <div className={cx('section-header')}>
                <div className={cx('section-title-wrapper')}>
                  <FontAwesomeIcon icon={faFileAlt} className={cx('section-icon')} />
                  <h3 className={cx('section-title')}>Nội dung bài viết</h3>
                  <button
                    type="button"
                    className={cx('preview-toggle')}
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <>
                        <FontAwesomeIcon icon={faEyeSlash} /> Ẩn xem trước
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faEye} /> Xem trước
                      </>
                    )}
                  </button>
                </div>
                <span className={cx('section-required')}>Bắt buộc</span>
              </div>
              
              <div className={cx('editor-wrapper', { 'preview-mode': showPreview })}>
                <div className={cx('editor-container', { 'hidden': showPreview })}>
                  <MdEditor 
                    style={{ 
                      height: '400px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }} 
                    renderHTML={(text) => mdParser.render(text || '')} 
                    value={formData.contentMarkdown || ''}
                    onChange={handleEditorChange}
                    placeholder="Viết nội dung của bạn ở đây... Hỗ trợ Markdown!"
                  />
                </div>
                {showPreview && (
                  <div className={cx('preview-container')}>
                    <div className={cx('preview-content')}>
                      <h4 className={cx('preview-title')}>
                        <FontAwesomeIcon icon={faEye} /> Xem trước
                      </h4>
                      <div 
                        className={cx('preview-html')}
                        dangerouslySetInnerHTML={{ __html: formData.contentHtml || '' }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className={cx('editor-footer')}>
                <div className={cx('footer-left')}>
                  <span className={cx('hint-text')}>
                    💡 <strong>Mẹo:</strong> Sử dụng Markdown để định dạng văn bản
                  </span>
                </div>
                <div className={cx('footer-right')}>
                  <span className={cx('char-count', { 
                    'warning': charCount > 5000, 
                    'danger': charCount > 10000 
                  })}>
                    {charCount.toLocaleString()} ký tự
                  </span>
                </div>
              </div>
            </div>

            {/* Ảnh đại diện */}
            <div className={cx('form-section')}>
              <div className={cx('section-header')}>
                <FontAwesomeIcon icon={faImage} className={cx('section-icon')} />
                <h3 className={cx('section-title')}>Ảnh đại diện</h3>
              </div>
              
              <div className={cx('image-upload-area')}>
                {imagePreview ? (
                  <div className={cx('image-preview')}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className={cx('preview-image')}
                    />
                    <div className={cx('image-overlay')}>
                      <button 
                        type="button" 
                        className={cx('change-image-btn')}
                        onClick={() => document.getElementById('imageFile')?.click()}
                      >
                        <FontAwesomeIcon icon={faUpload} /> Thay đổi ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={cx('upload-placeholder')}
                    onClick={() => document.getElementById('imageFile')?.click()}
                  >
                    <FontAwesomeIcon icon={faUpload} className={cx('upload-icon')} />
                    <div className={cx('upload-text')}>
                      <p className={cx('upload-title')}>Tải lên ảnh đại diện</p>
                      <p className={cx('upload-subtitle')}>
                        Kéo thả hoặc click để chọn file
                      </p>
                      <p className={cx('upload-hint')}>
                        JPG, PNG, GIF • Tối đa 5MB
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  id="imageFile"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={cx('file-input')}
                />
                
                {isEditing && formData.imageData && !imageFile && !imagePreview && (
                  <div className={cx('current-image-info')}>
                    <FontAwesomeIcon icon={faImage} />
                    <span>Ảnh hiện tại (ID: <strong>{formData.imageData}</strong>)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tùy chọn */}
            <div className={cx('form-section')}>
              <div className={cx('section-header')}>
                <FontAwesomeIcon icon={faStar} className={cx('section-icon')} />
                <h3 className={cx('section-title')}>Tùy chọn</h3>
              </div>
              
              <div className={cx('options-grid')}>
                <div className={cx('option-item')}>
                  <div className={cx('option-content')}>
                    <div className={cx('option-icon', { 'featured': formData.isFeatured })}>
                      <FontAwesomeIcon icon={faStar} />
                    </div>
                    <div className={cx('option-text')}>
                      <label htmlFor="isFeatured" className={cx('option-label')}>
                        Bài viết nổi bật
                      </label>
                      <p className={cx('option-description')}>
                        Hiển thị bài viết ở vị trí nổi bật trên trang chủ
                      </p>
                    </div>
                  </div>
                  <div className={cx('option-switch')}>
                    <input
                      id="isFeatured"
                      name="isFeatured"
                      type="checkbox"
                      checked={formData.isFeatured || false}
                      onChange={handleChange}
                      className={cx('switch-input')}
                    />
                    <label 
                      htmlFor="isFeatured" 
                      className={cx('switch-label', { 'checked': formData.isFeatured })}
                    >
                      <span className={cx('switch-handle')} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer với nút hành động */}
          <div className={cx('modal-footer')}>
            <div className={cx('footer-left')}>
              <span className={cx('form-status')}>
                {isSubmitting ? (
                  <span className={cx('status-loading')}>
                    <span className={cx('spinner')}></span>
                    Đang xử lý...
                  </span>
                ) : (
                  <span className={cx('status-ready')}>
                    <FontAwesomeIcon icon={faCheck} /> Sẵn sàng {isEditing ? 'cập nhật' : 'tạo mới'}
                  </span>
                )}
              </span>
            </div>
            <div className={cx('footer-right')}>
              <button 
                type="button" 
                onClick={onClose}
                className={cx('cancel-button')}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                disabled={isSubmitting || !formData.title?.trim() || !formData.contentMarkdown?.trim()}
                className={cx('submit-button', {
                  'editing': isEditing,
                  'creating': !isEditing,
                  'disabled': isSubmitting || !formData.title?.trim() || !formData.contentMarkdown?.trim()
                })}
              >
                {isSubmitting ? (
                  <>
                    <span className={cx('button-spinner')}></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    {isEditing ? 'Cập nhật bài viết' : 'Tạo bài viết mới'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostFormModal;