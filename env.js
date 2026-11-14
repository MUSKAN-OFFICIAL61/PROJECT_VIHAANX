const env = {
    port: Number(process.env.PORT) || 3000,

    maritime: {
        mode: process.env.MARITIME_MODE || 'development',
        baseUrl: process.env.MARITIME_BASE_URL || 'https://maritime.sh'
    },

    prune: {
        baseUrl: process.env.PRUNE_BASE_URL || 'https://api.withprune.com',
        shieldEnabled: process.env.PRUNE_SHIELD_ENABLED === 'true'
    },

    getSafeConfig() {
        return {
            port: this.port,
            maritime: {
                mode: this.maritime.mode,
                baseUrl: this.maritime.baseUrl
            },
            prune: {
                baseUrl: this.prune.baseUrl,
                shieldEnabled: this.prune.shieldEnabled
            }
        };
    }
};

module.exports = env;