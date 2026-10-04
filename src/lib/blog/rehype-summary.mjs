// rehype-плагин: всё от последнего H2 до конца поста оборачивается в
// <section class="post-summary" aria-labelledby="<id h2>">. По контракту
// последний раздел — «Итог для учителя» / «Мұғалімге қорытынды»: его чаще
// всего цитируют. Именно section, а не aside: Readability и trafilatura
// вырезают <aside> целиком, и итог пропал бы из извлечённого текста.
//
// Идёт после rehype-slug (id у заголовков уже есть). Подключается в
// next.config.ts строкой с абсолютным путём.
export default function rehypeSummary() {
  return (tree) => {
    const children = tree.children || [];
    let index = -1;
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const node = children[i];
      if (node.type === "element" && node.tagName === "h2") {
        index = i;
        break;
      }
    }
    if (index < 0) return;
    const heading = children[index];
    const id = heading.properties && heading.properties.id;
    const section = {
      type: "element",
      tagName: "section",
      properties: id
        ? { className: ["post-summary"], ariaLabelledBy: String(id) }
        : { className: ["post-summary"] },
      children: children.slice(index),
    };
    tree.children = [...children.slice(0, index), section];
  };
}
