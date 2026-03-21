// src/engine/slotEngine.js
import { REELS, VISIBLE_ROWS, PAYLINES, SCATTER_PAY } from './slotConfig'; // Hapus PAYTABLE dari import

export function pickWeighted(items) {
  if (!items || items.length === 0) return null;
  const total = items.reduce((s, i) => s + (i.weight || 1), 0);
  let r = Math.random() * total;
  for (const item of items) { 
    r -= (item.weight || 1); 
    if (r <= 0) return item; 
  }
  return items[items.length - 1];
}

export function generateGrid(items) {
  return Array.from({ length: REELS }, () =>
    Array.from({ length: VISIBLE_ROWS }, () => pickWeighted(items))
  );
}

// 🔥 SEKARANG TERIMA PARAMETER 'paytable' DARI DATABASE 🔥
export function evaluateGrid(grid, bet, paytable) {
  let totalWin = 0;
  const winTileSet = new Set();
  const lineResults = [];

  for (const pl of PAYLINES) {
    const symbols = pl.coords.map(([r, row]) => grid[r][row]);
    
    const baseSymbol = symbols.find(s => s.name !== 'Wild');
    const effectiveName = baseSymbol ? baseSymbol.name : 'Wild';

    let matchCount = 0;
    for (let i = 0; i < symbols.length; i++) {
      if (symbols[i].name === effectiveName || symbols[i].name === 'Wild') {
        matchCount++;
      } else {
        break;
      }
    }

    // Ambil multiplier langsung dari database (paytable param)
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
  const scatterCoords = [];
  grid.forEach((col, r) => {
    col.forEach((sym, row) => {
      if (sym.name === 'Scatter') {
        scatterCount++;
        scatterCoords.push([r, row]);
      }
    });
  });

  let freeSpinsTriggered = false;
  if (scatterCount >= 3) {
    const safeCount = Math.min(scatterCount, 5);
    // Kalau di DB Scatter = 0, pakai SCATTER_PAY dari config sebagai cadangan
    const mult = paytable['Scatter']?.[safeCount] || SCATTER_PAY[safeCount] || 0;
    const scatterWin = bet * mult;
    
    if (scatterWin > 0) {
      totalWin += scatterWin;
      scatterCoords.forEach(([r, row]) => winTileSet.add(`${r}-${row}`));
      lineResults.push({ amount: scatterWin, lineId: 'SCATTER' });
      freeSpinsTriggered = true;
    }
  }

  return { totalWin, winTileSet, lineResults, freeSpinsTriggered, scatterCount };
}