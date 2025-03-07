import HCaptcha from '@hcaptcha/react-hcaptcha';
import React, { BaseSyntheticEvent, useState } from 'react';

interface HCaptchaProps {
    onVerify: (token: string, key: string) => void;
    captchaRef: React.RefObject<HCaptcha | null>;
}

const HCaptchaComponent = (props: HCaptchaProps) => {
    const { onVerify, captchaRef } = props;

    return (
        <HCaptcha
            sitekey={process.env.WAKU_PUBLIC_HCAPTCHA_KEY || ""}
            onVerify={onVerify}
            ref={captchaRef}
            size="invisible"
            theme="dark"
        />
    );
};

export default HCaptchaComponent;