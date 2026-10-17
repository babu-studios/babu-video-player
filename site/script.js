// Points the buttons at the latest release's DMGs; the static href (releases page) is the fallback.
const API = "https://api.github.com/repos/babu-studios/babu-video-player/releases/latest";

fetch(API)
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then((rel) => {
    for (const arch of ["arm64", "x64"]) {
      const asset = rel.assets.find((a) => a.name.endsWith(`-${arch}.dmg`));
      if (!asset) continue;
      document.getElementById(`dl-${arch}`).href = asset.browser_download_url;
      document.querySelector(`[data-size="${arch}"]`).textContent =
        `.dmg, ${Math.round(asset.size / 1048576)} MB`;
    }
    document.getElementById("version").textContent = `Version ${rel.tag_name.replace(/^v/, "")}`;
  })
  .catch(() => {});
