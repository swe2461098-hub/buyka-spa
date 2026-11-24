import { DATA_MODE, LOCAL_MEMBERS_URL, API_MEMBERS_URL } from "../config.js";

let memberCache = null;

export async function getMembers() {
  if (memberCache) return memberCache;

  const url = DATA_MODE === "api" ? API_MEMBERS_URL : LOCAL_MEMBERS_URL;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Ургийн гишүүдийн өгөгдөл ачаалж чадсангүй");
  }

  memberCache = await response.json();
  return memberCache;
}
