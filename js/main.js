(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header / Nav ---------- */
  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const nav = document.querySelector(".nav");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Cursor glow ---------- */
  const glow = document.getElementById("cursorGlow");
  if (glow && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let tx = gx;
    let ty = gy;

    window.addEventListener(
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
      },
      { passive: true }
    );

    const tickGlow = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.left = `${gx}px`;
      glow.style.top = `${gy}px`;
      requestAnimationFrame(tickGlow);
    };
    requestAnimationFrame(tickGlow);
  }

  /* ---------- Starfield ---------- */
  const starCanvas = document.getElementById("starfield");
  if (starCanvas) {
    const ctx = starCanvas.getContext("2d");
    let stars = [];
    let w = 0;
    let h = 0;
    let mx = 0;
    let my = 0;
    let parallaxX = 0;
    let parallaxY = 0;

    const resize = () => {
      w = starCanvas.width = window.innerWidth;
      h = starCanvas.height = window.innerHeight;
      const count = Math.floor((w * h) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.4 + 0.2,
        tw: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02,
      }));
    };

    window.addEventListener("resize", resize);
    window.addEventListener(
      "pointermove",
      (e) => {
        mx = (e.clientX / w - 0.5) * 2;
        my = (e.clientY / h - 0.5) * 2;
      },
      { passive: true }
    );
    resize();

    const drawStars = () => {
      if (!ctx) return;
      parallaxX += (mx - parallaxX) * 0.04;
      parallaxY += (my - parallaxY) * 0.04;

      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.tw += s.speed;
        const alpha = 0.35 + Math.sin(s.tw) * 0.35;
        const ox = parallaxX * 18 * s.z;
        const oy = parallaxY * 12 * s.z;
        ctx.beginPath();
        ctx.fillStyle = `rgba(250, 208, 137, ${alpha * s.z})`;
        ctx.arc(s.x + ox, s.y + oy, s.r * s.z, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!prefersReduced) requestAnimationFrame(drawStars);
    };

    if (prefersReduced) {
      drawStars();
    } else {
      requestAnimationFrame(drawStars);
    }
  }

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll(
    ".section__title, .section__lead, .studio__item, .world-card, .signal-form"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Soft tilt on world cards ---------- */
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Contact form (demo) ---------- */
  const form = document.getElementById("signalForm");
  const formNote = document.getElementById("formNote");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (formNote) {
      formNote.textContent = "Mesajın alındı. Teşekkürler!";
    }
    form.reset();
  });
})();
