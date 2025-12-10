// --- 1. Thư viện React và Hooks ---
import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- 2. Thư viện bên ngoài (External Libraries) ---
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faTimes, 
    faPencilAlt, 
    faEraser, 
    faCheck, 
    faFileContract, 
    faDownload,
    faChevronRight,
    faEye,
    faMousePointer
} from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from 'jspdf'; 
import html2canvas from 'html2canvas'; 
import SignaturePad from 'react-signature-canvas';
import { toast } from 'react-toastify';

// --- 3. Internal Modules và Assets ---
import styles from './HostContractModal.module.scss'; 
// Giả định: Import này cần được đảm bảo là file tồn tại
// import { HostProfileData } from '~/types/HostProfile'; 

// ------------------------------------------------------------------
// Bắt đầu code module
// ------------------------------------------------------------------

const cx = classNames.bind(styles);

// Giả định: Khai báo interface nếu không có file HostProfileData
interface HostProfileData {
    companyName: string;
    contactPhone: string;
    websiteUrl?: string;
} 

// --- Cấu trúc props ---
interface HostContractModalProps {
    profileData: HostProfileData;
    signatureRef: React.RefObject<any>;
    onSaveAndSubmit: () => void;
    onClearSignature: () => void;
    onClose: () => void;
    isLoading: boolean;
    dataState?: "open" | "closed"; 
}

// --- Bước của Modal ---
type ModalStep = 'REVIEW' | 'SIGNING' | 'CONFIRMATION';

