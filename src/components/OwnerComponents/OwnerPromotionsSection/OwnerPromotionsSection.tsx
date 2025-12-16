// OwnerPromotionsSection.tsx (Phiên bản Nâng cấp)

import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faToggleOn, 
    faToggleOff, 
    faSpinner, 
    faCalendarAlt, // Icon mới cho ngày tháng
    faDollarSign, // Icon mới cho giá trị giảm
    faPercent, // Icon mới cho loại giảm giá
    faCode, // Icon mới cho Code
    faTimes, // Icon mới cho hủy
    faSave, // Icon mới cho lưu
    faClipboardList // Icon mới cho tiêu đề chính
} from '@fortawesome/free-solid-svg-icons';
import { PromotionOwnerView, PromotionsRequest } from '~/types/Owner';
import { getAllOwnerPromotions, createPromotionsOwner, handleActivePromotion } from '~/services/OwnerService';

import styles from './OwnerPromotionsSection.module.scss';
const cx = classNames.bind(styles);

// Component con cho Form tạo mới (Nâng cấp)
const CreatePromotionForm: React.FC<{ onSuccess: () => void; onCancel: () => void }> = ({ onSuccess, onCancel }) => {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<Omit<PromotionsRequest, 'usedCount' | 'remainingUsage'>>({
        description: '',
        discountValue: 0,
        discountType: 'PERCENT',
        startDate: today, // Đặt mặc định là ngày hiện tại
        endDate: '',
        usageLimit: 1,
        isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const { discountValue, usageLimit, startDate, endDate } = formData;
        
        if (discountValue <= 0) newErrors.discountValue = "Giá trị giảm giá phải lớn hơn 0.";
        if (usageLimit < 1) newErrors.usageLimit = "Giới hạn sử dụng phải lớn hơn hoặc bằng 1.";
        
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        if (start >= end) newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại các trường trong form.");
            return;
        }

        setIsSubmitting(true);
        try {
            const requestData: PromotionsRequest = {
                ...formData,
                usedCount: 0,
                remainingUsage: formData.usageLimit,
            };

            await createPromotionsOwner(requestData);
            toast.success("Mã Promotion mới đã được tạo thành công!");
            onSuccess();
        } catch (error) {
            toast.error("Tạo Promotion thất bại. Vui lòng kiểm tra kết nối API.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cx('promotion-form-card')}>
            <div className={cx('form-header')}>
                <FontAwesomeIcon icon={faPlus} className={cx('header-icon')} />
                <h3>Tạo Mã Khuyến Mãi Mới</h3>
            </div>
            
            <form onSubmit={handleSubmit} className={cx('promotion-form')}>
                {/* Dòng 1: Mô tả & Loại giảm giá */}
                <div className={cx('form-group', 'full-width')}>
                    <label htmlFor="description">Mô tả Khuyến mãi:</label>
                    <input 
                        type="text" 
                        id="description" 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        placeholder="Ví dụ: Giảm 20% cho 100 khách đầu tiên"
                        required 
                    />
                </div>

                {/* Dòng 2: Giá trị và Loại */}
                <div className={cx('form-group')}>
                    <label htmlFor="discountValue">
                        <FontAwesomeIcon icon={faDollarSign} /> Giá trị Giảm
                    </label>
                    <input 
                        type="number" 
                        id="discountValue" 
                        name="discountValue" 
                        value={formData.discountValue} 
                        onChange={handleChange} 
                        min="1"
                        required 
                    />
                     {errors.discountValue && <p className={cx('error-message')}>{errors.discountValue}</p>}
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="discountType">
                        <FontAwesomeIcon icon={faPercent} /> Loại Giảm Giá
                    </label>
                    <select id="discountType" name="discountType" value={formData.discountType} onChange={handleChange}>
                        <option value="PERCENT">Phần trăm (%)</option>
                        <option value="AMOUNT">Số tiền cố định (VND)</option>
                    </select>
                </div>

                {/* Dòng 3: Ngày bắt đầu và Ngày kết thúc */}
                <div className={cx('form-group')}>
                    <label htmlFor="startDate">
                        <FontAwesomeIcon icon={faCalendarAlt} /> Ngày Bắt Đầu
                    </label>
                    <input 
                        type="date" 
                        id="startDate" 
                        name="startDate" 
                        value={formData.startDate} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="endDate">
                        <FontAwesomeIcon icon={faCalendarAlt} /> Ngày Kết Thúc
                    </label>
                    <input 
                        type="date" 
                        id="endDate" 
                        name="endDate" 
                        value={formData.endDate} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.endDate && <p className={cx('error-message')}>{errors.endDate}</p>}
                </div>

                {/* Dòng 4: Giới hạn sử dụng */}
                <div className={cx('form-group', 'full-width')}>
                    <label htmlFor="usageLimit">
                        <FontAwesomeIcon icon={faCode} /> Giới Hạn Số Lần Sử Dụng
                    </label>
                    <input 
                        type="number" 
                        id="usageLimit" 
                        name="usageLimit" 
                        value={formData.usageLimit} 
                        onChange={handleChange} 
                        min="1" 
                        required 
                    />
                    {errors.usageLimit && <p className={cx('error-message')}>{errors.usageLimit}</p>}
                </div>

                {/* Hành động */}
                <div className={cx('form-actions', 'full-width')}>
                    <button type="button" onClick={onCancel} disabled={isSubmitting} className={cx('cancel-btn')}>
                        <FontAwesomeIcon icon={faTimes} /> Hủy
                    </button>
                    <button type="submit" disabled={isSubmitting} className={cx('submit-btn')}>
                        {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />} 
                        {isSubmitting ? ' Đang Tạo...' : ' Lưu & Tạo Promotion'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Component Chính
const OwnerPromotionsSection: React.FC = () => {
    const [promotions, setPromotions] = useState<PromotionOwnerView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const fetchPromotions = async () => {
        setIsLoading(true);
        try {
            const data = await getAllOwnerPromotions();
            setPromotions(data as unknown as PromotionOwnerView[]);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách Promotion. Vui lòng thử lại.");
            setPromotions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, [reloadKey]);

    const handleToggleActive = async (id: number, isActive: boolean) => {
        const action = isActive ? 'Khóa (Hủy kích hoạt)' : 'Kích hoạt';
        if (!window.confirm(`Bạn có chắc chắn muốn ${action} Promotion ID ${id} không?`)) {
            return;
        }

        try {
            await handleActivePromotion(id);
            toast.success(`${action} thành công!`);
            setReloadKey(prev => prev + 1);
        } catch (error) {
            toast.error(`${action} thất bại.`);
        }
    };

    const formatDiscount = (value: number, type: string) => {
        if (type === 'PERCENT') {
            return <span className={cx('discount-value', 'percent')}>{value}%</span>;
        }
        return <span className={cx('discount-value', 'amount')}>{value.toLocaleString('vi-VN')} VND</span>;
    };

    if (isCreating) {
        return (
            <div className={cx('create-mode')}>
                <CreatePromotionForm
                    onSuccess={() => {
                        setIsCreating(false);
                        setReloadKey(prev => prev + 1);
                    }}
                    onCancel={() => setIsCreating(false)}
                />
            </div>
        );
    }


    return (
        <div className={cx('promotions-management', 'card')}>
             <div className={cx('page-title')}>
                <FontAwesomeIcon icon={faClipboardList} className={cx('title-icon')} />
                <h2>QUẢN LÝ MÃ KHUYẾN MÃI (PROMOTIONS)</h2>
            </div>
            
            <div className={cx('header-with-action')}>
                <button
                    className={cx('add-btn')}
                    onClick={() => setIsCreating(true)}
                >
                    <FontAwesomeIcon icon={faPlus} /> Tạo Promotion Mới
                </button>
            </div>

            {isLoading ? (
                <div className={cx('loading')}>
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" /> Đang tải dữ liệu Promotion...
                </div>
            ) : promotions.length === 0 ? (
                <div className={cx('no-data')}>
                    <p>Chưa có mã khuyến mãi nào được tạo.</p>
                    <button className={cx('add-btn')} onClick={() => setIsCreating(true)}>Tạo Mã Đầu Tiên</button>
                </div>
            ) : (
                <div className={cx('table-wrapper')}>
                    <table className={cx('promotion-table')}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Code</th>
                                <th>Mô tả</th>
                                <th>Giảm giá</th>
                                <th>Ngày Bắt Đầu</th>
                                <th>Ngày Kết Thúc</th>
                                <th>Lượt Sử Dụng</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map((p) => (
                                <tr key={p.id} className={cx({ expired: !p.isActive && new Date(p.endDate) < new Date() })}>
                                    <td data-label="ID">{p.id}</td>
                                    <td data-label="Code" className={cx('code-cell')}>**{p.code}**</td>
                                    <td data-label="Mô tả" className={cx('description-cell')}>{p.description}</td>
                                    <td data-label="Giảm giá">{formatDiscount(p.discountValue, p.discountType)}</td>
                                    <td data-label="Bắt đầu" className={cx('date-cell')}>{new Date(p.startDate).toLocaleDateString()}</td>
                                    <td data-label="Kết thúc" className={cx('date-cell')}>{new Date(p.endDate).toLocaleDateString()}</td>
                                    <td data-label="Sử dụng" className={cx('usage-cell')}>
                                        {p.usedCount} / {p.usageLimit}
                                        <span className={cx('remaining-info')}>({p.remainingUsage} còn)</span>
                                    </td>
                                    <td data-label="Trạng thái" className={cx('status-cell', { active: p.isActive, inactive: !p.isActive })}>
                                        {p.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                    </td>
                                    <td data-label="Hành động">
                                        <button
                                            className={cx('action-btn', { 'action-active': p.isActive, 'action-inactive': !p.isActive })}
                                            onClick={() => handleToggleActive(p.id, p.isActive)}
                                        >
                                            <FontAwesomeIcon icon={p.isActive ? faToggleOn : faToggleOff} />
                                            {p.isActive ? ' Khóa' : ' Kích hoạt'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OwnerPromotionsSection;