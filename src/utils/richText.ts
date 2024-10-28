export const convertEditorDataToHTML = (data: any[]) => {
  return data
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return `<p>${block.data.text}</p>`;
        case "header":
          return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
        case "list":
          const listItems = block.data.items
            .map((item: string) => `<li>${item}</li>`)
            .join("");
          return block.data.style === "ordered"
            ? `<ol>${listItems}</ol>`
            : `<ul>${listItems}</ul>`;
        case "image":
          return `<img src="${block.data.url}" alt="${block.data.caption}" />`;
        case "quote":
          return `<blockquote>${block.data.text}<footer>${block.data.caption}</footer></blockquote>`;
        case "code":
          return `<pre><code>${block.data.code}</code></pre>`;
        case "embed":
          return `<iframe src="${block.data.embed}" width="${block.data.width}" height="${block.data.height}" frameborder="0" allowfullscreen></iframe>`;
        case "table":
          const rows = block.data.content
            .map(
              (row: string[]) =>
                `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
            )
            .join("");
          return `<table>${rows}</table>`;
        case "delimiter":
          return `<hr />`;
        case "marker":
          return `<mark>${block.data.text}</mark>`;
        case "checklist":
          const checklistItems = block.data.items
            .map(
              (item: { text: string; checked: boolean }) =>
                `<div><input type="checkbox" ${
                  item.checked ? "checked" : ""
                } /> ${item.text}</div>`
            )
            .join("");
          return `<div>${checklistItems}</div>`;
        case "warning":
          return `<div class="warning"><strong>${block.data.title}</strong>: ${block.data.message}</div>`;
        case "linkTool":
          return `<a href="${block.data.link}" target="_blank">${block.data.meta.title}</a>`;
        case "raw":
          return block.data.html;
        case "inlineCode":
          return `<code>${block.data.text}</code>`;
        case "imageSelection":
          return `<img src="${block.data.url}" alt="${block.data?.caption}" />`;
        default:
          console.warn(`Unsupported block type: ${block.type}`);
          return "";
      }
    })
    .join("");
};
