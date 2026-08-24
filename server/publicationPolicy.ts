export const MAX_POSTS_PER_DAY = 10;

export function effectiveDailyLimit(configuredLimit: number) {
  return Math.max(0, Math.min(MAX_POSTS_PER_DAY, configuredLimit));
}

export function hasDailyPublicationCapacity(existingCount: number, configuredLimit: number) {
  return existingCount < effectiveDailyLimit(configuredLimit);
}
