import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faStar } from '@fortawesome/free-solid-svg-icons';
import { getAllPosts, handleDeletePost } from '~/services/PostService'; 
import { Post, PostRequest, PostUpdateRequest } from '~/types/Posts'; 
import { toast } from 'react-toastify';
import styles from './PostManagementSection.module.scss'; 
import PostFormModal from '../PostFormModal/PostFormModal'; 

const cx = classNames.bind(styles);

const PostManagementSection: React.FC = () => {
    // Sử dụng Type Post của bạn
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<PostUpdateRequest | PostRequest | null>(null);
    
    // Sử dụng hàm getAllPosts
    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            // Dữ liệu trả về phải khớp với Type Post
            const data: Post[] = await getAllPosts(); 
            setPosts(data);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách bài viết.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleNewPost = () => {
        // Khởi tạo PostRequest rỗng
        setEditingPost({ title: '', contentMarkdown: '', contentHtml: '', imageData: '', isFeatured: false });
        setIsModalOpen(true);
    };

    const handleEditPost = (post: Post) => {
        // Chuyển đổi Post đầy đủ sang PostUpdateRequest cho modal
        const postToUpdate: PostUpdateRequest = { 
            id: post.id,
            title: post.title,
            contentMarkdown: post.contentMarkdown,
            contentHtml: post.contentHtml,
            imageData: post.imageData,
            isFeatured: post.isFeatured,
        };
        setEditingPost(postToUpdate);
        setIsModalOpen(true);
    };
    
    const confirmDelete = async (postId: number, title: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết: "${title}" (ID: ${postId})?`)) {
            try {
                await handleDeletePost(postId);
                toast.success(`Đã xóa bài viết "${title}" thành công!`);
                fetchPosts();
            } catch (error) {
                toast.error("Lỗi khi xóa bài viết.");
            }
        }
    };
    

    return (
        <div className={cx('post-management-wrapper')}>
            <h3 className={cx('section-header')}>📰 Danh Sách Bài Viết</h3>
            
            <button className={cx('add-new-btn')} onClick={handleNewPost}>
                <FontAwesomeIcon icon={faPlus} /> Tạo Bài Viết Mới
            </button>
            
            <div className={cx('table-container')}>
                {isLoading ? (
                    <p>Đang tải danh sách bài viết...</p>
                ) : (
                    <table className={cx('post-table')}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề</th>
                                <th>Nổi bật</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <tr key={post.id}>
                                        <td>{post.id}</td>
                                        <td>{post.title}</td>
                                        <td>
                                            {post.isFeatured ? (
                                                <FontAwesomeIcon icon={faStar} className={cx('featured-icon')} title='Bài viết nổi bật' />
                                            ) : (
                                                'Không'
                                            )}
                                        </td>
                                        {/* SỬ DỤNG TRƯỜNG createUtc */}
                                        <td>{new Date(post.createUtc).toLocaleDateString('vi-VN')}</td>
                                        <td className={cx('actions')}>
                                            <button 
                                                className={cx('action-btn', 'view')}
                                                onClick={() => window.open(`/posts/${post.id}`, '_blank')} 
                                                title="Xem Bài Viết"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button 
                                                className={cx('action-btn', 'edit')}
                                                onClick={() => handleEditPost(post)}
                                                title="Chỉnh Sửa"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button 
                                                className={cx('action-btn', 'delete')}
                                                onClick={() => confirmDelete(post.id, post.title)}
                                                title="Xóa Bài Viết"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className={cx('no-data')}>
                                        Chưa có bài viết nào trong hệ thống.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            
            <PostFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPost(null);
                    fetchPosts();
                }}
                postData={editingPost}
            />
        </div>
    );
};

export default PostManagementSection;