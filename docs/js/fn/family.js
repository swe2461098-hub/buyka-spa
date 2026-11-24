/* Ургийн бичгийн тооцооллууд: нас, амьд эсэх, өвөг дээдэс, хамаатны холбоо.
   members = members.json-оос ирсэн массив */

const CURRENT_YEAR = new Date().getFullYear();

export const isMale = (m) => m?.gender === "эр";
export const isAlive = (m) => m?.death_year == null;

export function getAge(m) {
  if (m?.birth_year == null) return null;
  return (m.death_year ?? CURRENT_YEAR) - m.birth_year;
}

export function lifeSpan(m) {
  if (m?.birth_year == null) return "-";
  return `${m.birth_year} – ${m.death_year ?? "одоо"}`;
}

export function indexByCode(members) {
  return new Map(members.map((m) => [m.member_code, m]));
}

/* Ургийн тойм тоо баримт */
export function getStats(members) {
  const generations = new Set(members.map((m) => m.generation));
  const clans = new Set(members.map((m) => m.clan).filter(Boolean));
  const living = members.filter(isAlive);
  const years = members.map((m) => m.birth_year).filter((y) => y != null);

  return {
    total: members.length,
    generations: generations.size,
    clans: clans.size,
    living: living.length,
    male: members.filter(isMale).length,
    female: members.filter((m) => !isMale(m)).length,
    firstYear: Math.min(...years),
    span: CURRENT_YEAR - Math.min(...years),
  };
}

/* Үе бүрийн гишүүдийн тоо: [{ generation: 1, count: 2 }, ...] */
export function countByGeneration(members) {
  const map = new Map();
  members.forEach((m) => map.set(m.generation, (map.get(m.generation) || 0) + 1));
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([generation, count]) => ({ generation, count }));
}

/* Өвөг дээдсийг (эцэг, эхийн талаар) зайтай нь олно.
   Гаралт: Map(code -> { dist, via }) — via = замын эхний алхам (эцэг эсвэл эх). */
function ancestorMap(code, byCode) {
  const result = new Map([[code, { dist: 0, via: null }]]);
  const queue = [code];

  while (queue.length) {
    const cur = queue.shift();
    const node = byCode.get(cur);
    const { dist, via } = result.get(cur);

    for (const parent of [node?.father_code, node?.mother_code]) {
      if (!parent || result.has(parent)) continue;
      result.set(parent, { dist: dist + 1, via: via ?? parent });
      queue.push(parent);
    }
  }
  return result;
}

/* Эцгийн талын өвөг дээдсийн шугам: [өөрөө, эцэг, өвөг, ...] */
export function paternalLine(code, byCode) {
  const line = [];
  let cur = byCode.get(code);
  while (cur) {
    line.push(cur);
    cur = byCode.get(cur.father_code);
  }
  return line;
}

const ancestorTitle = ["", "аав", "өвөө", "элэнц өвөө", "хуланц өвөө", "өндөр өвөө"];
const ancestressTitle = ["", "ээж", "эмээ", "элэнц эмээ", "хуланц эмээ", "өндөр эмээ"];

/* B нь A-ийн хэн болохыг тооцоолно.
   Гаралт: { label: "авга ах", detail: "...", common: member|null } */
export function findRelation(codeA, codeB, members) {
  const byCode = indexByCode(members);
  const a = byCode.get(codeA);
  const b = byCode.get(codeB);
  if (!a || !b) return { label: "Гишүүн олдсонгүй", detail: "", common: null };
  if (codeA === codeB) return { label: "Өөрөө", detail: "Нэг хүнийг сонгосон байна.", common: null };

  if (a.spouse_code === codeB) {
    return { label: isMale(b) ? "нөхөр" : "эхнэр", detail: "Гэрлэсэн хосууд.", common: null };
  }

  const ancA = ancestorMap(codeA, byCode);
  const ancB = ancestorMap(codeB, byCode);

  // Хамгийн ойрын нийтлэг өвөг
  let best = null;
  for (const [code, infoA] of ancA) {
    const infoB = ancB.get(code);
    if (!infoB) continue;
    const total = infoA.dist + infoB.dist;
    if (!best || total < best.total) best = { code, dA: infoA.dist, dB: infoB.dist, viaA: infoA.via, viaB: infoB.via, total };
  }

  if (best) {
    const common = byCode.get(best.code);
    const label = bloodLabel(a, b, best, byCode);
    const detail = `Нийтлэг өвөг: ${common.full_name}. Үеийн зай — ${a.given_name}: ${best.dA}, ${b.given_name}: ${best.dB}.`;
    return { label, detail, common };
  }

  // Худ ураг: бэр, хүргэн, хадам
  const childOfA = (a.children || []).map((c) => byCode.get(c));
  if (childOfA.some((c) => c?.spouse_code === codeB)) {
    return { label: isMale(b) ? "хүргэн" : "бэр", detail: "Хүүхдийн тань гэр бүл.", common: null };
  }
  const spouse = byCode.get(a.spouse_code);
  if (spouse && (spouse.father_code === codeB || spouse.mother_code === codeB)) {
    return { label: isMale(b) ? "хадам аав" : "хадам ээж", detail: "Ханийн тань эцэг эх.", common: null };
  }
  if (b.spouse_code && findRelation(codeA, b.spouse_code, members).common) {
    const viaSpouse = findRelation(codeA, b.spouse_code, members);
    return {
      label: "худ ураг",
      detail: `${b.given_name} бол ${byCode.get(b.spouse_code).given_name} (${viaSpouse.label})-ийн ${isMale(b) ? "нөхөр" : "эхнэр"}.`,
      common: null,
    };
  }

  return { label: "Цусан төрөл биш", detail: "Ургийн бичигт нийтлэг өвөг бүртгэгдээгүй.", common: null };
}

function bloodLabel(a, b, { dA, dB, viaA }, byCode) {
  const male = isMale(b);
  const older = (b.birth_year ?? 0) < (a.birth_year ?? 0);

  // B нь A-ийн өвөг дээдэс
  if (dB === 0) return (male ? ancestorTitle : ancestressTitle)[dA] || `${dA}-р үеийн өвөг`;

  // B нь A-ийн үр удам
  if (dA === 0) {
    if (dB === 1) return male ? "хүү" : "охин";
    if (dB === 2) {
      // Хүүгийн хүүхэд = ач, охины хүүхэд = зээ
      const link = [b.father_code, b.mother_code]
        .map((c) => byCode.get(c))
        .find((p) => p && (p.father_code === a.member_code || p.mother_code === a.member_code));
      return isMale(link) ? "ач" : "зээ";
    }
    if (dB === 3) return "гуч";
    return `${dB}-р үеийн үр удам`;
  }

  // Ах дүү
  if (dA === 1 && dB === 1) return older ? (male ? "ах" : "эгч") : male ? "эрэгтэй дүү" : "эмэгтэй дүү";

  // Эцэг эхийн ах дүү: авга (эцгийн тал), нагац (эхийн тал)
  if (dA === 2 && dB === 1) {
    const side = isMale(byCode.get(viaA)) ? "авга" : "нагац";
    return `${side} ${male ? "ах" : "эгч"}`;
  }

  // Ах дүүгийн хүүхэд
  if (dA === 1 && dB === 2) return male ? "ах дүүгийн хүү" : "ах дүүгийн охин";

  // Үеэл
  if (dA === 2 && dB === 2) return `үеэл ${older ? (male ? "ах" : "эгч") : "дүү"}`;

  // Өвөө эмээгийн ах дүү
  if (dA === 3 && dB === 1) return `${isMale(byCode.get(viaA)) ? "авга" : "нагац"} ${male ? "өвөө" : "эмээ"}`;
  if (dA === 1 && dB === 3) return male ? "ах дүүгийн ач хүү" : "ах дүүгийн ач охин";

  // Үеэлийн хүүхэд, эцэг эхийн үеэл, хоёр дахь үеэл
  if (dA === 2 && dB === 3) return male ? "үеэлийн хүү" : "үеэлийн охин";
  if (dA === 3 && dB === 2) return `${isMale(byCode.get(viaA)) ? "эцгийн" : "эхийн"} үеэл`;
  if (dA === 3 && dB === 3) return `хоёр дахь үеэл ${older ? (male ? "ах" : "эгч") : "дүү"}`;

  return `${Math.max(dA, dB)}-р үеийн төрөл`;
}
