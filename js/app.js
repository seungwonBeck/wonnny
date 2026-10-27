const D = window.DATA, P = D.profile;
const $ = (s, r = document) => r.querySelector(s);
const sorted = [...D.projects].sort((a, b) => a.sortOrder - b.sortOrder);
const SV = (d, c = "none") => `<svg viewBox="0 0 24 24" width="16" height="16" fill="${c}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  html: "5", css: "3", js: "JS", next: "N",
  react: SV('<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>'),
  figma: SV('<circle cx="9" cy="6" r="3" fill="#f24e1e" stroke="none"/><circle cx="15" cy="6" r="3" fill="#ff7262" stroke="none"/><circle cx="9" cy="12" r="3" fill="#a259ff" stroke="none"/><circle cx="15" cy="12" r="3" fill="#1abcfe" stroke="none"/><circle cx="9" cy="18" r="3" fill="#0acf83" stroke="none"/>'),
  uxui: SV('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M4 9h16M10 9v12"/>'),
  research: SV('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>')
};
const LABEL = { html: "HTML", css: "CSS", js: "JavaScript", react: "React", next: "Next.js", research: "사용자 리서치 조사방법", figma: "Figma 마스터", uxui: "UX/UI 마스터" };
const chip = (k, dim, i) => `<span class="chip${dim ? " dim" : ""}" style="--i:${i}"><i class="ic ${k}">${ICON[k]}</i>${LABEL[k]}</span>`;
const pad = n => String(n).padStart(2, "0");
document.documentElement.classList.add("js");

const media = (s, cls = "") => `<div class="media ${cls}">${s.src
  ? `<img src="${s.src}" alt="${s.alt || ""}" loading="lazy">`
  : `<div class="ph" style="--r:${s.ratio || "16/10"}" role="img" aria-label="${s.alt || ""}">${s.label || "Image"}</div>`}</div>`;
const thumb = p => media({ src: p.thumbnail, alt: p.title + " 대표 화면", label: p.title });

/* ---------- 페이지별 렌더 ---------- */
function renderHome() {
  const wl = document.querySelector('.nav a[href="#work"]'); if (wl) wl.textContent = `Work (${sorted.length})`;
  const feats = sorted.filter(p => p.featured), rest = sorted.filter(p => !p.featured);
  $("#hero-h1").textContent = P.headline;
  heroCollage();
  const cats = [...new Set(sorted.map(p => p.category))];
  $("#filter").innerHTML = [["all", "All", sorted.length], ...cats.map(c => [c, c, sorted.filter(p => p.category === c).length])]
    .map(([k, l, n], i) => `<button data-f="${k}" aria-pressed="${i === 0}">${l}<sup>(${n})</sup></button>`).join("");
  $("#hfilter").innerHTML = $("#filter").innerHTML;
  $("#hfilter").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $(`#filter [data-f="${b.dataset.f}"]`).click();
    $("#work").scrollIntoView();
    setMenu(false);
  });
  const setMenu = o => { $("#panel").classList.toggle("open", o); $("#burger").setAttribute("aria-expanded", o); };
  $("#burger").addEventListener("click", () => setMenu($("#burger").getAttribute("aria-expanded") !== "true"));
  $("#panel .btn").addEventListener("click", () => setMenu(false));
  addEventListener("keydown", e => e.key === "Escape" && setMenu(false));
  $("#filter").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $("#filter").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
    document.querySelectorAll("[data-cat]").forEach(el => el.hidden = b.dataset.f !== "all" && el.dataset.cat !== b.dataset.f);
  });
  $("#feat").innerHTML = feats.map((p, i) => `
    <article class="feat rv" data-cat="${p.category}">
      <a class="mlink" href="project.html?p=${p.slug}" aria-label="${p.title} 상세 보기">${thumb({ ...p, thumbnail: p.cover || p.thumbnail })}</a>
      <div class="info">
        <h3><span class="no">${pad(i + 1)} · ${p.stage}</span>${p.title}</h3>
        <div class="learn" aria-label="습득한 기술"><span class="lh">습득</span>${(() => {
          const prior = feats.slice(0, i).flatMap(f => f.learned || []);
          return (prior.length ? `<span class="prior">${prior.map((k, j) => chip(k, true, j)).join("")}<span class="plus">+</span></span><button type="button" class="chip morebtn" style="--i:0" aria-expanded="false">+${prior.length} 더보기</button>` : "") + (p.learned || []).map((k, j) => chip(k, false, prior.length + j)).join("");
        })()}</div>
        <div class="desc">
          <div class="dtext"><p>${p.summary}</p><p class="abil"><b>확장한 역량</b> ${p.ability}</p>
            <dl class="meta"><dt>유형</dt><dd>${p.projectType}</dd><dt>역할</dt><dd>${p.role}</dd><dt>기간</dt><dd>${p.period}</dd></dl></div>
          <div class="acts"><a class="pbtn" href="project.html?p=${p.slug}">상세 보기<span aria-hidden="true">→</span></a>${(() => {
            const l = p.links.find(x => x.label === "실제 사이트" || x.label === "Behance");
            return l ? `<a class="pbtn outline" href="${l.url}" target="_blank" rel="noopener">사이트 보기<span aria-hidden="true">↗</span></a>` : "";
          })()}</div>
        </div>
      </div></article>`).join("");
  $("#more").innerHTML = rest.map(p => `
    <a class="card rv" data-cat="${p.category}" href="project.html?p=${p.slug}">${thumb(p)}<h3>${p.title}</h3><p>${p.category} · ${p.summary}</p></a>`).join("");
  // 습득 줄: 한 줄에 다 들어가면 그대로, 넘치면 이전 습득을 '+N 더보기'로 접는다
  const fit = () => document.querySelectorAll(".learn").forEach(l => {
    l.classList.remove("collapsed");
    if (l.classList.contains("open")) return;
    const items = [...l.querySelectorAll(":scope > *:not(.prior):not(.morebtn), .prior > *")], gap = 8;
    const total = items.reduce((a, el) => a + el.offsetWidth, 0) + gap * Math.max(items.length - 1, 0);
    if (total > l.clientWidth && l.querySelector(".prior")) l.classList.add("collapsed");
  });
  $("#feat").addEventListener("click", e => {
    const b = e.target.closest(".morebtn"); if (!b) return;
    const l = b.closest(".learn"), open = l.classList.toggle("open");
    l.classList.remove("collapsed"); b.setAttribute("aria-expanded", open);
    b.textContent = open ? "접기" : `+${l.querySelectorAll(".prior .chip").length} 더보기`;
    if (!open) fit();
  });
  fit(); addEventListener("resize", fit); document.fonts && document.fonts.ready.then(fit);
  $("#skills").innerHTML = P.skills.map(s => `<li><b>${s.tool}</b><br>${s.use}</li>`).join("");
  $("#process").innerHTML = P.process.map(t => `<li>${t}</li>`).join("");
  $("#bio").textContent = P.bio;
  $("#intro").textContent = P.intro;
}

