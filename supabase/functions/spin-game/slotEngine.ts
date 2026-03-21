// supabase/functions/spin-game/slotEngine.ts

export const REELS = 5;
export const VISIBLE_ROWS = 3;

export const PAYLINES = [
  { id: 0, coords: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
  { id: 1, coords: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]] },
  { id: 2, coords: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]] },
  { id: 3, coords: [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]] },
  { id: 4, coords: [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]] },
];

export const SCATTER_PAY = { 3: 5, 4: 20, 5: 100 };

export function pickWeighted(items: any[]) {
  if (!items || items.length === 0) return null;
  const total = items.reduce((s, i) => s + (i.weight || 1), 0);
  let r = Math.random() * total;
  for (const item of items) { 
    r -= (item.weight || 1); 
    if (r <= 0) return item; 
  }
  return items[items.length - 1];
}

export function generateGrid(items: any[]) {
  return Array.from({ length: REELS }, () =>
    Array.from({ length: VISIBLE_ROWS }, () => pickWeighted(items))
  );
}

export function evaluateGrid(grid: any[][], bet: number, paytable: any) {
  let totalWin = 0;
  const winTileSet = new Set<string>();
  const lineResults: any[] = [];

  for (const pl of PAYLINES) {
    const symbols = pl.coords.map(([r, row]) => grid[r][row]);
    const baseSymbol = symbols.find(s => s.name !== 'Wild');
    const effectiveName = baseSymbol ? baseSymbol.name : 'Wild';

    let matchCount = 0;
    for (let i = 0; i < symbols.length; i++) {
      if (symbols[i].name === effectiveName || symbols[i].name === 'Wild') {
        matchCount++;
      } else break;
    }

    if (matchCount >= 3 && paytable[effectiveName] && paytable[effectiveName][matchCount]) {
      const multiplier = paytable[effectiveName][matchCount];
      const win = Math.round(multiplier * bet);
      if (win > 0) {
        totalWin += win;
        pl.coords.slice(0, matchCount).forEach(([r, row]) => winTileSet.add(`${r}-${row}`));
        lineResults.push({ amount: win, lineId: pl.id });
      }
    }
  }

  let scatterCount = 0;
  const scatterCoords: number[][] = [];
  grid.forEach((col, r) => {
    col.forEach((sym, row) => {
      if (sym.name === 'Scatter') {
        scatterCount++;
        scatterCoords.push([r, row]);
      }
    });
  });

  if (scatterCount >= 3) {
    const safeCount = Math.min(scatterCount, 5);
    const mult = paytable['Scatter']?.[safeCount] || SCATTER_PAY[safeCount as keyof typeof SCATTER_PAY] || 0;
    const scatterWin = bet * mult;
    if (scatterWin > 0) {
      totalWin += scatterWin;
      scatterCoords.forEach(([r, row]) => winTileSet.add(`${r}-${row}`));
      lineResults.push({ amount: scatterWin, lineId: 'SCATTER' });
    }
  }

  return { totalWin, winTileSet, lineResults };
}