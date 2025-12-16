import React, { useState, useEffect, useCallback } from "react";
import classNames from "classnames/bind";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faChevronDown, faChevronUp, faSyncAlt } from "@fortawesome/free-solid-svg-icons";

// Giả định bạn đã import các types và services này
import { WorkspaceDrinkServices, DrinkServiceItem, DrinkServiceUpdateRequest } from "~/types/Owner";
import { getAllDrinkServicesGrouped, deleteDrinkService, createDrinkServices, updateDrinkService, getAllWorkspacesOwnerView } from "~/services/OwnerService";
import { useAuth } from "~/context/useAuth"; 
import styles from './DrinkServiceManagementSection.module.scss';
import DrinkServiceFormModal from "../DrinkServiceFormModal/DrinkServiceFormModal"; 
import { CLOUD_NAME } from "~/config/cloudinaryConfig";

const cx = classNames.bind(styles);

// Interface cho Workspace cơ bản để chọn khi tạo dịch vụ
interface WorkspaceListItem {
    id: number;
    title: string;
}

const DrinkServiceManagementSection: React.FC = () => {
    const { token } = useAuth();
    const [groupedServices, setGroupedServices] = useState<WorkspaceDrinkServices[]>([]);
    const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedWorkspaces, setExpandedWorkspaces] = useState<number[]>([]);
    
    // State cho Modal (Tạo & Cập nhật)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<DrinkServiceUpdateRequest & { newImageFile?: File } | null>(null);
    const [isCreating, setIsCreating] = useState(false);


    // --- Fetching Data ---
    const fetchServices = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await getAllDrinkServicesGrouped();
            setGroupedServices(data);
            setError(null);
        } catch (err) {
            setError('Không thể tải dịch vụ đồ uống.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const fetchWorkspaces = useCallback(async () => {
        try {
            // Giả định getAllWorkspacesOwnerView trả về mảng có id và title
            const wsData = await getAllWorkspacesOwnerView(); 
            const formattedWorkspaces: WorkspaceListItem[] = wsData.map((ws: any) => ({
                id: ws.id,
                title: ws.title
            }));
            setWorkspaces(formattedWorkspaces);
        } catch (err) {
            toast.error("Không thể tải danh sách Workspace để tạo dịch vụ mới.");
        }
    }, []);

    useEffect(() => {
        fetchWorkspaces();
        fetchServices();
    }, [fetchServices, fetchWorkspaces]);

    // --- Toggle Expansion ---
    const toggleExpansion = (workspaceId: number) => {
        setExpandedWorkspaces(prev => 
            prev.includes(workspaceId)
                ? prev.filter(id => id !== workspaceId)
                : [...prev, workspaceId]
        );
    };

    // --- Handle CRUD Operations ---

    const handleDelete = async (serviceId: number) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ ID ${serviceId} này?`)) return;
        if (!token) {
            toast.error("Vui lòng đăng nhập lại.");
            return;
        }

        try {
            await deleteDrinkService(serviceId, token);
            toast.success(`Xóa dịch vụ ID ${serviceId} thành công.`);
            fetchServices(); // Tải lại dữ liệu
        } catch (err) {
            toast.error(`Lỗi khi xóa dịch vụ: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
        }
    };

    const handleCreate = () => {
        setIsCreating(true);
        setEditingService(null); // Đảm bảo không ở chế độ chỉnh sửa
        setIsModalOpen(true);
    };

    const handleEdit = (service: DrinkServiceItem) => {
        setIsCreating(false);
        // Chuyển đổi DrinkServiceItem sang DrinkServiceUpdateRequest
        setEditingService({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            imageUrl: service.imageUrl,
            isActive: service.isActive,
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData: any) => {
        if (!token) {
            toast.error("Vui lòng đăng nhập lại.");
            return;
        }
        
        try {
            if (isCreating) {
                // Xử lý tạo mới: API nhận một mảng (mặc dù form chỉ gửi 1)
                const itemsToCreate = [{
                    ...formData, 
                    price: parseFloat(formData.price),
                    imageFile: formData.imageFile
                }];
                await createDrinkServices(formData.workSpaceId, itemsToCreate, token);
                toast.success("Tạo dịch vụ mới thành công!");

            } else if (editingService) {
                // Xử lý cập nhật
                const updatePayload: DrinkServiceUpdateRequest & { newImageFile?: File } = {
                    ...formData,
                    id: editingService.id,
                    price: parseFloat(formData.price),
                    // newImageFile chỉ được gửi nếu người dùng chọn file mới
                    ...(formData.newImageFile && { newImageFile: formData.newImageFile }), 
                    // imageUrl là URL cũ nếu không có newImageFile
                    imageUrl: formData.newImageFile ? '' : formData.imageUrl, 
                };
                
                await updateDrinkService(updatePayload, token);
                toast.success(`Cập nhật dịch vụ ID ${editingService.id} thành công.`);
            }
            
            setIsModalOpen(false);
            setEditingService(null);
            fetchServices(); // Tải lại dữ liệu
            
        } catch (err) {
            toast.error(`Lỗi: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
        }
    };

    // --- Render ---

    if (isLoading && groupedServices.length === 0) {
        return <div className={cx('loading')}>Đang tải danh sách dịch vụ đồ uống...</div>;
    }

    if (error) {
        return <div className={cx('error')}>Lỗi: {error}</div>;
    }

    return (
        <div className={cx('drink-service-management')}>
            <div className={cx('header-actions')}>
                <button className={cx('add-btn')} onClick={handleCreate}>
                    <FontAwesomeIcon icon={faPlus} /> Thêm Dịch Vụ Mới
                </button>
                <button className={cx('refresh-btn')} onClick={fetchServices} disabled={isLoading}>
                    <FontAwesomeIcon icon={faSyncAlt} className={cx({ 'spin': isLoading })}/> Tải lại
                </button>
            </div>

            <div className={cx('service-list')}>
                {groupedServices.length === 0 ? (
                    <div className={cx('no-data')}>Chưa có dịch vụ đồ uống nào được đăng ký.</div>
                ) : (
                    groupedServices.map(group => (
                        <div key={group.workSpaceId} className={cx('workspace-group')}>
                            <div 
                                className={cx('group-header')} 
                                onClick={() => toggleExpansion(group.workSpaceId)}
                            >
                                <h3>
                                    {group.workSpaceTitle} 
                                    <span className={cx('service-count')}>({group.services.length} dịch vụ)</span>
                                </h3>
                                <FontAwesomeIcon icon={expandedWorkspaces.includes(group.workSpaceId) ? faChevronUp : faChevronDown} />
                            </div>

                            {expandedWorkspaces.includes(group.workSpaceId) && (
                                <ul className={cx('service-items')}>
                                    {group.services.length === 0 ? (
                                        <li className={cx('empty-list')}>Chưa có dịch vụ nào trong Workspace này.</li>
                                    ) : (
                                        group.services.map(service => (
                                            <li key={service.id} className={cx('service-item')}>
                                                <div className={cx('service-info')}>
                                                    {/* Chú ý: Cần xử lý URL Cloudinary trong component thực tế nếu cần */}
                                                    <img src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${service.imageUrl}`} alt={service.name} className={cx('service-image')} />
                                                    <div className={cx('details')}>
                                                        <h4>{service.name} 
                                                            <span className={cx('status', { 'active': service.isActive, 'inactive': !service.isActive })}>
                                                                {service.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                                            </span>
                                                        </h4>
                                                        <p className={cx('description')}>{service.description}</p>
                                                        <p className={cx('price')}>Giá: {service.price.toLocaleString('vi-VN')} VND</p>
                                                    </div>
                                                </div>
                                                <div className={cx('actions')}>
                                                    <button className={cx('edit-btn')} onClick={() => handleEdit(service)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button className={cx('delete-btn')} onClick={() => handleDelete(service.id)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            {/* Modal cho Form Tạo/Cập nhật */}
            {isModalOpen && (
                <DrinkServiceFormModal 
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    isCreating={isCreating}
                    initialData={editingService}
                    workspaces={workspaces} // Cần để chọn WS khi tạo mới
                />
            )}
        </div>
    );
};

export default DrinkServiceManagementSection;