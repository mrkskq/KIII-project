export function damLev(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const d = new Map<number, number>();
  const idx = (i: number, j: number) => i * (n + 1) + j;
  const get = (i: number, j: number): number => d.get(idx(i, j)) ?? 0;

  for (let i = 0; i <= m; i++) d.set(idx(i, 0), i);
  for (let j = 0; j <= n; j++) d.set(idx(0, j), j);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let val = Math.min(get(i - 1, j) + 1, get(i, j - 1) + 1, get(i - 1, j - 1) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        val = Math.min(val, get(i - 2, j - 2) + cost);
      }
      d.set(idx(i, j), val);
    }
  }

  return get(m, n);
}

export function fuzzyMatch(word: string, dest: string): boolean {
  if (word.length < 4) return false;
  if (Math.abs(word.length - dest.length) > 2) return false;
  const maxDist = Math.max(1, Math.floor(dest.length * 0.3));
  return damLev(word, dest) <= maxDist;
}