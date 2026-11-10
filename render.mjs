// Renders posts.json into posts/NN.jpg (1080x1350) and posts/NN.txt (caption).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PALETTES = [["#f6efe4", "#d9822b"], ["#e8f0ea", "#3f8a5f"], ["#e9ecf5", "#4a63b5"], ["#f5e9ec", "#b5486a"]];
const posts = JSON.parse(readFileSync("posts.json", "utf8"));
mkdirSync("posts", { recursive: true });

posts.forEach((p, i) => {
  const n = String(i + 1).padStart(2, "0");
  const [bg, accent] = PALETTES[i % PALETTES.length];
  const html = `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;width:1080px;height:1350px;overflow:hidden}
    body{font-family:"Apple SD Gothic Neo",sans-serif;background:${bg};color:#1f1d1a;display:flex;flex-direction:column;justify-content:space-between;padding:110px 100px;box-sizing:border-box}
    .tag{font-size:34px;font-weight:600;letter-spacing:2px;opacity:.6}
    .num{font-size:220px;font-weight:800;line-height:1;color:${accent}}
    h1{font-size:104px;font-weight:800;line-height:1.2;margin:30px 0 40px;letter-spacing:-2px}
    p{font-size:44px;line-height:1.6;margin:0;opacity:.8}
    .foot{display:flex;justify-content:space-between;font-size:32px;opacity:.55}
  </style><body><div class="tag">작은 습관 시리즈</div>
  <div><div class="num">${n}</div><h1>${p.title}</h1><p>${p.body}</p></div>
  <div class="foot"><span>저장해두고 내일 해보기</span><span>${i + 1} / ${posts.length}</span></div></body>`;

  writeFileSync("posts/tmp.html", html);
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1080,1350", `--screenshot=${resolve("posts/tmp.png")}`, `file://${resolve("posts/tmp.html")}`], { stdio: "ignore" });
  // Instagram accepts JPEG only.
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "90", "posts/tmp.png", "--out", `posts/${n}.jpg`], { stdio: "ignore" });
  writeFileSync(`posts/${n}.txt`, p.caption);
});
rmSync("posts/tmp.html"); rmSync("posts/tmp.png");
console.log(`Rendered ${posts.length} posts`);