const HostContractModal: React.FC<HostContractModalProps> = ({ 
    profileData, 
    signatureRef, 
    onSaveAndSubmit, 
    onClearSignature, 
    onClose, 
    isLoading,
    dataState = "closed"
}) => {
    // Ref cũ: dùng để kiểm tra việc cuộn (scroll)
    const contentRef = useRef<HTMLDivElement>(null); 
    // Ref MỚI: dùng để chụp toàn bộ nội dung PDF
    const pdfContentRef = useRef<HTMLDivElement>(null); 
    
    const [currentStep, setCurrentStep] = useState<ModalStep>('REVIEW');
    const [isSigned, setIsSigned] = useState(false);
    const [isScrolledToEnd, setIsScrolledToEnd] = useState(false); 
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null); 
    
    // Cờ để kích hoạt tải PDF sau khi ký và Data URL đã có
    const [triggerPdfDownload, setTriggerPdfDownload] = useState(false);

    const totalPages = 4; // Giả lập tổng số trang
    
    // --- Logic ScrolledToEnd & Cập nhật chữ ký ---
    useEffect(() => {
        const checkScroll = () => {
            if (contentRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
                // Kiểm tra nếu cuộn gần đến cuối (còn lại < 50px)
                if (scrollHeight - clientHeight - scrollTop < 50) { 
                    setIsScrolledToEnd(true);
                } else {
                    setIsScrolledToEnd(false);
                }
            }
        };

        if (currentStep === 'REVIEW' && contentRef.current) {
            contentRef.current.addEventListener('scroll', checkScroll);
            checkScroll(); 
        }
        return () => {
            if (contentRef.current) {
                contentRef.current.removeEventListener('scroll', checkScroll);
            }
        };
    }, [currentStep]);
    
    // Cập nhật trạng thái ký VÀ LẤY DATA URL
    const handleSignatureEnd = () => {
        if (signatureRef.current && !signatureRef.current.isEmpty()) {
            setIsSigned(true);
            const dataUrl = signatureRef.current.toDataURL("image/png");
            setSignatureDataUrl(dataUrl); 
        }
    };
    
    // Nút Xóa
    const handleClear = () => {
        onClearSignature();
        setIsSigned(false);
        setSignatureDataUrl(null); 
        setTriggerPdfDownload(false); 
        toast.info("Chữ ký đã được xóa. Vui lòng ký lại.");
    };

    // Hàm chuyển từ REVIEW sang SIGNING
    const handleProceedToSigning = () => {
        if (!isScrolledToEnd) {
            toast.warn('Vui lòng cuộn qua và xem hết các điều khoản hợp đồng trước khi ký.');
            return;
        }
        setCurrentStep('SIGNING');
    };
    
    /**
     * Hàm TẠO VÀ TẢI PDF CỤC BỘ bằng cách chụp DOM.
     * Sử dụng pdfContentRef để chụp toàn bộ nội dung.
     */
    const handleDownloadPdfLocally = () => {
        // ⚠️ SỬ DỤNG pdfContentRef.current thay vì contentRef.current
        if (pdfContentRef.current) { 
            if (!signatureDataUrl) {
                toast.error("Không tìm thấy chữ ký để tải PDF. Vui lòng ký tên trước.");
                return;
            }
            
            toast.info("Đang tạo và tải xuống bản PDF đã ký...");
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth(); 
            const pdfHeight = pdf.internal.pageSize.getHeight(); 

            // ⚠️ Chụp toàn bộ nội dung hợp đồng từ ref mới
            html2canvas(pdfContentRef.current, { 
                scale: 2, // Tăng độ phân giải ảnh chụp
                useCORS: true, 
                logging: false,
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const imgProps = pdf.getImageProperties(imgData);
                
                const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
                let heightLeft = imgHeight;
                let position = 0; 

                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }

                pdf.save(`HopDongHost_${profileData.companyName}_KyKet.pdf`);
                toast.success("Đã tải xuống thành công bản PDF xem trước!");
                setTriggerPdfDownload(false); // Reset cờ tải xuống
            }).catch(error => {
                console.error("Lỗi khi tạo PDF cục bộ:", error);
                toast.error("Không thể tạo file PDF. Vui lòng kiểm tra console log.");
                setTriggerPdfDownload(false); // Reset cờ tải xuống
            });
        }
    };


    // Hàm Hoàn tất (Gửi)
    const handleFinalSubmit = () => {
        if (!isSigned) {
            toast.error('Vui lòng ký tên xác nhận vào ô chữ ký.');
            return;
        }
        setCurrentStep('CONFIRMATION');
        
        // 1. Gọi hàm submit API chính 
        onSaveAndSubmit(); 
        
        // 2. Kích hoạt tải PDF
        setTriggerPdfDownload(true);
    };
    
    // --- EFFECT: Kích hoạt tải PDF sau khi signatureDataUrl có giá trị và cờ đã bật ---
    useEffect(() => {
        if (triggerPdfDownload && signatureDataUrl && currentStep === 'CONFIRMATION') {
            // Dùng setTimeout 0ms để đảm bảo mọi cập nhật DOM đã hoàn tất trước khi chụp
            setTimeout(() => {
                 handleDownloadPdfLocally();
            }, 0);
        }
    }, [triggerPdfDownload, signatureDataUrl, currentStep]);


    // Hàm tạo tiêu đề bước
    const renderStepHeader = (step: ModalStep, index: number, title: string) => (
        <div className={cx('step-item', { 'active': currentStep === step, 'completed': index < (['REVIEW', 'SIGNING', 'CONFIRMATION'].indexOf(currentStep)) })}>
            <div className={cx('step-icon')}>{index + 1}</div>
            <div className={cx('step-label')}>{title}</div>
        </div>
    );

    // Dùng useMemo để tránh re-render body hợp đồng
    const ContractBody = useMemo(() => (
        <>
            <div className={cx('contract-section-box')}>
                <h4 className={cx('section-title-sub')}>I. THÔNG TIN CÁC BÊN</h4>
                <table className={cx('info-table')}>
                    <tbody>
                        <tr><td><strong>Bên A (Nền tảng):</strong></td><td>Công ty TNHH Co-working space Da Nang</td></tr>
                        <tr><td><strong>Địa chỉ:</strong></td><td>64 Huỳnh Văn Nghệ</td></tr>
                        <tr><td colSpan={2}><div className={cx('divider-sm')}></div></td></tr>
                        <tr><td><strong>Bên B (Host):</strong></td><td>{profileData.companyName}</td></tr>
                        <tr><td><strong>Điện thoại:</strong></td><td>{profileData.contactPhone}</td></tr>
                        <tr><td><strong>Website:</strong></td><td>{profileData.websiteUrl || 'Chưa cung cấp'}</td></tr>
                    </tbody>
                </table>
            </div>

            <h4 className={cx('section-title-sub')}>II. CÁC ĐIỀU KHOẢN CHÍNH</h4>
            
            <div className={cx('clause-item', 'long-text')}>
                <strong className={cx('clause-heading')}>Điều 1. Phạm vi & Địa điểm:</strong>
                <span>Bên B niêm yết các địa điểm của mình trên nền tảng của Bên A và cam kết chất lượng dịch vụ theo tiêu chuẩn 5 sao.</span>
            </div>
            <div className={cx('clause-item', 'long-text')}>
                <strong className={cx('clause-heading')}>Điều 2. Thanh toán & Hoa hồng:</strong>
                <span>Mức hoa hồng **X%** được áp dụng trên tổng giá trị giao dịch thành công. Chu kỳ thanh toán được quy định chi tiết tại Phụ lục A.</span>
            </div>
            <div className={cx('clause-item', 'long-text')}>
                <strong className={cx('clause-heading')}>Điều 3. Bảo mật Thông tin:</strong>
                <span>Cả hai bên cam kết bảo mật tuyệt đối thông tin khách hàng và dữ liệu kinh doanh. Mọi vi phạm về bảo mật đều dẫn đến chấm dứt hợp đồng và bồi thường thiệt hại. Đây là đoạn văn bản dài để tạo hiệu ứng cuộn qua nhiều trang. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. (Lặp lại đoạn này 3 lần để tạo độ dài cuộn).</span>
            </div>
            <div className={cx('clause-item', 'long-text')}>
                <strong className={cx('clause-heading')}>Điều 4. Trách nhiệm Dịch vụ:</strong>
                <span>Bên B hoàn toàn chịu trách nhiệm về tính chính xác của thông tin và chất lượng thực tế của địa điểm, bao gồm cơ sở vật chất, an ninh và dịch vụ hỗ trợ.</span>
            </div>
            <div className={cx('clause-item', 'long-text')}>
                <strong className={cx('clause-heading')}>Điều 5. Hiệu lực Hợp đồng:</strong>
                <span>Hợp đồng này có hiệu lực kể từ ngày được ký kết điện tử và được coi là bằng chứng pháp lý ràng buộc.</span>
            </div>
            
            <div style={{ height: '300px' }}>&nbsp;</div> {/* Tạo thêm không gian cuộn */}
            
            <div className={cx('contract-footer-phantom')}>
                <p>--- Hết Văn Bản Hợp Đồng ---</p>
                <p>Trang cuối cùng / Trang {totalPages}</p>
                
                {/* HIỂN THỊ CHỮ KÝ TRONG NỘI DUNG HỢP ĐỒNG KHI ĐÃ KÝ */}
                {signatureDataUrl && (
                    <div className={cx('signature-placeholder-for-pdf')}>
                        <p style={{ marginTop: '20px', marginBottom: '5px', fontWeight: 'bold', textAlign: 'center' }}>Chữ ký Bên B (Host):</p>
                        <img 
                            src={signatureDataUrl} 
                            alt={`Chữ ký điện tử của ${profileData.companyName}`}
                            // Các style quan trọng để chữ ký hiển thị gọn gàng trong PDF
                            style={{ 
                                width: '150px', 
                                height: 'auto', 
                                borderBottom: '1px solid #ccc', 
                                paddingBottom: '5px',
                                display: 'block',
                                margin: '0 auto' 
                            }} 
                        />
                        <p style={{ fontWeight: 'bold', textAlign: 'center' }}>{profileData.companyName}</p>
                    </div>
                )}
                {/* KẾT THÚC VỊ TRÍ CHÈN CHỮ KÝ */}

                {isSigned && (
                    <div className={cx('signed-stamp')}>
                        ĐÃ KÝ ĐIỆN TỬ BỞI {profileData.companyName} 
                        <FontAwesomeIcon icon={faCheck} style={{ marginLeft: '5px', color: '#4caf50' }} />
                    </div>
                )}
            </div>
        </>
    ), [profileData, isSigned, signatureDataUrl]);


    // --- RENDER COMPONENT ---
    return (
        <div className={cx('modal-overlay', 'dark-mode')} data-state={dataState}> 
            <div className={cx('modal-content-paper', 'wide', 'dark-mode')}> 
                
                <button className={cx('modal-close-btn')} onClick={onClose} disabled={isLoading}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                
                {/* HEADER - E-Signature Dashboard Style */}
                <div className={cx('contract-header', 'dark-mode')}>
                    <FontAwesomeIcon icon={faFileContract} className={cx('header-icon')}/>
                    <h3 className={cx('contract-title')}>HỆ THỐNG KÝ KẾT ĐIỆN TỬ - HỢP ĐỒNG HOST</h3>
                </div>

                {/* PROGRESS BAR */}
                <div className={cx('progress-bar')}>
                    {renderStepHeader('REVIEW', 0, 'Xem Điều khoản')}
                    <div className={cx('progress-line', { 'completed': currentStep !== 'REVIEW' })}></div>
                    {renderStepHeader('SIGNING', 1, 'Ký Xác nhận')}
                    <div className={cx('progress-line', { 'completed': currentStep === 'CONFIRMATION' })}></div>
                    {renderStepHeader('CONFIRMATION', 2, 'Hoàn tất & Gửi')}
                </div>
                
                {/* CONTRACT CONTENT & SIGNATURE PANEL */}
                <div className={cx('contract-main-area')}>
                    
                    {/* KHU VỰC XEM HỢP ĐỒNG (Luôn hiển thị) */}
                    <div className={cx('contract-viewport-panel', { 'blur': currentStep === 'CONFIRMATION' })}>
                        {/* contentRef (ref cũ) vẫn ở đây để kiểm tra scroll */}
                        <div className={cx('contract-viewport', 'dark-mode')} ref={contentRef}>
                            {/* pdfContentRef (ref MỚI) được dùng để chụp toàn bộ nội dung */}
                            <div className={cx('contract-body-pdf')} ref={pdfContentRef}> 
                                {ContractBody}
                            </div>
                        </div>
                    </div>

                    {/* KHU VỰC CHỨC NĂNG BÊN PHẢI (Adaptive Panel) */}
                    <div className={cx('signing-panel', 'dark-mode')}>
                        
                        {currentStep === 'REVIEW' && (
                            <div className={cx('panel-step-content')}>
                                <h4 className={cx('panel-title')}><FontAwesomeIcon icon={faEye} /> 1. Xem xét Tài liệu</h4>
                                <p className={cx('panel-description')}>Vui lòng cuộn xem hết 4 trang điều khoản hợp tác trước khi ký.</p>
                                
                                <div className={cx('review-status-box', { 'complete': isScrolledToEnd })}>
                                    <FontAwesomeIcon icon={isScrolledToEnd ? faCheck : faMousePointer} />
                                    <span>{isScrolledToEnd ? 'Đã xem hết điều khoản.' : 'Vui lòng cuộn xuống...'}</span>
                                </div>
                                
                                <button 
                                    className={cx('next-step-button')}
                                    onClick={handleProceedToSigning}
                                    disabled={!isScrolledToEnd || isLoading}
                                >
                                    Tiếp tục đến bước Ký kết <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                                
                                <button 
                                    className={cx('download-btn-secondary')} 
                                    onClick={() => toast.info('Chức năng tải bản nháp PDF trước khi ký chưa được hỗ trợ.')}
                                    disabled={isLoading}
                                >
                                    <FontAwesomeIcon icon={faDownload} /> Tải Bản Nháp (PDF)
                                </button>
                            </div>
                        )}

                        {currentStep === 'SIGNING' && (
                            <div className={cx('panel-step-content')}>
                                <h4 className={cx('panel-title')}><FontAwesomeIcon icon={faPencilAlt} /> 2. Ký Kết Hợp Đồng</h4>
                                <p className={cx('panel-description')}>Sử dụng chuột hoặc màn hình cảm ứng để vẽ chữ ký của bạn vào ô bên dưới.</p>
                                
                                <div className={cx('contract-signature-section', 'dark-mode')}>
                                    <div className={cx('signature-box-label')}>
                                        Chữ ký điện tử của {profileData.companyName}
                                        {isSigned && <FontAwesomeIcon icon={faCheck} className={cx('signed-check')} />}
                                    </div>
                                    <div className={cx('signature-pad-container')}>
                                        <SignaturePad
                                            ref={signatureRef}
                                            canvasProps={{ width: 300, height: 120, className: cx('signature-canvas') }}
                                            onEnd={handleSignatureEnd}
                                            penColor='rgb(0, 137, 123)' // Màu Teal đậm
                                            backgroundColor='rgb(255, 255, 255)' // Màu nền trắng
                                        />
                                    </div>
                                    
                                    <div className={cx('signature-actions')}>
                                        <button 
                                            type="button"
                                            className={cx('clear-btn')} 
                                            onClick={handleClear}
                                            disabled={isLoading}
                                        >
                                            <FontAwesomeIcon icon={faEraser} /> Xóa & Ký lại
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    className={cx('next-step-button', { 'pulse': isSigned })} 
                                    onClick={handleFinalSubmit}
                                    disabled={!isSigned || isLoading}
                                >
                                    {isLoading ? 'Đang Xử lý...' : 'Xác nhận & Hoàn tất Đăng ký'} 
                                    {!isLoading && <FontAwesomeIcon icon={faChevronRight} />}
                                </button>
                            </div>
                        )}
                        
                        {currentStep === 'CONFIRMATION' && (
                            <div className={cx('panel-step-content', 'confirmation-view')}>
                                <h4 className={cx('panel-title', 'confirmation')}><FontAwesomeIcon icon={faCheck} /> 3. Hoàn tất Ký kết</h4>
                                {isLoading || triggerPdfDownload ? ( 
                                    <>
                                        <div className={cx('loading-animation')}></div>
                                        <p className={cx('panel-description')}>Đang mã hóa chữ ký và gửi hồ sơ Host lên máy chủ an toàn. Vui lòng chờ...</p>
                                    </>
                                ) : (
                                    <>
                                        <div className={cx('success-animation')}>
                                            <FontAwesomeIcon icon={faCheck} className={cx('success-icon')} />
                                        </div>
                                        <p className={cx('panel-description', 'success-text')}>
                                            **Thành công!** Hợp đồng đã được ký kết điện tử và hồ sơ Host của bạn đang chờ phê duyệt. File PDF đã ký đã được tải xuống máy tính của bạn.
                                        </p>
                                        <button 
                                            className={cx('next-step-button', 'complete-btn')}
                                            onClick={onClose}
                                        >
                                            Trở về Trang chủ
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                        
                    </div>
                </div>

                {/* FOOTER */}
                <div className={cx('modal-footer-controls', 'dark-mode')}>
                    <div className={cx('privacy-status')}>
                        <span className={cx('status-dot')}></span>
                        Đã kích hoạt bảo mật SSL 256-bit. Dữ liệu chữ ký được mã hóa.
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HostContractModal;