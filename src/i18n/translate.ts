export type Messages = Readonly<Record<string, string>>;

export type Translate = (
  source: string,
  variables?: Record<string, string | number>,
) => string;

// Ключ — исходная русская строка: нет перевода — возвращается ключ.
// Подстановки — {{name}}.
export function createTranslator(messages: Messages): Translate {
  return (source, variables = {}) =>
    Object.entries(variables).reduce(
      (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
      messages[source] || source,
    );
}
