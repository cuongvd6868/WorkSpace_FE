import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Loader2, Calendar, ChevronRight, Bookmark } from "lucide-react";

import styles from './PostAllPage.module.scss';
import { getAllPost } from '~/services/PostService';
import { PostAllView } from "~/types/Posts";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";
import { Link } from "react-router-dom";
import LoadingSpinner from "~/components/LoadingSpinner/LoadingSpinner";

const cx = classNames.bind(styles);

const PostAllPage: React.FC = () => {
    const [posts, setPosts] = useState<PostAllView[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllPost();
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className={cx('loading-state')}>
                <LoadingSpinner/>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('header-section')}>
                    <span className={cx('top-label')}>Blog & Tin tức</span>
                    <h1 className={cx('main-title')}>Tất cả bài viết</h1>
                    <div className={cx('divider')}></div>
                </div>

                <div className={cx('post-list')}>
                    {posts.map((post) => (
                        <article key={post.id} className={cx('post-item', { featured: post.isFeatured })}>
                            <div className={cx('image-wrapper')}>
                                <img 
                                    src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${post.imageData}`}  
                                    alt={post.title} 
                                    className={cx('image')}
                                />
                                {post.isFeatured && <div className={cx('featured-badge')}>Nổi bật</div>}
                            </div>
                            
                            <div className={cx('info-content')}>
                                <div className={cx('meta-tags')}>
                                    <span className={cx('category')}>Kiến thức</span>
                                    <span className={cx('date')}>
                                        <Calendar size={14} /> 20/12/2025
                                    </span>
                                </div>
                                
                                <h2 className={cx('title')}>{post.title}</h2>
                                
                                <p className={cx('description')}>
                                    Khám phá những góc nhìn mới và thông tin chi tiết về {post.title.toLowerCase()}. 
                                    Một bài viết tâm huyết dành cho cộng đồng...
                                </p>

                                <div className={cx('footer-card')}>
                                    <Link to={`/posts/${post.id}`}>
                                        <button className={cx('read-btn')}>
                                            Chi tiết bài viết <ChevronRight size={18} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostAllPage;