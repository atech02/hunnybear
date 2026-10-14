interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
  };
}

const config: CapacitorConfig = {
  appId: 'com.hunnybear.game',
  appName: 'Hunny Bear',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
