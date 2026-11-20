import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.babmukdang.app',
    appName: '밥먹당',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert']
        }
    }
}

export default config
