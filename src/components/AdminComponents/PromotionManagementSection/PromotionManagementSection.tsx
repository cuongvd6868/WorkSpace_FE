import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faToggleOn, 
    faToggleOff, 
    faSpinner, 
    faCheckCircle, 
    faTimesCircle,
    faTrash 
} from '@fortawesome/free-solid-svg-icons';
import styles from './PromotionManagementSection.module.scss'; 
import classNames from 'classnames/bind';

// Import services và types
import { 
    getAllPromotions, 
    createPromotion, 
    handleActivatePromotion,
    // Giả định có hàm deletePromotion nếu bạn cần (dùng cho chức năng xóa)
} from '~/services/AdminService'; 
import { 
    Promotion, 
    CreatePromotionRequest,
    DiscountType
} from '~/types/Admin'; 

const cx = classNames.bind(styles);

// Khởi tạo trạng thái cho form (Tạo Promotion)
const initialFormState: CreatePromotionRequest = {
    description: '',
    discountValue: 0,
    discountType: 'PERCENT' as DiscountType,
    startDate: '', 
    endDate: '',
    usageLimit: 1,
    minimumAmount: 0,
};

const PromotionManagementSection: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newPromotion, setNewPromotion] = useState<CreatePromotionRequest>(initialFormState);
    const [showForm, setShowForm] = useState(false);

    // --- Logic Tải Dữ liệu ---
    const fetchPromotions = async () => {
        setIsLoading(true);
        try {
            const data = await getAllPromotions();
            if (Array.isArray(data)) {
                setPromotions(data);
            } else {
                setPromotions([]);
                toast.warn('Dữ liệu khuyến mãi trả về không đúng định dạng.');
            }
        } catch (error) {
            toast.error('Lỗi tải danh sách mã khuyến mãi.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    // --- Logic Xử lý Form ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewPromotion(prev => ({ 
            ...prev, 
            // Chuyển đổi giá trị số cho các trường cụ thể
            [name]: (name === 'discountValue' || name === 'usageLimit' || name === 'minimumAmount') 
                    ? Number(value) : value 
        }));
    };

    const handleOpenForm = () => {
        setNewPromotion(initialFormState);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setNewPromotion(initialFormState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await createPromotion(newPromotion);
            toast.success('Tạo mã khuyến mãi mới thành công!');
            
            handleCloseForm();
            fetchPromotions(); // Tải lại dữ liệu
        } catch (error) {
            toast.error('Lỗi tạo mã khuyến mãi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Logic Kích hoạt/Vô hiệu hóa ---
    const handleToggleActive = async (promotion: Promotion) => {
        const newStatus = !promotion.isActive;
        const message = newStatus ? 'kích hoạt' : 'vô hiệu hóa';
        
        if (!window.confirm(`Bạn có chắc chắn muốn ${message} mã ${promotion.code} không?`)) {
            return;
        }

        try {
            // Sử dụng hàm handleActivatePromotion với ID
            await handleActivatePromotion(promotion.id); 
            
            toast.success(`${message} mã khuyến mãi thành công!`);
            fetchPromotions(); 
        } catch (error) {
            toast.error(`Lỗi khi ${message} mã khuyến mãi.`);
            console.error(error);
        }
    };
    
    // --- Hàm tiện ích: Định dạng ngày cho input HTML ---
    const formatDateTimeForInput = (dateString: string) => {
        // Cắt chuỗi ISO 8601 để phù hợp với input type="datetime-local" (YYYY-MM-DDThh:mm)
        if (!dateString) return '';
        const parts = dateString.split('T');
        if (parts.length < 2) return dateString;
        
        const datePart = parts[0];
        // Cắt bỏ phần giây và múi giờ
        const timePart = parts[1].substring(0, 5); 
        return `${datePart}T${timePart}`;
    };

    // --- Render Form Tạo Promotion ---
    const renderPromotionForm = () => (
        <div className={cx('form-overlay', { visible: showForm })}>
            <div className={cx('promotion-form')}>
                <h3 className={cx('form-title')}>Tạo Mã Khuyến Mãi Mới</h3>
                <form onSubmit={handleSubmit}>
                    <div className={cx('form-group')}>
                        <label htmlFor="description">Mô tả:</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={newPromotion.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group', 'half-width')}>
                            <label htmlFor="discountValue">Giá trị giảm:</label>
                            <input
                                type="number"
                                id="discountValue"
                                name="discountValue"
                                value={newPromotion.discountValue}
                                onChange={handleInputChange}
                                required
                                min="0"
                            />
                        </div>
                        <div className={cx('form-group', 'half-width')}>
                            <label htmlFor="discountType">Loại giảm giá:</label>
                            <select
                                id="discountType"
                                name="discountType"
                                value={newPromotion.discountType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="PERCENT">% (Phần trăm)</option>
                                <option value="AMOUNT">Giá trị cố định</option>
                            </select>
                        </div>
                    </div>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group', 'half-width')}>
                            <label htmlFor="startDate">Ngày bắt đầu:</label>
                            <input
                                type="datetime-local"
                                id="startDate"
                                name="startDate"
                                value={formatDateTimeForInput(newPromotion.startDate)}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={cx('form-group', 'half-width')}>
                            <label htmlFor="endDate">Ngày kết thúc:</label>
                            <input
                                type="datetime-local"
                                id="endDate"
                                name="endDate"
                                value={formatDateTimeForInput(newPromotion.endDate)}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                     <div className={cx('form-row')}>
                        <div className={cx('form-group', 'half-width')}>
                            <label htmlFor="usageLimit">Giới hạn sử dụng:</label>
                            <input
                                type="number"
                                id="usageLimit"
                                name="usageLimit"
                                value={newPromotion.usageLimit}
                                onChange={handleInputChange}
                                required
                                min="1"
                            />
                        </div>
                        <div className={cx('form-group', 'half-width')}>
                            <label htmlFor="minimumAmount">Đơn hàng tối thiểu:</label>
                            <input
                                type="number"
                                id="minimumAmount"
                                name="minimumAmount"
                                value={newPromotion.minimumAmount}
                                onChange={handleInputChange}
                                required
                                min="0"
                            />
                        </div>
                    </div>
                    
                    <div className={cx('form-actions')}>
                        <button type="submit" disabled={isSubmitting}>
                            <FontAwesomeIcon icon={isSubmitting ? faSpinner : faCheckCircle} spin={isSubmitting} />
                            {' Tạo Mã'}
                        </button>
                        <button type="button" onClick={handleCloseForm} className={cx('cancel-btn')} disabled={isSubmitting}>
                            <FontAwesomeIcon icon={faTimesCircle} /> Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // --- Render Bảng Promotion ---
    const renderPromotionTable = () => {
        if (isLoading) {
            return <p className={cx('loading-message')}><FontAwesomeIcon icon={faSpinner} spin /> Đang tải danh sách khuyến mãi...</p>;
        }
        
        if (promotions.length === 0) {
            return <p className={cx('empty-message')}>Chưa có mã khuyến mãi nào được tạo.</p>;
        }

        return (
            <div className={cx('table-container')}>
                <table className={cx('promotion-table')}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Mã Code</th>
                            <th>Giá trị</th>
                            <th>Giới hạn</th>
                            <th>Đã dùng</th>
                            <th>Tồn kho</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map((promo) => (
                            <tr key={promo.id}>
                                <td>{promo.id}</td>
                                <td className={cx('promo-code')}>{promo.code}</td>
                                <td>
                                    {promo.discountValue} 
                                    {promo.discountType === 'PERCENT' ? '%' : ' VND'}
                                </td>
                                <td>{promo.usageLimit}</td>
                                <td>{promo.usedCount}</td>
                                <td>{promo.remainingUsage}</td>
                                <td>{new Date(promo.startDate).toLocaleDateString()}</td>
                                <td>{new Date(promo.endDate).toLocaleDateString()}</td>
                                <td className={cx('status', { active: promo.isActive, inactive: !promo.isActive })}>
                                    {promo.isActive ? 'Kích hoạt' : 'Vô hiệu'}
                                </td>
                                <td className={cx('action-btns')}>
                                    <button 
                                        onClick={() => handleToggleActive(promo)} 
                                        className={cx('toggle-btn', { active: promo.isActive })}
                                        title={promo.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                    >
                                        <FontAwesomeIcon icon={promo.isActive ? faToggleOn : faToggleOff} />
                                    </button>
                                    <button 
                                        className={cx('delete-btn')}
                                        title="Xóa mã (Chưa hỗ trợ API)"
                                        disabled // Vô hiệu hóa nếu chưa có API xóa
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className={cx('promotion-section')}>
            <div className={cx('header-control')}>
                <button 
                    onClick={handleOpenForm} 
                    className={cx('create-btn')}
                >
                    <FontAwesomeIcon icon={faPlus} /> Tạo Mã Khuyến Mãi
                </button>
            </div>
            
            {renderPromotionTable()}
            {renderPromotionForm()}
        </div>
    );
};

export default PromotionManagementSection;