// Обычный <script>, не next/script: разметка должна быть в HTML сразу.
// "<" экранируется, чтобы строка из данных не закрыла тег.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
