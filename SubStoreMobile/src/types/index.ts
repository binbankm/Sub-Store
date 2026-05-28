export type SubscriptionSource = 'remote' | 'local';

export type ProxyType =
  | 'ss'
  | 'ssr'
  | 'vmess'
  | 'vless'
  | 'trojan'
  | 'http'
  | 'socks5'
  | 'snell'
  | 'wireguard'
  | 'hysteria'
  | 'hysteria2'
  | 'tuic'
  | 'ssh'
  | 'anytls'
  | 'unknown';

export type TargetPlatform =
  | 'Clash'
  | 'ClashMeta'
  | 'Stash'
  | 'Surge'
  | 'SurgeMac'
  | 'Loon'
  | 'Egern'
  | 'Shadowrocket'
  | 'QX'
  | 'sing-box'
  | 'V2Ray'
  | 'URI';

export interface Proxy {
  name: string;
  type: ProxyType;
  server: string;
  port: number;
  [key: string]: any;
}

export interface Subscription {
  name: string;
  displayName?: string;
  source: SubscriptionSource;
  url?: string;
  content?: string;
  ua?: string;
  proxy?: ProxyConfig;
  ignoreFailedRemoteSub?: boolean;
  mergeSources?: 'localFirst' | 'remoteFirst';
  process?: Process[];
  subUserinfo?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Process {
  type: string;
  args: Record<string, any>;
}

export interface Collection {
  name: string;
  displayName?: string;
  subscriptions: string[];
  process?: Process[];
  createdAt: number;
  updatedAt: number;
}

export interface Artifact {
  name: string;
  displayName?: string;
  type: 'subscription' | 'collection';
  platform: TargetPlatform;
  source: string;
  content?: string;
  sync?: boolean;
  autoUpdate?: boolean;
  updateTime?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Token {
  name: string;
  token: string;
  type: 'sub' | 'collection';
  exp?: number;
}

export interface AppSettings {
  server: {
    url: string;
    token?: string;
  };
  appearanceSetting: {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh-CN' | 'en-US';
    showType: boolean;
    showAddress: boolean;
    showPort: boolean;
    nodeDisplayLimit?: number;
  };
  syncSetting: {
    gistId?: string;
    gistToken?: string;
    autoSync: boolean;
  };
  requestSetting: {
    timeout: number;
    userAgent: string;
    ignoreFailedRemoteSub: boolean;
    proxy?: ProxyConfig;
  };
}

export interface ProxyConfig {
  type: 'http' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface FlowInfo {
  upload: number;
  download: number;
  total: number;
  expire: number;
  remainingDays?: number;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'failed';
  data?: T;
  message?: string;
}

export interface NodeInfo {
  name: string;
  type: ProxyType;
  server: string;
  port: number;
  alive: boolean;
  delay?: number;
}
