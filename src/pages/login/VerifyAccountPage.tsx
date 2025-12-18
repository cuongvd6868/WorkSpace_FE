
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmailAPI } from '~/services/AuthService';

const VerifyAccountPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Đang xử lý xác thực tài khoản...');

    useEffect(() => {
        const verify = async () => {
            const userId = searchParams.get('userId');
            const code = searchParams.get('code');

            if (!userId || !code) {
                setStatus('error');
                setMessage('Đường dẫn xác thực không hợp lệ (thiếu thông tin).');
                return;
            }

            try {
                await verifyEmailAPI(userId, code);
                setStatus('success');
                setMessage('Xác thực tài khoản thành công! Bạn đang được chuyển hướng...');
                
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error) {
                setStatus('error');
                setMessage('Xác thực thất bại. Liên kết có thể đã hết hạn hoặc không đúng.');
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '60vh',
            textAlign: 'center' 
        }}>
            {status === 'loading' && <h2>⏳ {message}</h2>}
            
            {status === 'success' && (
                <div>
                    <h2 style={{ color: 'green' }}>✅ {message}</h2>
                    <p>Vui lòng đăng nhập để tiếp tục.</p>
                </div>
            )}

            {status === 'error' && (
                <div>
                    <h2 style={{ color: 'red' }}>❌ {message}</h2>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        Quay lại đăng nhập
                    </button>
                </div>
            )}
        </div>
    );
};

export default VerifyAccountPage;