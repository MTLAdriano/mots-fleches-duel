// ─── GRILLES ──────────────────────────────────────────────────────────────
// Logique de placement Mygamify (déduite par analyse):
// dir[0] = direction du mot : R=→, B=↓
// Les lettres sont placées séquentiellement depuis (x+dx, y+dy)
// Les cases DEF intermédiaires sont des cases "mixtes" (lettre + déf)
// Une case peut appartenir à un mot horizontal ET vertical (intersection)

const GRIDS = {
  "2026-06-08": {"id":359,"rows":"16","columns":"13","grid":[{"id":"1","x":"1","y":"1","dir":"RB","def":"Change de trottoir","size_word":8},{"id":"2","x":"1","y":"1","dir":"BR","def":"Carte de tarot","size_word":6},{"id":"3","x":"3","y":"1","dir":"RB","def":"Relatif au vaccin","size_word":8},{"id":"4","x":"3","y":"1","dir":"BB","def":"Très sale","size_word":5},{"id":"5","x":"5","y":"1","dir":"RB","def":"Oiseau coloré","size_word":4},{"id":"6","x":"7","y":"1","dir":"RB","def":"Curry ou gingembre","size_word":5},{"id":"7","x":"9","y":"1","dir":"RB","def":"Exact","size_word":7},{"id":"8","x":"9","y":"1","dir":"BB","def":"Souveraine","size_word":5},{"id":"9","x":"11","y":"1","dir":"RB","def":"Sandale de plage","size_word":4},{"id":"10","x":"13","y":"1","dir":"BB","def":"Privées de parole","size_word":7},{"id":"11","x":"7","y":"2","dir":"RR","def":"Il peut être possessif","size_word":6},{"id":"12","x":"1","y":"3","dir":"RR","def":"Arme de jet","size_word":3},{"id":"13","x":"1","y":"3","dir":"BR","def":"Flasque, sans ressort","size_word":6},{"id":"14","x":"5","y":"3","dir":"RR","def":"Alliage résistant","size_word":5},{"id":"15","x":"5","y":"3","dir":"BB","def":"Protocole Internet","size_word":4},{"id":"16","x":"11","y":"3","dir":"RR","def":"Pas même culotté","size_word":2},{"id":"17","x":"11","y":"3","dir":"BB","def":"Cessation","size_word":5},{"id":"18","x":"7","y":"4","dir":"RR","def":"Il fait briller","size_word":6},{"id":"19","x":"7","y":"4","dir":"BB","def":"Sorbet","size_word":5},{"id":"20","x":"1","y":"5","dir":"RR","def":"Décret du roi","size_word":4},{"id":"21","x":"1","y":"5","dir":"BR","def":"Os de la tête","size_word":7},{"id":"22","x":"6","y":"5","dir":"RR","def":"Importuner","size_word":5},{"id":"23","x":"6","y":"5","dir":"BB","def":"Point culminant","size_word":6},{"id":"24","x":"12","y":"5","dir":"BB","def":"Il habite Florence","size_word":7},{"id":"25","x":"8","y":"6","dir":"RR","def":"Rédige","size_word":5},{"id":"26","x":"8","y":"6","dir":"BB","def":"Superlatif absolu","size_word":4},{"id":"27","x":"1","y":"7","dir":"BR","def":"Qui est dans le vrai","size_word":4},{"id":"28","x":"3","y":"7","dir":"RR","def":"Il attire le poisson","size_word":5},{"id":"29","x":"3","y":"7","dir":"BB","def":"Trop-plein","size_word":5},{"id":"30","x":"9","y":"7","dir":"RR","def":"Elle domine le corps","size_word":4},{"id":"31","x":"9","y":"7","dir":"BB","def":"À cran, nerveuse","size_word":7},{"id":"32","x":"5","y":"8","dir":"RR","def":"Teinte jaune brun","size_word":4},{"id":"33","x":"5","y":"8","dir":"BB","def":"Long bâton pointu","size_word":5},{"id":"34","x":"10","y":"8","dir":"RR","def":"Amoncel- lement","size_word":3},{"id":"35","x":"10","y":"8","dir":"BB","def":"Chic et élégant","size_word":5},{"id":"36","x":"1","y":"9","dir":"BR","def":"Nettoie en grattant","size_word":6},{"id":"37","x":"2","y":"9","dir":"BB","def":"Plus que sensible","size_word":7},{"id":"38","x":"4","y":"9","dir":"RR","def":"Grecs aussi","size_word":6},{"id":"39","x":"4","y":"9","dir":"BB","def":"Elle vit à Alep","size_word":7},{"id":"40","x":"11","y":"9","dir":"BB","def":"Obscurité","size_word":7},{"id":"41","x":"13","y":"9","dir":"BB","def":"Tomber (se)","size_word":7},{"id":"42","x":"7","y":"10","dir":"RR","def":"Sac à grain","size_word":6},{"id":"43","x":"7","y":"10","dir":"BB","def":"Complet","size_word":6},{"id":"44","x":"1","y":"11","dir":"RR","def":"Connectée","size_word":6},{"id":"45","x":"1","y":"11","dir":"BR","def":"Installée","size_word":5},{"id":"46","x":"8","y":"11","dir":"RR","def":"Usée jusqu'à la corde","size_word":5},{"id":"47","x":"6","y":"12","dir":"RR","def":"Désolant","size_word":7},{"id":"48","x":"6","y":"12","dir":"BB","def":"Aventure intime","size_word":4},{"id":"49","x":"1","y":"13","dir":"BR","def":"Monstre au Tibet","size_word":4},{"id":"50","x":"3","y":"13","dir":"RR","def":"Coup de golf","size_word":4},{"id":"51","x":"3","y":"13","dir":"BB","def":"Intonation","size_word":3},{"id":"52","x":"8","y":"13","dir":"RR","def":"et cætera","size_word":3},{"id":"53","x":"8","y":"13","dir":"BB","def":"Dialogue à deux","size_word":3},{"id":"54","x":"12","y":"13","dir":"BB","def":"Brame au bois","size_word":3},{"id":"55","x":"5","y":"14","dir":"RR","def":"Marque du temps sur la peau","size_word":4},{"id":"56","x":"10","y":"14","dir":"RR","def":"Cliché médical","size_word":3},{"id":"57","x":"10","y":"14","dir":"BB","def":"Il est mis en barres","size_word":2},{"id":"58","x":"1","y":"15","dir":"RR","def":"Fin des poursuites","size_word":7},{"id":"59","x":"1","y":"15","dir":"BR","def":"Guide de bêtes","size_word":4},{"id":"60","x":"9","y":"15","dir":"RR","def":"Déplacée","size_word":4},{"id":"61","x":"5","y":"16","dir":"RR","def":"Assurer la descendance","size_word":8}]}
};

