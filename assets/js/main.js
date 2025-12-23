// =========================
// assets/js/main.js (전체)
// =========================
(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    // AOS
    if (window.AOS) {
      AOS.init({ duration: 750, once: true, offset: 80 });
    }

    // year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // navbar + progress
    const nav = document.getElementById("topNav");
    const progressTop = document.getElementById("progressTop");
    function onScroll(){
      const y = window.scrollY || 0;
      if (nav) nav.classList.toggle("is-scrolled", y > 8);

      if (progressTop) {
        const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const pct = h > 0 ? (y / h) * 100 : 0;
        progressTop.style.width = pct.toFixed(2) + "%";
      }
    }
    window.addEventListener("scroll", onScroll, { passive:true });
    onScroll();

    // Grain
    (function grain(){
      const c = document.getElementById("grain");
      if (!c) return;
      const ctx = c.getContext("2d", { alpha:true });

      function resize(){
        const scale = 0.55;
        c.width  = Math.max(320, Math.floor(window.innerWidth  * scale));
        c.height = Math.max(320, Math.floor(window.innerHeight * scale));
      }
      resize();
      window.addEventListener("resize", resize);

      let last = 0;
      function draw(t){
        if (t - last > 80) {
          last = t;
          const w = c.width, h = c.height;
          const img = ctx.createImageData(w, h);
          for (let i=0; i<img.data.length; i+=4){
            const v = (Math.random() * 255) | 0;
            img.data[i] = v;
            img.data[i+1] = v;
            img.data[i+2] = v;
            img.data[i+3] = 18;
          }
          ctx.putImageData(img, 0, 0);
        }
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    })();

    // HERO Parallax
    (function heroParallax(){
      const hero = document.getElementById("heroBg");
      const mesh  = document.getElementById("mesh");
      if (!hero) return;

      const blobs = Array.from(hero.querySelectorAll(".blob"));
      if (!blobs.length && !mesh) return;

      let mx = 0, my = 0, tx = 0, ty = 0;
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

      function setFromPoint(x, y){
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        mx = clamp((x - cx) / cx, -1, 1);
        my = clamp((y - cy) / cy, -1, 1);
      }

      window.addEventListener("pointermove", (e) => {
        setFromPoint(e.clientX, e.clientY);
      }, { passive:true });

      function raf(){
        tx += (mx - tx) * 0.06;
        ty += (my - ty) * 0.06;

        blobs.forEach(b => {
          const d = parseFloat(b.dataset.depth || "0.06");
          const x = (tx * 80 * d);
          const y = (ty * 80 * d);
          b.style.setProperty("--x", x.toFixed(2) + "px");
          b.style.setProperty("--y", y.toFixed(2) + "px");
        });

        if (mesh){
          const x = (tx * -10);
          const y = (ty *  10);
          mesh.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(1.05)`;
        }

        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    })();

    // HERO Typing (진짜 타이핑)
    // HERO Typing (여러 문구 순환 타이핑)
(function heroTyping(){
  const el = document.getElementById("typingText");
  if (!el) return;

  // data-texts="a|b|c" 형태
  const raw = (el.dataset.texts || "영상편집자|그래픽디자이너|콘텐츠 크리에이터").trim();
  const phrases = raw.split("|").map(s => s.trim()).filter(Boolean);

  const typeMin = 40;     // 타이핑 최소 속도(ms)
  const typeMax = 85;     // 타이핑 최대 속도(ms)
  const startDelay = 450; // 시작 딜레이
  const endHold = 1100;   // 다 찍고 유지
  const deleteSpeed = 28; // 지우는 속도
  const betweenDelay = 450; // 다음 문구 시작 딜레이

  let phraseIndex = 0;
  let i = 0;
  let deleting = false;

  const rand = (a,b) => Math.floor(a + Math.random()*(b-a+1));

  function tick(){
    const text = phrases[phraseIndex];

    el.classList.add("is-typing");

    if (!deleting){
      i++;
      el.textContent = text.slice(0, i);

      if (i >= text.length){
        el.classList.remove("is-typing");
        setTimeout(() => { deleting = true; tick(); }, endHold);
        return;
      }
      setTimeout(tick, rand(typeMin, typeMax));
    } else {
      i--;
      el.textContent = text.slice(0, Math.max(0, i));

      if (i <= 0){
        deleting = false;
        el.classList.remove("is-typing");
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, betweenDelay);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }

  el.textContent = "";
  setTimeout(tick, startDelay);
})();


    // Filtering
    const buttons = document.querySelectorAll("[data-filter]");
    const cards = document.querySelectorAll(".work-card");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const key = btn.dataset.filter;
        cards.forEach(card => {
          const cat = card.dataset.category;
          const show = (key === "All" || cat === key);
          card.classList.toggle("is-hidden", !show);
        });
      });
    });

    // Modal YouTube
    const modalEl = document.getElementById("workModal");
    const ytFrame = document.getElementById("ytFrame");
    const openYoutube = document.getElementById("openYoutube");
    const modal = (modalEl && window.bootstrap) ? new bootstrap.Modal(modalEl) : null;

    function openWork(card){
      const id = card.dataset.youtube;
      const title = card.querySelector(".work-title")?.textContent?.trim() || "Work";

      if (modalEl) modalEl.querySelector(".modal-title").textContent = title;

      if (ytFrame) ytFrame.src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&rel=0&modestbranding=1`;
      if (openYoutube) openYoutube.href = `https://www.youtube.com/watch?v=${id}`;

      if (modal) modal.show();
    }

    document.querySelectorAll(".work-card").forEach(card => {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      card.addEventListener("click", () => openWork(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openWork(card);
        }
      });
    });

    if (modalEl){
      modalEl.addEventListener("hidden.bs.modal", () => {
        if (ytFrame) ytFrame.src = "";
      });
    }

    // Card tilt
    (function cardTilt(){
      const max = 1.2;
      document.querySelectorAll(".work-card").forEach(card => {
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          const ry = (px - 0.5) * (max * 2);
          const rx = -(py - 0.5) * (max * 2);
          card.style.setProperty("--rx", rx.toFixed(2) + "deg");
          card.style.setProperty("--ry", ry.toFixed(2) + "deg");
        });
        card.addEventListener("mouseleave", () => {
          card.style.setProperty("--rx", "0deg");
          card.style.setProperty("--ry", "0deg");
        });
      });
    })();
  });
})();
// 유튜브 썸네일 자동 적용 (data-youtube 기반)
document.querySelectorAll(".work-card").forEach(card => {
  const id = card.dataset.youtube;
  const thumb = card.querySelector(".work-thumb");
  if (!id || !thumb) return;

  // maxres 우선, 실패 시 hq로 대체
  const maxres = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  const hq = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  thumb.style.backgroundImage = `url('${maxres}')`;

  // maxres가 없는 영상은 이미지가 깨질 수 있어서 hq로 폴백
  const img = new Image();
  img.onload = () => {
    if (img.naturalWidth < 800) thumb.style.backgroundImage = `url('${hq}')`;
  };
  img.onerror = () => {
    thumb.style.backgroundImage = `url('${hq}')`;
  };
  img.src = maxres;
});

