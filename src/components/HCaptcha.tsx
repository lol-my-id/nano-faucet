import HCaptcha from '@hcaptcha/react-hcaptcha';
import React from 'react';

interface HCaptchaProps {
    onVerify: (token: string, key: string) => void;
    captchaRef: React.RefObject<HCaptcha | null>;
    onClose?: () => void;
    onError?: (event: string) => void;
    onExpire?: () => void;
}

const HCaptchaComponent = (props: HCaptchaProps) => {
    const { onVerify, captchaRef, onClose, onError, onExpire } = props;

    return (
        <HCaptcha
            sitekey={process.env.WAKU_PUBLIC_HCAPTCHA_KEY || ""}
            onVerify={onVerify}
            {...(onClose ? { onClose } : {})}
            {...(onError ? { onError } : {})}
            {...(onExpire ? { onExpire } : {})}
            ref={captchaRef}
            size="invisible"
            theme="dark"
        />
    );
};

export default HCaptchaComponent;