export function fetchGrid(date = null) {
  const today = date || new Date().toISOString().split("T")[0];
  let data = GRIDS[today];
  let usedDate = today;
  if (!data) {
    usedDate = Object.keys(GRIDS).sort().reverse()[0];
    data = GRIDS[usedDate];
  }
  const rows = parseInt(data.rows);
  const cols = parseInt(data.columns);

  // Normalise les mots: parse entiers, détermine direction
  const grid = data.grid.map(w => ({
    id: parseInt(w.id),
    x: parseInt(w.x),
    y: parseInt(w.y),
    dir: w.dir,
    def: w.def,
    size: w.size_word,
    // direction réelle du mot: première lettre du dir
    isHorizontal: w.dir[0] === 'R',
    dx: w.dir[0] === 'R' ? 1 : 0,
    dy: w.dir[0] === 'B' ? 1 : 0,
  }));

  // Construit les maps
  const defMap = {};    // "x,y" -> [word, ...]
  const letterMap = {}; // "x,y" -> [{ wordId, pos }, ...]

  grid.forEach(w => {
    // Case de définition
    const dk = `${w.x},${w.y}`;
    if (!defMap[dk]) defMap[dk] = [];
    defMap[dk].push(w);

    // Cases de lettres (séquentiel, dans les limites de la grille)
    for (let i = 1; i <= w.size; i++) {
      const lx = w.x + w.dx * i;
      const ly = w.y + w.dy * i;
      if (lx < 1 || ly < 1 || lx > cols || ly > rows) break;
      const lk = `${lx},${ly}`;
      if (!letterMap[lk]) letterMap[lk] = [];
      letterMap[lk].push({ wordId: w.id, pos: i - 1 });
    }
  });

  return { date: usedDate, id: data.id, rows, cols, grid, defMap, letterMap, totalWords: grid.length };
}
