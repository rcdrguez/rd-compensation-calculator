export function detectIntent(text: string): 'neto' | 'comparar' | 'prestaciones' | 'negociar' {
  const normalized = text.toLowerCase();
  if (/liquidaci[oó]n|cesant[ií]a|preaviso/.test(normalized)) return 'prestaciones';
  if (/compar|oferta/.test(normalized)) return 'comparar';
  if (/negocia|counter|contraoferta/.test(normalized)) return 'negociar';
  return 'neto';
}
