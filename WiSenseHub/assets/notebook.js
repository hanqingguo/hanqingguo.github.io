const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

function renderMarkdown(source) {
  const lines = source.split(/\n/);
  const html = [];
  let inFence = false;
  let fence = [];
  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inFence) {
        html.push(`<pre><code>${escapeHtml(fence.join("\n"))}</code></pre>`);
        fence = [];
      }
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      fence.push(line);
    } else if (line.startsWith("# ")) {
      html.push(`<h2>${escapeHtml(line.slice(2))}</h2>`);
    } else if (line.startsWith("## ")) {
      html.push(`<h3>${escapeHtml(line.slice(3))}</h3>`);
    } else if (line.trim()) {
      html.push(`<p>${escapeHtml(line).replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`);
    }
  }
  return html.join("");
}

function streamText(output) {
  if (output.output_type === "stream") return output.text || "";
  if (output.output_type === "execute_result" || output.output_type === "display_data") {
    const data = output.data || {};
    if (data["text/plain"]) return Array.isArray(data["text/plain"]) ? data["text/plain"].join("") : data["text/plain"];
  }
  if (output.output_type === "error") return `${output.ename}: ${output.evalue}`;
  return "";
}

function renderCell(cell, index) {
  const source = Array.isArray(cell.source) ? cell.source.join("") : cell.source || "";
  if (cell.cell_type === "markdown") {
    return `<article class="nb-cell nb-markdown">${renderMarkdown(source)}</article>`;
  }
  const outputs = (cell.outputs || []).map(streamText).filter(Boolean).join("");
  return `<article class="nb-cell nb-code">
    <div class="nb-input-label">In [${cell.execution_count ?? " "}]:</div>
    <pre><code>${escapeHtml(source)}</code></pre>
    ${outputs ? `<div class="nb-output-label">Out:</div><pre class="nb-output"><code>${escapeHtml(outputs)}</code></pre>` : ""}
  </article>`;
}

async function init() {
  const response = await fetch("notebooks/quickstart.ipynb");
  const notebook = await response.json();
  document.querySelector("#notebook-root").innerHTML = notebook.cells.map(renderCell).join("");
}

init().catch(error => {
  document.querySelector("#notebook-root").innerHTML = `<p>Notebook could not be loaded: ${escapeHtml(error.message)}</p>`;
});
