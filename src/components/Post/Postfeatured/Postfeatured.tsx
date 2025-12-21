import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './Postfeatured.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";
import PostItem from "../PostItem/PostItem";
import { FeaturePost } from "~/types/Posts";
import { getAllFeaturedPost } from "~/services/PostService";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);


const Postfeatured: React.FC = () => {

    const [posts, setPosts] = useState<FeaturePost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                const apiResponse = await getAllFeaturedPost();
                if (Array.isArray(apiResponse)) {
                    setPosts(apiResponse);
                } else {
                    setError("Dữ liệu không hợp lệ");
                }
            } catch (error) {
                console.error(error);
                setError("Không thể tải bài viết nổi bật.");
            }finally{
                setLoading(false)
            }
        }
        fetchPost();
    },[])



    return (
        <div className={cx('wrapper')}>
            <div className={cx('title_container')}>
                <FontAwesomeIcon icon={faNewspaper} className={cx('icon')}/>
                <h2>Bài viết nổi bật</h2>
            </div>
            <div className={cx('post_container')}>
                {posts.map((p) => (
                    <PostItem post={p} key={p.id}/>
                ))}
            </div>
            <div className={cx('btn-container')}>
                <Link to={'/post-all'}>
                    <button className={cx('btn')}>Xem thêm</button>
                </Link>
            </div>
        </div>
    )
}

export default Postfeatured;