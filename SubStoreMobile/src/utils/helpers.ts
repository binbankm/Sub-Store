import { ProxyType, TargetPlatform } from '../types';

export const PROXY_TYPE_LABELS: Record<ProxyType, string> = {
  ss: 'Shadowsocks',
  ssr: 'ShadowsocksR',
  vmess: 'VMess',
  vless: 'VLESS',
  trojan: 'Trojan',
  http: 'HTTP',
  socks5: 'SOCKS5',
  snell: 'Snell',
  wireguard: 'WireGuard',
  hysteria: 'Hysteria',
  hysteria2: 'Hysteria 2',
  tuic: 'TUIC',
  ssh: 'SSH',
  anytls: 'AnyTLS',
  unknown: 'Unknown',
};

export const TARGET_PLATFORMS: { value: TargetPlatform; label: string }[] = [
  { value: 'ClashMeta', label: 'Clash.Meta (mihomo)' },
  { value: 'Stash', label: 'Stash' },
  { value: 'Surge', label: 'Surge' },
  { value: 'SurgeMac', label: 'Surge Mac' },
  { value: 'Loon', label: 'Loon' },
  { value: 'Shadowrocket', label: 'Shadowrocket' },
  { value: 'QX', label: 'Quantumult X' },
  { value: 'sing-box', label: 'sing-box' },
  { value: 'Egern', label: 'Egern' },
  { value: 'Clash', label: 'Clash (Legacy)' },
  { value: 'V2Ray', label: 'V2Ray' },
  { value: 'URI', label: 'URI' },
];

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatFlowInfo(upload: number, download: number, total: number): string {
  const used = upload + download;
  const usedStr = formatBytes(used);
  const totalStr = formatBytes(total);
  const percentage = total > 0 ? ((used / total) * 100).toFixed(1) : '0';
  return `${usedStr} / ${totalStr} (${percentage}%)`;
}

export function getProxyTypeColor(type: ProxyType): string {
  const colors: Record<ProxyType, string> = {
    ss: '#6C63FF',
    ssr: '#8B5CF6',
    vmess: '#3B82F6',
    vless: '#06B6D4',
    trojan: '#F59E0B',
    http: '#10B981',
    socks5: '#84CC16',
    snell: '#EC4899',
    wireguard: '#14B8A6',
    hysteria: '#F97316',
    hysteria2: '#FB923C',
    tuic: '#A855F7',
    ssh: '#6B7280',
    anytls: '#EF4444',
    unknown: '#9CA3AF',
  };
  return colors[type] || colors.unknown;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getRegionFlag(name: string): string {
  const regionMap: Record<string, string> = {
    '🇭🇰': 'HK', '🇯🇵': 'JP', '🇺🇸': 'US', '🇸🇬': 'SG',
    '🇰🇷': 'KR', '🇹🇼': 'TW', '🇬🇧': 'UK', '🇩🇪': 'DE',
    '🇫🇷': 'FR', '🇦🇺': 'AU', '🇨🇦': 'CA', '🇳🇱': 'NL',
    '🇷🇺': 'RU', '🇮🇳': 'IN', '🇧🇷': 'BR', '🇮🇱': 'IL',
    '🇦🇷': 'AR', '🇹🇭': 'TH', '🇻🇳': 'VN', '🇲🇾': 'MY',
    '🇵🇭': 'PH', '🇮🇩': 'ID', '🇹🇷': 'TR', '🇺🇦': 'UA',
  };

  const upperName = name.toUpperCase();
  
  for (const [flag, code] of Object.entries(regionMap)) {
    if (name.includes(flag)) return flag;
    if (upperName.includes(code)) return flag;
  }

  const countryPatterns: Record<string, string> = {
    '香港': '🇭🇰', '日本': '🇯🇵', '美国': '🇺🇸', '新加坡': '🇸🇬',
    '韩国': '🇰🇷', '台湾': '🇹🇼', '英国': '🇬🇧', '德国': '🇩🇪',
    '法国': '🇫🇷', '澳大利亚': '🇦🇺', '加拿大': '🇨🇦', '荷兰': '🇳🇱',
    '俄罗斯': '🇷🇺', '印度': '🇮🇳', '巴西': '🇧🇷', '以色列': '🇮🇱',
    '阿根廷': '🇦🇷', '泰国': '🇹🇭', '越南': '🇻🇳', '马来西亚': '🇲🇾',
    '菲律宾': '🇵🇭', '印度尼西亚': '🇮🇩', '土耳其': '🇹🇷', '乌克兰': '🇺🇦',
  };

  for (const [keyword, flag] of Object.entries(countryPatterns)) {
    if (name.includes(keyword)) return flag;
  }

  return '🌐';
}
