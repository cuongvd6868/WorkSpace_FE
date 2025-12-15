
import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import styles from './PostPage.module.scss';
import classNames from "classnames/bind";
import { toast } from 'react-toastify';
import { Post } from "~/types/Posts"; 
import { getPostById } from "~/services/PostService"; 
import { CLOUD_NAME } from "~/config/cloudinaryConfig";

const cx = classNames.bind(styles);

const PostPage: React.FC = () => {
    // Lấy ID bài viết từ URL
    const { id } = useParams<{ id: string }>(); 
    const postId = id ? parseInt(id, 10) : null;

    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!postId) {
            setError("Bài viết không hợp lệ hoặc không tìm thấy ID.");
            setIsLoading(false);
            return;
        }

        const fetchPost = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data: Post = await getPostById(postId);
                setPost(data);
            } catch (err) {
                console.error("Lỗi khi tải bài viết:", err);
                setError("Không thể tải bài viết này. Có thể bài viết đã bị xóa.");
                toast.error("Không thể tải bài viết.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (isLoading) {
        return <div className={cx('wrapper', 'loading')}>Đang tải bài viết...</div>;
    }

    if (error) {
        return <div className={cx('wrapper', 'error')}>Lỗi: {error}</div>;
    }
    
    // Nếu post là null (không tìm thấy sau khi tải), hiển thị thông báo
    if (!post) {
        return <div className={cx('wrapper', 'not-found')}>Không tìm thấy bài viết.</div>;
    }

    const authorName = (post as any).userName || 'Staff'; 
    const authorAvatar = (post as any).avatar || 'https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-6/444489138_1019981339484259_4504008877707254740_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=qdhpBvRWiD0Q7kNvwHBLYPr&_nc_oc=AdnGazLAYVz3uiFHmJEt5WfZEaOzjZL0dGsOB5_5PIezLkGex1Nq4fZggmVuFAMQvk4&_nc_zt=23&_nc_ht=scontent.fdad3-1.fna&_nc_gid=vA4jpweRBNs443SYLGWAjw&oh=00_AfnYvavzOJ2xIvrbqdaTzuhghFnm8piDuIJjig2hDQJ-8Q&oe=69452FA0'; // Thay bằng đường dẫn mặc định

    return (
        <div className={cx('wrapper')}>
            <div className={cx('post-container')}>
                
                {/* Tiêu đề */}
                <h1 className={cx('post-title')}>{post.title}</h1>
                
                {/* Thông tin tác giả và ngày đăng */}
                <div className={cx('post-meta')}>
                    <img src={authorAvatar} alt={authorName} className={cx('author-avatar')} />
                    <div className={cx('meta-info')}>
                        <span className={cx('author-name')}>Đăng bởi: **{authorName}**</span>
                        <span className={cx('post-date')}>
                            Ngày đăng: {new Date(post.createUtc).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>

                {post.imageData && (
                    <div className={cx('post-image-wrapper')}>

                        <img 
                            src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${post.imageData}`} 
                            alt={post.title} 
                            className={cx('post-image')}
                        />
                    </div>
                )}
                
                {/* Nội dung bài viết (Sử dụng innerHTML để render HTML từ Markdown Editor) */}
                <div 
                    className={cx('post-content')} 
                    dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
                />

                <div className={cx('post-footer')}>
                    <p>--- Hết bài viết ---</p>
                </div>
            </div>
        </div>
    )
}

export default PostPage;