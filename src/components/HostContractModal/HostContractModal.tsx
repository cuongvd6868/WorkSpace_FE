import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    faMousePointer,
    faSpinner,
    faLock,
} from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from 'jspdf'; 
import html2canvas from 'html2canvas'; 
import SignaturePad from 'react-signature-canvas';
import { toast } from 'react-toastify';
import styles from './HostContractModal.module.scss'; 

const cx = classNames.bind(styles);

interface HostProfileData {
    companyName: string;
    contactPhone: string;
    websiteUrl?: string;
} 

interface HostContractModalProps {
    profileData: HostProfileData;
    signatureRef: React.RefObject<any>;
    onSaveAndSubmit: () => void;
    onClearSignature: () => void;
    onClose: () => void;
    isLoading: boolean;
    dataState?: "open" | "closed"; 
    // Props DÙNG ĐỂ LƯU ẢNH HỢP ĐỒNG ĐÃ KÝ (2 PHẦN)
    onSetDocumentUrls: (urls: string[]) => void; 
    existingDocumentUrls: string[]; 
}

type ModalStep = 'REVIEW' | 'SIGNING' | 'CONFIRMATION';


const HostContractModal: React.FC<HostContractModalProps> = ({ 
    profileData, 
    signatureRef, 
    onSaveAndSubmit, 
    onClearSignature, 
    onClose, 
    isLoading,
    dataState = "closed",
    onSetDocumentUrls, 
    existingDocumentUrls,
}) => {
    const contentRef = useRef<HTMLDivElement>(null); 
    const pdfContentRef = useRef<HTMLDivElement>(null); 

    const [currentStep, setCurrentStep] = useState<ModalStep>('REVIEW');
    const [isSigned, setIsSigned] = useState(false);
    const [isScrolledToEnd, setIsScrolledToEnd] = useState(false); 
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null); 
    
    const [triggerPdfDownload, setTriggerPdfDownload] = useState(false);

    const totalPages = 4; 

    useEffect(() => {
        const checkScroll = () => {
            if (contentRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
                // Cuộn gần đến cuối (dưới 50px)
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
    
    const handleSignatureEnd = () => {
        if (signatureRef.current && !signatureRef.current.isEmpty()) {
            setIsSigned(true);
            const dataUrl = signatureRef.current.toDataURL("image/png");
            setSignatureDataUrl(dataUrl); 
        }
    };
    
    const handleClear = () => {
        onClearSignature();
        setIsSigned(false);
        setSignatureDataUrl(null); 
        setTriggerPdfDownload(false); 
        toast.info("Chữ ký đã được xóa. Vui lòng ký lại.");
    };

    const handleProceedToSigning = () => {
        if (!isScrolledToEnd) {
            toast.warn('Vui lòng cuộn qua và xem hết các điều khoản hợp đồng trước khi ký.');
            return;
        }
        setCurrentStep('SIGNING');
    };

    const forceDOMReflow = (element: HTMLDivElement | null) => {
        // Buộc trình duyệt tính toán lại layout (Reflow)
        if (element) {
            element.style.display = 'none';
            // Đọc offsetHeight để buộc Reflow
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = element.offsetHeight; 
            element.style.display = 'block';
        }
    };

    const handleDownloadPdfAndCaptureUrl = async () => {
        if (!pdfContentRef.current || !signatureDataUrl) {
             toast.error("Không tìm thấy nội dung hợp đồng hoặc chữ ký.");
             setTriggerPdfDownload(false);
             return;
        }

        // --- BƯỚC 1: Đảm bảo phần tử cuộn về đầu và ổn định DOM ---
        if (contentRef.current) {
            contentRef.current.scrollTo(0, 0); 
        }
        // Đảm bảo cả cửa sổ trình duyệt cũng không cuộn
        window.scrollTo(0, 0); 
        
        // Buộc Reflow/Repaint để đảm bảo chữ ký đã được render hoàn chỉnh
        forceDOMReflow(pdfContentRef.current);

        const currentRef = pdfContentRef.current;
        const originalHeight = currentRef.offsetHeight;

        if (currentRef.offsetWidth === 0 || originalHeight === 0) {
            console.error("DOM element size is zero, likely not rendered correctly yet.");
            toast.error("Lỗi: Không thể chụp ảnh hợp đồng (DOM chưa sẵn sàng).");
            setTriggerPdfDownload(false);
            return;
        }

        toast.info("Đang tạo và tải xuống bản PDF đã ký...");
        
        try {
            // --- BƯỚC 2: Chụp toàn bộ nội dung hợp đồng (Một lần) ---
            const canvas = await html2canvas(currentRef, { 
                scale: 2, 
                useCORS: true, 
                logging: true, // Bật logging để debug trên console
                backgroundColor: '#fff', 
            });

            const documentUrls: string[] = [];
            const originalWidth = canvas.width;
            const originalCaptureHeight = canvas.height;
            const splitPoint = Math.round(originalCaptureHeight / 2); 
            
            console.log(`[LOG] Kích thước Canvas chụp được: ${originalWidth}x${originalCaptureHeight}px.`);
            
            if (originalCaptureHeight < 500) { 
                 console.error("Canvas chụp được quá nhỏ:", originalCaptureHeight);
                 toast.error("Lỗi chụp ảnh: Kích thước canvas quá nhỏ, có thể nội dung bị ẩn.");
                 setTriggerPdfDownload(false);
                 return;
            }

            // --- BƯỚC 3: CẮT ẢNH BẰNG API CANVAS CHUẨN ---
            
            // Hàm hỗ trợ cắt và thêm vào URLS
            const captureAndPush = (yStart: number, height: number, pageName: string) => {
                const canvasPage = document.createElement('canvas');
                canvasPage.width = originalWidth;
                canvasPage.height = height;

                const ctx = canvasPage.getContext('2d');
                
                if (!ctx) {
                    console.error(`Lỗi: Không thể lấy Context 2D cho ${pageName}.`);
                    return false; 
                }

                // Vẽ phần đã cắt (Sử dụng canvas đã chụp toàn bộ làm nguồn)
                ctx.drawImage(
                    canvas, 
                    0, yStart, originalWidth, height, // Source: x, y, width, height
                    0, 0, originalWidth, height      // Destination: x, y, width, height
                );
                
                documentUrls.push(canvasPage.toDataURL('image/jpeg', 1.0));
                return true; 
            };

            // 1. TẠO ẢNH TRANG 1 (Từ đầu đến nửa ảnh)
            const page1Success = captureAndPush(0, splitPoint, 'Trang 1');

            // 2. TẠO ẢNH TRANG 2 (Từ nửa ảnh đến cuối)
            const page2Success = captureAndPush(splitPoint, originalCaptureHeight - splitPoint, 'Trang 2');
            
            // --- KIỂM TRA LỖI CUỐI CÙNG ---
            if (!page1Success || !page2Success || documentUrls.length < 2) {
                console.error("Lỗi chia ảnh hợp đồng, không đủ 2 ảnh để lưu hồ sơ.", { documentUrlsLength: documentUrls.length });
                toast.error("Lỗi chia ảnh hợp đồng, không đủ 2 ảnh để lưu hồ sơ.");
                setTriggerPdfDownload(false);
                return;
            }
            
            // 4. Gửi 2 Data URL lên Component cha
            onSetDocumentUrls(documentUrls); 
            toast.success(`Đã lưu ${documentUrls.length} ảnh hợp đồng đã ký vào hồ sơ Host.`);

            // --- BƯỚC 4: Logic tạo PDF (Sử dụng ảnh chụp toàn bộ ban đầu) ---
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth(); 
            const pdfHeight = pdf.internal.pageSize.getHeight(); 
            
            const imgHeight = (originalCaptureHeight * pdfWidth) / originalWidth;
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
            toast.success("Đã tải xuống thành công bản PDF đã ký!");
            setTriggerPdfDownload(false);

        } catch (error) {
            console.error("Lỗi tổng quát trong quy trình chụp ảnh:", error);
            toast.error("Lỗi hệ thống: Không thể hoàn tất quy trình ký kết và chụp ảnh.");
            setTriggerPdfDownload(false);
        }
    };
    
    const handleFinalSubmit = () => {
        if (!isSigned) {
            toast.error('Vui lòng ký tên xác nhận vào ô chữ ký.');
            return;
        }
        
        setCurrentStep('CONFIRMATION');
        onSaveAndSubmit(); 
        setTriggerPdfDownload(true);
    };
    
    // --- EFFECT: Kích hoạt tải PDF & Capture URL (TIMEOUT 500MS) ---
    useEffect(() => {
        if (triggerPdfDownload && signatureDataUrl && currentStep === 'CONFIRMATION') {
            // Giữ timeout 500ms để đảm bảo DOM đã ổn định
            setTimeout(() => {
                handleDownloadPdfAndCaptureUrl();
            }, 500); 
        }
    }, [triggerPdfDownload, signatureDataUrl, currentStep]);

    const renderStepHeader = (step: ModalStep, index: number, title: string) => (
        <div className={cx('step-item', { 'active': currentStep === step, 'completed': index < (['REVIEW', 'SIGNING', 'CONFIRMATION'].indexOf(currentStep)) })}>
            <div className={cx('step-icon')}>{index + 1}</div>
            <div className={cx('step-label')}>{title}</div>
        </div>
    );

    const ContractBody = useMemo(() => (
        <>
            <div className={cx('title-container')}>
                <div className={'title-header'}>
                    <p className={'top'}>Cộng hòa xã hội chủ nghĩa Việt Nam</p> 
                    <p className={'bottom'}>Độc lập - Tự do - Hạnh phúc</p>
                </div>
            </div>
            {(() => {
                const today = new Date();
                const day = today.getDate();
                const month = today.getMonth() + 1;
                const year = today.getFullYear();

                return (
                    <p className={cx('day')}>Đà Nẵng, ngày {day} tháng {month} năm {year}</p>
                );
            })()}

            <h2 className={cx('title-main')}>Biên Bản Cam Kết</h2>
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
            
            <div style={{ height: '300px' }}>&nbsp;</div>
            
            <div className={cx('contract-footer-phantom')}>
                <p>--- Hết Văn Bản Hợp Đồng ---</p>
                <p>Trang cuối cùng / Trang {totalPages}</p>
                
                {/* HIỂN THỊ CHỮ KÝ ĐỂ html2canvas CHỤP */}
                {signatureDataUrl && (
                    <div className={cx('signature-placeholder-for-pdf')}>
                        <p style={{ marginTop: '20px', marginBottom: '5px', fontWeight: 'bold', textAlign: 'center' }}>Chữ ký Bên B (Host):</p>
                        <img 
                            src={signatureDataUrl} 
                            alt={`Chữ ký điện tử của ${profileData.companyName}`}
                            // Các style này là quan trọng để hình ảnh hiển thị đúng khi chụp
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
                        <div className={cx('contract-viewport', 'dark-mode')} ref={contentRef}>
                            {/* pdfContentRef là vùng được html2canvas CHỤP */}
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
                                <p className={cx('panel-description')}>Vui lòng cuộn xem hết **4 trang** điều khoản hợp tác để kích hoạt nút Ký kết.</p>
                                
                                <div className={cx('review-status-box', { 'complete': isScrolledToEnd })}>
                                    <FontAwesomeIcon icon={isScrolledToEnd ? faCheck : faMousePointer} />
                                    <span>{isScrolledToEnd ? 'Đã xem hết điều khoản.' : 'Vui lòng cuộn xuống...'}</span>
                                </div>
                                
                                <div className={cx('document-status-note')}>
                                    <FontAwesomeIcon icon={faLock} />
                                    <span>Sau khi ký, hệ thống sẽ tự động chụp và chia hợp đồng thành **2 ảnh** để lưu vào hồ sơ Host của bạn (đảm bảo đủ số lượng ảnh tài liệu yêu cầu).</span>
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
                                            penColor='rgb(0, 137, 123)' 
                                            backgroundColor='rgb(255, 255, 255)' 
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
                                        <div className={cx('loading-animation')}>
                                             <FontAwesomeIcon icon={faSpinner} spin className={cx('spinner-icon')} />
                                        </div>
                                        <p className={cx('panel-description')}>Đang tạo bản PDF đã ký, **chia thành 2 ảnh tài liệu** và gửi hồ sơ Host. Vui lòng chờ...</p>
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