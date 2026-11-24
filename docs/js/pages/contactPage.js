import { renderPageLayout } from "../layouts/pageLayout.js";
import { renderNotification } from "../layouts/notificationLayout.js";
import { escapeHtml } from "../fn/format.js";

const requestTypes = [
  ["add", "Шинэ гишүүн нэмүүлэх"],
  ["edit", "Мэдээлэл засуулах"],
  ["photo", "Гэрэл зураг, түүх илгээх"],
  ["other", "Бусад"],
];

const infoCards = [
  { icon: "fa-user-tie", title: "Ургийн бичиг хөтлөгч", text: "Ганбаатар Номин" },
  { icon: "fa-location-dot", title: "Ууган гэр", text: "Архангай аймаг, Цэнхэр сум" },
  { icon: "fa-calendar-days", title: "Ургийн их цуглаан", text: "Жил бүрийн Наадмын дараах бямба гараг" },
];

function field(id, label, input, help = "") {
  return `
    <div class="field">
      <label class="label" for="${id}">${label}</label>
      <div class="control">${input}</div>
      <p class="help is-danger" data-error-for="${id}">${help}</p>
    </div>`;
}

function validate(data) {
  const errors = {};
  if (data.name.length < 2) errors.cName = "Нэрээ оруулна уу.";
  if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.cEmail = "Зөв и-мэйл хаяг оруулна уу.";
  if (data.message.length < 10) errors.cMessage = "Хүсэлтээ 10-аас дээш тэмдэгтээр бичнэ үү.";
  return errors;
}

export function renderContactPage() {
  const app = document.getElementById("app");

  app.innerHTML = renderPageLayout({
    id: "contact",
    title: "Холбоо барих",
    content: `
      <p class="mb-5">Ургийн бичигт шинэ гишүүн нэмүүлэх, буруу мэдээлэл засуулах, хуучин гэрэл зураг, дурсамж илгээх бол доорх маягтыг бөглөнө үү.</p>
      <div class="columns">
        <div class="column is-7">
          <form class="box" id="contactForm" novalidate>
            ${field("cName", "Овог нэр", `<input class="input" id="cName" name="name" placeholder="Жишээ: Тэмүүлэн Билгүүн">`)}
            ${field("cEmail", "И-мэйл", `<input class="input" id="cEmail" name="email" type="email" placeholder="name@example.com">`)}
            ${field(
              "cType",
              "Хүсэлтийн төрөл",
              `<div class="select is-fullwidth"><select id="cType" name="type">${requestTypes
                .map(([v, t]) => `<option value="${v}">${t}</option>`)
                .join("")}</select></div>`,
            )}
            ${field("cMessage", "Хүсэлт", `<textarea class="textarea" id="cMessage" name="message" rows="5" placeholder="Хэний тухай, ямар мэдээлэл болохыг бичнэ үү"></textarea>`)}
            <button class="button is-primary" type="submit">
              <span class="icon"><i class="fas fa-paper-plane"></i></span><span>Илгээх</span>
            </button>
            <div id="contactResult" class="mt-4" aria-live="polite"></div>
          </form>
        </div>
        <div class="column">
          ${infoCards
            .map(
              (c) => `
            <div class="box app-info-card">
              <span class="icon is-medium has-text-warning"><i class="fas ${c.icon} fa-lg"></i></span>
              <div><p class="has-text-weight-bold">${c.title}</p><p>${c.text}</p></div>
            </div>`,
            )
            .join("")}
        </div>
      </div>
    `,
  });

  const form = document.getElementById("contactForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      type: String(fd.get("type")),
      message: String(fd.get("message") || "").trim(),
    };

    const errors = validate(data);
    form.querySelectorAll("[data-error-for]").forEach((p) => {
      const id = p.getAttribute("data-error-for");
      p.textContent = errors[id] || "";
      document.getElementById(id)?.classList.toggle("is-danger", Boolean(errors[id]));
    });
    if (Object.keys(errors).length) return;

    // Сервер холбогдоогүй тул хүсэлтийг зөвхөн харуулж, маягтыг цэвэрлэнэ.
    const typeLabel = requestTypes.find(([v]) => v === data.type)?.[1];
    document.getElementById("contactResult").innerHTML = renderNotification(
      `Баярлалаа, <strong>${escapeHtml(data.name)}</strong>! "${escapeHtml(typeLabel)}" хүсэлтийг хүлээн авлаа. Хариуг ${escapeHtml(data.email)} хаягаар илгээнэ.`,
      "success",
    );
    form.reset();
  });
}
