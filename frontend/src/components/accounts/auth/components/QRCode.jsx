import React, { useRef, useEffect } from "react";
import QRCodeStyling from 'qr-code-styling';

const QRCode = ({ value, size = 200, label = null, className= ''}) => {
    const qrCodeRef = useRef(null);
    const qrCodeInstance = useRef(null);
    useEffect(() => {
        if (!qrCodeRef.current || !value) return;
        qrCodeInstance.current = new QRCodeStyling({
            width: size,
            height: size,
            type: 'scg',
            data: value,
            image: '/static/accounts/img/logo-icon.png',
            dotsOptions: {
                color: '#2563eb',
                type: 'rounded'
            },
            cornersSquareOptions: {
                color: '#2563eb'
            },
            backgroundOptions: {
                color: '#ffffff'
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 5
            }
        });
        qrCodeInstance.current.append(qrCodeRef.current);
        return () => {
            if (qrCodeRef.current) {
                qrCodeRef.current.innerHTML = '';
            }
        };
    }, [value, size]);
    useEffect(() => {
        if (qrCodeInstance.current && value) {
            qrCodeInstance.current.update({ data: value });
        }
    }, [value]);
    return (
        <div className={`qr-code-container ${className}`}>
            <div ref={qrCodeRef} className="qr-code" />
            {label && <p className="qr-code-label">{label}</p>}
        </div>
    );
};
export { QRCode }