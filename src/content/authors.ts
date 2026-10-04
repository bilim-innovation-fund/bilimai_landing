// Авторы блога: id из поля author фронтматтера. Бэкенд всегда пишет
// bilimai-team (apps/blog/bundle.py::AUTHOR_ID). На сайте — только подпись
// команды, без AI-метки и имени рецензента; в JSON-LD автор — Organization.
//
// Без path-алиасов: модуль импортирует next.config.ts (через validate.ts).
export const AUTHORS = {
  "bilimai-team": {
    type: "Organization",
    name: { ru: "Команда Bilim AI", kk: "Bilim AI командасы" },
  },
} as const;

export type AuthorId = keyof typeof AUTHORS;