function renderProject() {
  const slug = new URLSearchParams(location.search).get("p");
  const i = sorted.findIndex(p => p.slug === slug);
  if (i < 0) { $("#app").innerHTML = `<div class="wrap"><a class="back" href="index.html#work">← Work</a><p>프로젝트를 찾을 수 없습니다.</p></div>`; return; }
  const p = sorted[i], next = sorted[(i + 1) % sorted.length];
  document.title = `${p.title} — ${P.name}`;
  const blk = (h, body) => body ? `<section class="wrap block rv"><h2>${h}</h2><div class="body">${body}</div></section>` : "";
  const link = (u, t) => `<a class="btn blue" style="margin:0 8px 8px 0" href="${u}" target="_blank" rel="noopener">${t}</a>`;
  $("#app").innerHTML = `
    <div class="wrap"><a class="back" href="index.html#work">← Work</a></div>
    <header class="wrap p-hero"><p class="eyebrow">${p.stage ? p.stage + " · " : ""}${p.category}</p><div class="p-title"><h1>${p.title}</h1><div class="p-acts">${(() => {
      const out = [], one = p.links.filter(l => /PDF$/.test(l.label)).length === 1;
      const site = p.links.find(x => x.label === "실제 사이트"), be = p.links.find(x => x.label === "Behance");
      if (site) out.push(`<a class="pbtn site" href="${site.url}" target="_blank" rel="noopener">사이트 바로가기<span aria-hidden="true">↗</span></a>`);
      if (be) out.push(`<a class="pbtn site" href="${be.url}" target="_blank" rel="noopener">Behance 바로가기<span aria-hidden="true">↗</span></a>`);
      if (p.original) p.links.filter(l => /PDF$/.test(l.label)).forEach(l => { const n = one ? "" : l.label.replace(/\s*PDF$/, "") + " "; out.push(`<a class="pbtn outline" href="${l.url}" target="_blank" rel="noopener">${n}PDF 보기<span aria-hidden="true">↗</span></a><a class="pbtn" href="${l.url}" download>${n}PDF 다운로드<span aria-hidden="true">↓</span></a>`); });
      return out.join("");
    })()}</div></div><p class="lead">${p.summary}</p>${p.description ? `<p class="lead sub">${p.description}</p>` : ""}
      <dl class="facts">
        <div><dt>유형</dt><dd>${p.projectType}</dd></div><div><dt>기간</dt><dd>${p.period}</dd></div>
        <div><dt>역할</dt><dd>${p.role}</dd></div>${p.tools.length ? `<div><dt>툴</dt><dd>${p.tools.join(" · ")}</dd></div>` : ""}
        ${p.targetUsers ? `<div><dt>타깃 사용자</dt><dd>${p.targetUsers}</dd></div>` : ""}
      </dl>
      <div class="p-media shot">${thumb({ ...p, thumbnail: p.cover || p.thumbnail }).replace('class="media', 'data-zoom class="media')}</div></header>
    ${blk("당시 해결하려 했던 과제", p.problem.length && `<ul>${p.problem.map(x => `<li><span class="tag ${x.type === "fact" ? "" : "h"}">${x.type === "fact" ? "관찰" : "가설"}</span>${x.text}</li>`).join("")}</ul>`)}
    ${blk("프로젝트 내용", p.sections.length && `<ol class="dec">${p.sections.map(d => `<li><h4>${d.title}</h4><p>${d.text}</p></li>`).join("")}</ol>`)}
    ${blk("작업 기여도", `<div class="own"><div class="own-top"><span class="own-badge"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-6.5 8-6.5s7 2 8 6.5"/></svg>개인 작업</span><span class="own-pct">${p.contribution ?? 100}%</span></div><div class="bar" role="img" aria-label="기여도 ${p.contribution ?? 100}%"><i style="--v:${p.contribution ?? 100}%"></i></div><p>${p.role} 전 과정을 혼자 진행했습니다.</p></div>`)}
    <section class="wrap rv" style="padding-top:clamp(72px,11vw,160px)"><div class="sec-h"><h2>주요 디자인 화면</h2></div>
      <div class="gal ${p.original || p.category === "PDP" ? "" : "wide"}">${p.screens.map(s => `<figure class="shot" data-zoom>${media(s)}<span class="zoombtn" aria-hidden="true">크게 보기 ⤢</span>${s.caption ? `<figcaption>${s.caption}</figcaption>` : ""}</figure>`).join("")}</div></section>
    ${blk("새롭게 익힌 점과 남은 과제", (p.outcome || p.reflection) && `${p.outcome ? `<p>${p.outcome}</p>` : ""}${p.reflection ? `<p>${p.reflection}</p>` : ""}`)}
    ${blk("다음 프로젝트에 이어진 배움", p.carry && p.carry.split(/(?<=다\.)\s+/).map(t => `<p>${t}</p>`).join(""))}
    ${blk("관련 링크", (() => { const rest = p.links.filter(l => l.label !== "실제 사이트" && l.label !== "Behance" && !(p.original && /PDF$/.test(l.label))); return rest.length && rest.map(l => link(l.url, l.label)).join(""); })())}
    <div class="wrap"><a class="nextp" href="project.html?p=${next.slug}"><small>Next project</small><strong>${next.title} →</strong></a></div>`;
}

// 사진을 하프톤/디더 픽셀 이미지로 바꾼다. 올려 두면 원본이 보인다.
function pixelate(img, cv) {
  try {
    const cell = 8, W = 640, H = Math.round(W * img.naturalHeight / img.naturalWidth);
    const cols = W / cell, rows = Math.round(H / cell);
    cv.width = W; cv.height = H;
    const t = document.createElement("canvas"); t.width = cols; t.height = rows;
    const tc = t.getContext("2d"); tc.drawImage(img, 0, 0, cols, rows);
    const d = tc.getImageData(0, 0, cols, rows).data, g = cv.getContext("2d");
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    // 배경 밝기(중앙값)를 기준으로 '배경과 다른 부분(특징)'에만 점을 찍는다.
    // 어두운 배경(YES24·STEELSERIES)은 밝은 쪽이, 밝은 배경은 어두운 쪽이 특징이다.
    const L = [], at = i => (.299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2]) / 255;
    for (let i = 0; i < d.length; i += 4) L.push(at(i));
    const bg = [...L].sort((p, q) => p - q)[L.length >> 1], dark = bg < .5, dz = .1;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const lum = L[y * cols + x], diff = dark ? lum - bg : bg - lum;
      const ink = Math.max(0, Math.min(1, (diff - dz) / (dark ? 1 - bg - dz : bg - dz) * 1.25));
      if (ink > (bayer[(y % 4) * 4 + (x % 4)] + .5) / 16) { g.fillStyle = "#111111"; g.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2); }
    }
    cv.classList.add("on");
  } catch (e) { /* file:// 등 캔버스를 읽을 수 없으면 원본 그대로 */ }
}

function heroCollage() {
  $("#ghost").innerHTML = `<span>Seungwon Beck® Web Designer® </span>`.repeat(40);
  $("#lp").innerHTML = [...P.selfIntro, ...P.selfIntroEn].map(t => `<p>${t}</p>`).join("").repeat(2);
  const shots = [...sorted.map(p => ({ src: p.thumbnail, alt: p.title, slug: p.slug, banner: true }))];
  // 구(球) 위에 타일을 고르게 배치(피보나치 격자). 드래그하면 구가 회전한다.
  const N = shots.length, pts = [];
  $("#tiles").innerHTML = Array.from({ length: N }, (_, i) => {
    const lat = Math.asin(1 - 2 * (i + .5) / N), lon = i * 2.399963, c = Math.cos(lat);
    pts.push([c * Math.sin(lon), Math.sin(lat), c * Math.cos(lon)]);
    const s = shots[i % shots.length];
    return `<a class="t${s.banner ? " bn" : ""}" draggable="false" href="project.html?p=${s.slug}" aria-label="${s.alt}">${media(s)}<div class="tc" aria-hidden="true"></div></a>`;
  }).join("");

  $("#pclose").addEventListener("click", () => { $(".hero2").classList.add("collapsed"); document.body.classList.add("panel-collapsed"); });
  $("#popen").addEventListener("click", () => { $(".hero2").classList.remove("collapsed"); document.body.classList.remove("panel-collapsed"); });
  document.querySelectorAll(".t .media").forEach(m => {
    const img = m.querySelector("img"); if (!img) return;
    const cv = document.createElement("canvas"); cv.className = "px"; m.appendChild(cv);
    const go = () => pixelate(img, cv);
    img.complete && img.naturalWidth ? go() : img.addEventListener("load", go);
  });
  const hero = $(".hero2"), ts = [...document.querySelectorAll(".t")], ghost = $("#ghost"), panel = $("#panel");
  const big = $(".big"), tcs = ts.map(t => t.querySelector(".tc"));
  tcs.forEach(c => c.innerHTML = big.innerHTML);
  // 타이틀과 겹치는 부분만 흰 글자로 보이도록, 각 타일 안에 타이틀 사본을 같은 위치에 둔다.
  let sizes = [], tl = 0, tt = 0, fs = "";
  const measure = () => {
    const hr = hero.getBoundingClientRect(), br = big.getBoundingClientRect();
    tl = br.left - hr.left; tt = br.top - hr.top; fs = getComputedStyle(big).fontSize;
    sizes = ts.map(t => [t.offsetWidth, t.offsetHeight]);
    tcs.forEach(c => c.style.fontSize = fs);
  };
  ts.forEach(t => t.querySelectorAll("img").forEach(i => { i.loading = "eager"; i.addEventListener("load", measure); }));
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let yaw = -.35, pitch = .15, vy = 0, vp = 0, last = null, moved = 0;
  const paint = () => {
    const W = hero.clientWidth, H = hero.clientHeight;
    const cx = W / 2, cy = H / 2, R = Math.min(W * .42, H * .46);
    const cY = Math.cos(yaw), sY = Math.sin(yaw), cP = Math.cos(pitch), sP = Math.sin(pitch);
    ts.forEach((t, i) => {
      const [x, y, z] = pts[i];
      const x1 = x * cY + z * sY, z1 = -x * sY + z * cY;
      const y2 = y * cP - z1 * sP, z2 = y * sP + z1 * cP;
      const sc = .55 + .5 * (z2 + 1) / 2, op = Math.max(0, Math.min(1, (z2 + .3) / .5));
      t.style.transform = `translate(calc(-50% + ${cx + R * x1 - hero.clientWidth / 2}px), calc(-50% + ${-R * y2}px)) scale(${sc.toFixed(3)})`;
      const Cx = cx + R * x1, Cy = cy - R * y2, [w, h] = sizes[i];
      tcs[i].style.left = `${(tl - Cx) / sc + w / 2}px`; tcs[i].style.top = `${(tt - Cy) / sc + h / 2}px`; tcs[i].style.transform = `scale(${(1 / sc).toFixed(3)})`;
      t.style.opacity = op; t.style.zIndex = Math.round((z2 + 1) * 10); t.style.pointerEvents = op < .5 ? "none" : "auto";
    });
  };
  // 자동 회전: 좌상단 → 우하단으로 천천히 흐름. 드래그 후엔 관성이 서서히 이 속도로 수렴.
  const DY = .0008, DP = .0005;
  const tick = () => { if (!last) { yaw += vy; pitch += vp; if (!still) { vy += (DY - vy) * .03; vp += (DP - vp) * .03; } else { vy *= .94; vp *= .94; } paint(); } requestAnimationFrame(tick); };
  vy = still ? 0 : DY; vp = still ? 0 : DP;
  hero.addEventListener("pointerdown", e => { if (e.target.closest(".btn,.panel,.popen")) return; last = { x: e.clientX, y: e.clientY }; moved = 0; vy = vp = 0; hero.classList.add("grab"); });
  addEventListener("pointermove", e => {
    if (!last) return;
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY }; moved += Math.abs(dx) + Math.abs(dy);
    vy = dx * .006; vp = dy * .006; yaw += vy; pitch += vp; paint();
  });
  const up = () => { if (!last) return; last = null; hero.classList.remove("grab");  };
  addEventListener("pointerup", up); addEventListener("pointercancel", up);
  hero.addEventListener("click", e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  addEventListener("resize", () => { measure(); paint(); });
  measure(); tick();
  document.fonts && document.fonts.ready.then(measure);
}

/* ---------- 공통 ---------- */
const toast = msg => { const t = $(".toast"); t.textContent = msg; t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 1800); };

const GMAIL = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75V40h7c1.66 0 3-1.34 3-3V16.2z"/><path fill="#1e88e5" d="M3 16.2l3.614 1.71L13 23.7V40H6c-1.657 0-3-1.343-3-3V16.2z"/><polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/><path fill="#c62828" d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859C9.132 8.301 8.228 8 7.298 8 4.924 8 3 9.924 3 12.298z"/><path fill="#fbc02d" d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341C38.868 8.301 39.772 8 40.702 8 43.076 8 45 9.924 45 12.298z"/></svg>';
const INSTA_L = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/></svg>';
const BTN_ICON = {
  Behance: '<i class="bi" style="background:#1769ff"><span class="be">Bē</span></i>',
  Instagram: `<i class="bi" style="background:linear-gradient(45deg,#f9a825,#e1306c,#7b2ff7)">${INSTA_L}</i>`,
  "Portfolio 2.0": '<i class="bi lt"><img src="assets/favicon-seungwon2.svg" width="18" height="18" alt=""></i>'
};
function applyTheme(t) {
  document.documentElement.toggleAttribute("data-theme", false);
  if (t === "dark") document.documentElement.setAttribute("data-theme", "dark"); else document.documentElement.removeAttribute("data-theme");
  const b = $("#theme"); if (!b) return;
  b.setAttribute("aria-pressed", t === "dark"); b.querySelector("span").textContent = t === "dark" ? "주간 모드" : "야간 모드";
}

function init() {
  if ($("#closing")) { $("#closing").textContent = P.closing; $("#closing-body").textContent = P.closingBody; }
  let saved = ""; try { saved = localStorage.theme || ""; } catch (e) {}
  applyTheme(saved);
  const tb = $("#theme");
  if (tb) tb.addEventListener("click", () => { const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"; applyTheme(next); try { localStorage.theme = next; } catch (e) {} });
  document.querySelectorAll("[data-email]").forEach(b => b.addEventListener("click", async () => {
    // 1) 클립보드 API → 2) 임시 입력창 복사 → 3) 메일 앱 열기 순서로 시도
    try { await navigator.clipboard.writeText(P.email); toast("이메일 주소를 복사했습니다"); return; } catch (e) {}
    try { const t = document.createElement("textarea"); t.value = P.email; t.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(t); t.select(); const ok = document.execCommand("copy"); t.remove(); if (ok) { toast("이메일 주소를 복사했습니다"); return; } } catch (e) {}
    location.href = "mailto:" + P.email;
  }));
  document.querySelectorAll("[data-links]").forEach(el => el.innerHTML = P.socialLinks.map(l => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${BTN_ICON[l.label] || ""}${l.label}</a>`).join(""));
  document.querySelectorAll(".contact [data-email]").forEach(b => b.insertAdjacentHTML("afterbegin", `<i class="bi lt">${GMAIL}</i>`));

  // 이미지 확대: [data-zoom] 클릭 → dialog
  const dlg = $("dialog");
  document.addEventListener("click", e => {
    const z = e.target.closest("[data-zoom]");
    if (!z) return;
    dlg.innerHTML = (z.querySelector(".media") || z).innerHTML;
    dlg.showModal();
  });
  dlg.addEventListener("click", () => dlg.close());

  // 스크롤하면 헤더 뒤가 흐려지는 유리 느낌 배경
  const hd = $(".hd"), hdf = () => hd.classList.toggle("scrolled", scrollY > 24);
  addEventListener("scroll", hdf, { passive: true }); hdf();
  const top = $(".top");
  addEventListener("scroll", () => top.classList.toggle("on", scrollY > 600), { passive: true });
  top.addEventListener("click", () => scrollTo({ top: 0 }));

  // 스크롤 등장: IntersectionObserver 대신 위치를 직접 확인(긴 카드에서도 확실히 동작)
  const reveal = () => document.querySelectorAll(".rv:not(.in)").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * .88 && r.bottom > 0) el.classList.add("in");
  });
  addEventListener("scroll", reveal, { passive: true });
  addEventListener("resize", reveal);
  reveal(); setInterval(reveal, 250);
}

