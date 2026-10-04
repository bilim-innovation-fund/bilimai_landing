import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { SITE } from "@/lib/site";

// Посты из бэкенда ссылаются только на https://app.bilimai.kz/… (токены
// {{feature:…}}) — обычный <a>. Ссылка на сам сайт https://bilimai.kz/…
// появляется только после ручной правки — next/link с путём без origin.
function MdxLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith(`${SITE.origin}/`)) {
    return <Link href={href.slice(SITE.origin.length)} {...props} />;
  }
  return <a href={href} {...props} />;
}

// В теле постов из пакета картинок нет: обложка рендерится отдельно. Для
// ручных постов: свои файлы /images/blog/… — через next/image, чужие
// адреса — обычный ленивый <img> (remotePatterns не настроены).
function MdxImage({ src, alt = "", width, height }: ComponentPropsWithoutRef<"img">) {
  const url = typeof src === "string" ? src : "";
  const local = url.startsWith(`${SITE.origin}/images/blog/`)
    ? url.slice(SITE.origin.length)
    : url.startsWith("/images/blog/")
      ? url
      : undefined;
  if (local) {
    return (
      <Image
        src={local}
        alt={alt}
        width={Number(width) || 1600}
        height={Number(height) || 900}
        sizes="(max-width: 760px) 100vw, 720px"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} loading="lazy" decoding="async" />;
}

function MdxTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="prose__table">
      <table {...props} />
    </div>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return <div className="callout">{children}</div>;
}

const components: MDXComponents = {
  a: MdxLink,
  img: MdxImage,
  table: MdxTable,
  Callout,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
