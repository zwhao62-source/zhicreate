// 获取API密钥的工具函数

export function getARKApiKey(): string {
  return process.env.VOLC_API_KEY || '';
}

export function getVolcAccessKey(): string {
  return process.env.VOLC_ACCESSKEY || '';
}

export function getVolcSecretKey(): string {
  return process.env.VOLC_SECRETKEY || '';
}

export function hasARKCredentials(): boolean {
  return !!getARKApiKey();
}

export function hasVolcCredentials(): boolean {
  return !!getVolcAccessKey() && !!getVolcSecretKey();
}
