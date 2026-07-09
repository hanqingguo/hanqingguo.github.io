const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

async function init() {
  const [report, catalog] = await Promise.all([
    fetch("data/example-quality.json").then(response => response.json()),
    fetch("data/catalog.json").then(response => response.json()),
  ]);
  document.querySelector("#example-grid").innerHTML = catalog.datasets.map(dataset => {
    const example = dataset.conversion_example;
    return `<a class="example-link-card" href="dataset.html?id=${encodeURIComponent(dataset.id)}"><span>${escapeHtml(dataset.name)}</span><code>${escapeHtml(example.primary_array)} ${escapeHtml(example.expected_shape)}</code><small>${escapeHtml(example.source_path)}</small></a>`;
  }).join("");
  const selected = ["timestamp_s", "csi_real", "csi_imag", "amplitude", "power_db_rel", "valid_mask"];
  document.querySelector("#array-report").innerHTML = selected.map(name => {
    const item = report.arrays[name];
    const shape = item.shape.length ? `[${item.shape.join(", ")}]` : "scalar";
    const quality = name === "valid_mask" ? `${(item.valid_fraction * 100).toFixed(1)}% valid` : `${item.nan_count ?? 0} NaN`;
    return `<div><code>${escapeHtml(name)}</code><span>${shape}</span><small>${escapeHtml(item.dtype)} · ${quality}</small></div>`;
  }).join("");
}

init().catch(error => { document.querySelector("#array-report").innerHTML = `<p>Quality report unavailable: ${escapeHtml(error.message)}</p>`; });
