import Image from "next/image";
import { AUTHORS } from "@/content/authors";
import { BLOG_CATEGORIES } from "@/lib/blog/types";
import { type Post, postPath } from "@/lib/blog/posts";
import { BLOG_UI, formatDate } from "@/lib/blog/ui";

// Подпись: «Команда Bilim AI · дата · обновлено дата · N мин». Без роли,
// AI-метки и рецензента (решение по блогу); «обновлено» — только если
// пост правили после публикации.
// В карточках автор не нужен: он у всех постов один (withAuthor=false).
export function PostMeta({ post, withAuthor = true }: { post: Post; withAuthor?: boolean }) {
  const ui = BLOG_UI[post.lang];
  const author = AUTHORS[post.author as keyof typeof AUTHORS];
  return (
    <p className="post-meta">
      {withAuthor ? <span>{author ? author.name[post.lang] : post.author}</span> : null}
      <time dateTime={post.date}>{formatDate(post.date, post.lang)}</time>
      {post.updated > post.date ? (
        <span>
          {ui.updated} <time dateTime={post.updated}>{formatDate(post.updated, post.lang)}</time>
        </span>
      ) : null}
      <span>{ui.minutes(post.readingMinutes)}</span>
    </p>
  );
}

export function CategoryLabel({ post }: { post: Post }) {
  return <span className="post-category">{BLOG_CATEGORIES[post.category][post.lang]}</span>;
}

// В индексе блога заголовок карточки — h2, в «Читайте также» под постом — h3.
export function PostCard({ post, heading = "h2" }: { post: Post; heading?: "h2" | "h3" }) {
  const Heading = heading;
  return (
    <article className="post-card">
      <a className="post-card__link" href={postPath(post.lang, post.slug)}>
        <div className="post-card__cover">
          <Image
            src={post.cover}
            alt={post.coverAlt}
            width={1200}
            height={630}
            sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 400px"
          />
        </div>
        <div className="post-card__body">
          <CategoryLabel post={post} />
          <Heading>{post.title}</Heading>
          <p>{post.description}</p>
          <PostMeta post={post} withAuthor={false} />
        </div>
      </a>
    </article>
  );
}
