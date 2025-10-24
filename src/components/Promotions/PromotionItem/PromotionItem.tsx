import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './PromotionItem.module.scss';
import { Promotions } from '~/types/Promotions'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faGift } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

type PromotionItemProps = {
    promotion: Promotions;
};

const PromotionItem: React.FC<PromotionItemProps> = ({ promotion }) => {
    const [copyText, setCopyText] = useState('Copy');

    const handleCopy = async () => {
        if (copyText === 'Đã copy') return;
        try {
            await navigator.clipboard.writeText(promotion.code);
            setCopyText('Đã copy');
            setTimeout(() => {
                setCopyText('Copy');
            }, 2000);
        } catch (err) {
            console.error('Lỗi khi copy: ', err);
            setCopyText('Lỗi');
            setTimeout(() => {
                setCopyText('Copy');
            }, 2000);
        }
    };

return (
    <div className={cx('item-wrapper')}>
        <div className={cx('top-section')}>
            <div className={cx('top-section_Wrapper')}>
                <FontAwesomeIcon icon={faGift} className={cx('icon-gift')}/>
                <p className={cx('title')}>{promotion.description}</p>
            </div>
                <p className={cx('desc')}>Tri ân khách hàng của CSB</p>
        </div>
        <div className={cx('promotion-line')}></div>
        
        <div className={cx('bottom-section')}>
            <div className={cx('code-display')}>
                <FontAwesomeIcon icon={faCopy} className={cx('icon')}/>
                <p className={cx('code')}>{promotion.code}</p>
            </div>
            <button className={cx('copy-button', { copied: copyText === 'Đã copy' })} onClick={handleCopy}>
                {copyText}
            </button>
        </div>
    </div>
);
};

export default PromotionItem;