const MAIL = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
const INSTA = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/></svg>';
function renderAbout() {
  const A = window.ABOUT; document.title = `About — ${P.name}`;
  const lvl = (n, c) => [1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("");
  $("#app").innerHTML = `
    <div class="wrap"><a class="back" href="index.html">← Home</a></div>
    <header class="wrap p-hero"><div class="p-title ab-top"><p class="eyebrow" style="margin:0">About · ${A.role}</p><div class="p-acts"><span class="otherlbl">다른 페이지 보기</span><a class="pbtn site" href="https://seungwonbeck.github.io/Portfolio2.0/" target="_blank" rel="noopener"><img src="assets/favicon-seungwon2.svg" width="20" height="20" alt="" style="border-radius:5px">seungwon.2<span aria-hidden="true">↗</span></a></div></div><h1 class="sr">About Me</h1></header>
    <section class="wrap block rv ab"><h2>About Me</h2><div class="body">
      <p class="quote">${A.statement.map(t => `<span>${t}</span>`).join("")}</p></div></section>
    <section class="wrap block rv"><h2>Timeline</h2><div class="body"><ol class="tl">${A.timeline.map((t, i) => `<li style="--k:${i}"><b>${t.period}</b><h4>${t.title}</h4><p>${t.desc}</p></li>`).join("")}</ol></div></section>
    <section class="wrap rv" style="padding-top:clamp(72px,11vw,160px)"><div class="sec-h"><h2>Skills</h2></div>
      <div class="skills">${A.skills.map(g => `<div class="sk"><h3>${g.category}</h3>${g.items.map(it => `<div class="skrow"><span>${it.name}</span><em>LV.${it.level}</em></div><div class="lv" role="img" aria-label="LV ${it.level} / 5">${lvl(it.level)}</div>`).join("")}</div>`).join("")}</div></section>
    <section class="wrap block rv"><h2>Contact</h2><div class="body"><div class="contact-list">
      <button type="button" class="crow" data-email><i class="cic light">${GMAIL}</i>Email<em>${P.email}<b aria-hidden="true">복사</b></em></button>
      <a class="crow" href="https://www.behance.net/dc44a02a" target="_blank" rel="noopener"><i class="cic" style="--c:#1769ff"><span class="be">Bē</span></i>Behance<em>dc44a02a<b aria-hidden="true">↗</b></em></a>
      <a class="crow" href="https://www.instagram.com/a.cc.2.0" target="_blank" rel="noopener"><i class="cic" style="--c:#e1306c">${INSTA}</i>Instagram<em>@a.cc.2.0<b aria-hidden="true">↗</b></em></a>
      <a class="crow" href="https://seungwonbeck.github.io/Portfolio2.0/" target="_blank" rel="noopener"><i class="cic light"><img src="assets/favicon-seungwon2.svg" width="28" height="28" alt=""></i>Portfolio 2.0<em>seungwon.2<b aria-hidden="true">↗</b></em></a>
    </div></div></section>`;
  // 타임라인 반전은 마우스를 올렸을 때만(CSS :hover)
}
({ project: renderProject, about: renderAbout }[document.body.dataset.page] || renderHome)();
init();
