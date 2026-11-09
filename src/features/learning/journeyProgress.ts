/** A saved later completion never bypasses an unfinished earlier level. */
export function journeyProgress(completed: readonly number[]) {
  let cleared = 0;
  while (cleared < 12 && completed.includes(cleared + 1)) cleared++;
  return { cleared, next: Math.min(cleared + 1, 12), chapter: Math.min(Math.floor(cleared / 3), 3), finished: cleared === 12 };
}
export function canEnterLevel(id: number, completed: readonly number[]) {
  return Number.isInteger(id) && id >= 1 && id <= 12 && id <= journeyProgress(completed).next;
}
