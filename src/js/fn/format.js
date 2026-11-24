/* XSS халдлагаас хамгаалах: хэрэглэгчийн текстийг HTML entity болгоно. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// null, undefined утгыг "-" болгож, XSS-ээс хамгаалж харуулна.
export function safeValue(value) {
  return escapeHtml(value ?? "-");
}
