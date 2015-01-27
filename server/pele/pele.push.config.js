Push.Configure({
    gcm: {
        apiKey: CONFIG.PUSH.GCM_API_KEY
    },
    apn: {
        // setting this on client throws security error
        passphrase: CONFIG.PUSH.APN_PASSPHRASE,
        // pem files are placed in the app private folder
        certData: Assets.getText(CONFIG.PUSH.APN_CERT_PATH),
        keyData: Assets.getText(CONFIG.PUSH.APN_KEY_PATH),
    },
    production: CONFIG.PUSH.PRODUCTION, // use production server or sandbox
});  
