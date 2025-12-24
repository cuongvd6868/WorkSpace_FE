import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheckCircle, 
    faTimesCircle, 
    faSpinner, 
    faBuilding, 
    faEnvelope, 
    faPhone 
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import styles from './OwnerRegistrationCensorSection.module.scss'; 
import {
    getAllOwnerRegistration,
    handleApproveOwner,
    handleRejectOwner, // Đã import hàm reject
} from '~/services/AdminService'; 
import { OwnerRegistrationsView } from '~/types/Admin';

const cx = classNames.bind(styles);

const OwnerRegistrationCensorSection: React.FC = () => {
    const [registrations, setRegistrations] = useState<OwnerRegistrationsView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null); // Dùng chung cho cả Approve và Reject

    // 1. Hàm tải dữ liệu đăng ký Owner
    const fetchRegistrations = useCallback(async () => {
        setIsLoading(true);
        try {
            const data: OwnerRegistrationsView[] = await getAllOwnerRegistration();
            setRegistrations(data);
        } catch (err) {
            toast.error('Lỗi tải danh sách đăng ký Owner.');
            setRegistrations([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. useEffect để tải dữ liệu ban đầu
    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    // 3. Hàm xử lý Duyệt đăng ký
    const handleApprove = async (id: number) => {
        const confirmAction = window.confirm(`Bạn có chắc chắn muốn DUYỆT đăng ký của Owner ID ${id}?`);
        if (!confirmAction) return;

        setProcessingId(id);
        try {
            await handleApproveOwner(id);
            // Cập nhật UI: Xóa mục đã duyệt khỏi danh sách
            setRegistrations(prev => prev.filter(reg => reg.id !== id));
            toast.success('Đã DUYỆT Owner thành công! Tài khoản Owner đã được tạo.');
        } catch (error) {
            toast.error('Thao tác Duyệt thất bại. Vui lòng thử lại.');
        } finally {
            setProcessingId(null);
        }
    };
    
    // 4. Hàm xử lý Từ chối (Đã cập nhật logic gọi API)
    const handleReject = async (id: number) => {
        const confirmAction = window.confirm(`Bạn có chắc chắn muốn TỪ CHỐI đăng ký của Owner ID ${id}?`);
        if (!confirmAction) return;
        
        setProcessingId(id);
        try {
            await handleRejectOwner(id);
            // Cập nhật UI: Xóa mục đã từ chối khỏi danh sách
            setRegistrations(prev => prev.filter(reg => reg.id !== id));
            toast.info(`Đã TỪ CHỐI đơn đăng ký của Owner ID ${id}.`);
        } catch (error) {
            toast.error('Thao tác Từ chối thất bại. Vui lòng thử lại.');
        } finally {
            setProcessingId(null);
        }
    };

    // 5. Component hiển thị bảng
    const RegistrationTable: React.FC = () => {
        if (isLoading) {
            return (
                <div className={cx('loading')}>
                    <FontAwesomeIcon icon={faSpinner} spin /> Đang tải danh sách đăng ký...
                </div>
            );
        }

        if (registrations.length === 0) {
            return <div className={cx('no-data')}>🎉 Không có yêu cầu đăng ký Owner nào đang chờ duyệt.</div>;
        }

        return (
            <table className={cx('censor-table')}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Công Ty</th>
                        <th>Mô Tả</th>
                        <th>Email Liên Hệ</th>
                        <th>Điện Thoại</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {registrations.map((reg) => (
                        <tr key={reg.id}>
                            <td>{reg.id}</td>
                            <td>
                                <FontAwesomeIcon icon={faBuilding} className={cx('icon-detail')} /> 
                                <strong>{reg.companyName}</strong>
                            </td>
                            <td className={cx('description-cell')}>
                                {reg.description || "Chưa cung cấp mô tả"}
                            </td>
                            <td>
                                <FontAwesomeIcon icon={faEnvelope} className={cx('icon-detail')} /> 
                                {reg.userEmail}
                            </td>
                            <td>
                                <FontAwesomeIcon icon={faPhone} className={cx('icon-detail')} /> 
                                {reg.contactPhone}
                            </td>
                            <td>
                                <div className={cx('action-group')}>
                                    <button
                                        className={cx('action-btn', 'btn-approve')}
                                        onClick={() => handleApprove(reg.id)}
                                        disabled={processingId === reg.id}
                                    >
                                        {processingId === reg.id ? (
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                        ) : (
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                        )}
                                        Duyệt
                                    </button>
                                    
                                    <button 
                                        className={cx('action-btn', 'btn-reject')}
                                        onClick={() => handleReject(reg.id)}
                                        disabled={processingId === reg.id}
                                    >
                                        {processingId === reg.id ? (
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                        ) : (
                                            <FontAwesomeIcon icon={faTimesCircle} />
                                        )}
                                        Từ Chối
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className={cx('censor-management')}>
             <p className={cx('info-text')}>
                Đây là danh sách các công ty/cá nhân đã đăng ký trở thành Owner và đang chờ bạn **kiểm duyệt**.
            </p>
            <RegistrationTable />
        </div>
    );
};

export default OwnerRegistrationCensorSection;