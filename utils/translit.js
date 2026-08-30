// Cyrillic (UA/RU) → Latin transliteration for ASCII login handles.
const MAP = { а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ye',ж:'zh',з:'z',и:'y',і:'i',ї:'yi',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' };

const translit = (s) => (s || '')
    .toLowerCase()
    .split('')
    .map((ch) => (Object.prototype.hasOwnProperty.call(MAP, ch) ? MAP[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '');

// URL/handle-safe slug, never empty.
const slugify = (s) => translit(s) || 'inst';

module.exports = { translit, slugify };
