export const randomCode = (len = 6) => Array.from({ length: len }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
