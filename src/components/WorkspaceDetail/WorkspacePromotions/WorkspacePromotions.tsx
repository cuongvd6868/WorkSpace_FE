import React, { useEffect, useState } from 'react';
import { Ticket, Copy, Check, Loader, Gift } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './WorkspacePromotions.module.scss';
import { GetPromotionByWorkspace  } from '~/services/PromotionService';
import { PromotionWorkspace } from '~/types/Promotions';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

interface Props {
    workspaceId: number;
}

const WorkspacePromotions: React.FC<Props> = ({ workspaceId }) => {
    const [promotions, setPromotions] = useState<PromotionWorkspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const data = await GetPromotionByWorkspace(workspaceId);
                setPromotions(data || []);
            } catch (error) {
                console.error("Lỗi tải khuyến mãi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, [workspaceId]);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Đã sao chép mã: ${code}`);
        
        // Reset icon copy sau 2 giây
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading) return <div className={cx('loading')}><Loader className={cx('spin')} size={16} /> Đang tìm ưu đãi...</div>;
    if (promotions.length === 0) return null; // Không có khuyến mãi thì không hiển thị

    return (
        <div className={cx('promo-container')}>
            <div className={cx('promo-header')}>
                <Gift size={20} className={cx('gift-icon')} />
                <span>Ưu đãi đặc biệt dành cho bạn</span>
            </div>
            <div className={cx('promo-list')}>
                {promotions.map((promo) => (
                    <div key={promo.id} className={cx('promo-card')}>
                        <div className={cx('promo-info')}>
                            <div className={cx('promo-value')}>
                                Giảm {promo.discountValue.toLocaleString()}
                            </div>
                            <div className={cx('promo-desc')}>{promo.description}</div>
                            <div className={cx('promo-code-wrap')}>
                                <span className={cx('code-label')}>Mã:</span>
                                <code className={cx('code-text')}>{promo.code}</code>
                            </div>
                        </div>
                        <button 
                            className={cx('copy-btn', { copied: copiedCode === promo.code })}
                            onClick={() => handleCopy(promo.code)}
                            title="Sao chép mã"
                        >
                            {copiedCode === promo.code ? <Check size={16} /> : <Copy size={16} />}
                            {copiedCode === promo.code ? 'Đã lưu' : 'Sao chép'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkspacePromotions;