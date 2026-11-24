import { renderTable } from "../layouts/tableLayout.js";
import { renderNotification } from "../layouts/notificationLayout.js";

/* Хайлтын үр дүнг сонгосон төрлөөр хүснэгт болгож харуулна.
   items = олдсон гишүүд, selectedTypes = ["basic","life",...], allMembers = эцэг эхийн нэр олоход */
export function renderMemberTables(items, selectedTypes, allMembers = items) {
  if (!items.length) return renderNotification("Илэрц олдсонгүй.");
  if (!selectedTypes.length) return renderNotification("Ядаж нэг мэдээллийн төрөл сонгоно уу.");

  const nameByCode = new Map(allMembers.map((m) => [m.member_code, m.full_name]));
  return selectedTypes.map((type) => renderTableByType(type, items, nameByCode)).join("");
}

const age = (m) => {
  if (m.birth_year == null) return null;
  return m.death_year != null ? m.death_year - m.birth_year : new Date().getFullYear() - m.birth_year;
};

// Хүснэгт бүрийн багана, мөрийг тодорхойлсон тохиргоо.
const tableDefs = {
  basic: {
    title: "Танилцуулга",
    columns: [
      { key: "full_name", label: "Овог нэр" },
      { key: "gender", label: "Хүйс" },
      { key: "generation", label: "Үе" },
      { key: "clan", label: "Овог" },
      { key: "occupation", label: "Мэргэжил" },
    ],
    row: (m) => ({ ...m }),
  },
  life: {
    title: "Төрсөн, нас барсан",
    columns: [
      { key: "full_name", label: "Овог нэр" },
      { key: "birth_year", label: "Төрсөн он" },
      { key: "death_year", label: "Нас барсан он" },
      { key: "age", label: "Нас" },
      { key: "birthplace", label: "Төрсөн газар" },
    ],
    row: (m) => ({ ...m, age: age(m) }),
  },
  relations: {
    title: "Гэр бүл, удам",
    columns: [
      { key: "full_name", label: "Овог нэр" },
      { key: "father", label: "Эцэг" },
      { key: "mother", label: "Эх" },
      { key: "spouse", label: "Хань" },
      { key: "children", label: "Хүүхдүүд" },
    ],
    row: (m, names) => ({
      ...m,
      father: names.get(m.father_code),
      mother: names.get(m.mother_code),
      spouse: names.get(m.spouse_code),
      children: (m.children || []).map((c) => names.get(c) ?? c).join(", ") || null,
    }),
  },
  note: {
    title: "Тэмдэглэл",
    columns: [
      { key: "full_name", label: "Овог нэр" },
      { key: "note", label: "Тэмдэглэл" },
    ],
    row: (m) => ({ ...m }),
  },
};

function renderTableByType(type, items, names) {
  const def = tableDefs[type];
  if (!def) return "";
  return renderTable({ title: def.title, columns: def.columns, rows: items.map((m) => def.row(m, names)) });
}
