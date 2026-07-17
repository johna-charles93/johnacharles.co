/* ==========================================================================
   Johna Charles — Portfolio interactions
   Smooth scroll (Lenis) + GSAP ScrollTrigger reveals + custom cursor +
   Three.js 3D scenes (hero + contact) + parallax ghost numerals
   ========================================================================== */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------------- Preloader ---------------- */
  const preloader = document.getElementById("preloader");
  const preloaderFill = document.getElementById("preloaderFill");
  const preloaderCount = document.getElementById("preloaderCount");

  let progress = 0;
  const preloadTimer = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) progress = 100;
    preloaderFill.style.width = progress + "%";
    preloaderCount.textContent = Math.floor(progress);
    if (progress === 100) {
      clearInterval(preloadTimer);
      setTimeout(() => {
        preloader.classList.add("done");
        document.body.classList.add("loaded");
        initSplitLines();
        initReveals();
      }, 250);
    }
  }, 90);

  // hard fallback so preloader never traps the user
  setTimeout(() => {
    if (!preloader.classList.contains("done")) {
      preloader.classList.add("done");
      document.body.classList.add("loaded");
    }
  }, 3200);

  /* ---------------- Smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      if (window.ScrollTrigger) ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------- Custom cursor ---------------- */
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");

  if (!isTouch) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    function ringLoop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    }
    ringLoop();

    document.querySelectorAll("a, button, [data-tilt]").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorRing.classList.add("grow"));
      el.addEventListener("mouseleave", () => cursorRing.classList.remove("grow"));
    });
  } else {
    cursorDot.style.display = "none";
    cursorRing.style.display = "none";
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (!isTouch) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------------- Nav ---------------- */
  const nav = document.getElementById("mainNav");
  const scrollProgressFill = document.getElementById("scrollProgressFill");

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    scrollProgressFill.style.width = pct + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  const navBurger = document.getElementById("navBurger");
  const mobileMenu = document.getElementById("mobileMenu");
  navBurger.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => mobileMenu.classList.remove("open"))
  );

  /* ---------------- Scroll reveals ---------------- */
  function initReveals() {
    if (reduceMotion) return; // already made visible via the block below
    const items = document.querySelectorAll(".reveal-up");

    if (window.gsap && window.ScrollTrigger) {
      // Cinematic entrance: tilt up out of the page + scale + fade, staggered
      // per section via ScrollTrigger.batch so groups animate together.
      items.forEach((el) => {
        gsap.set(el, {
          opacity: 0, y: 56, rotationX: -12, scale: 0.96,
          transformOrigin: "50% 100%", transformPerspective: 800,
        });
      });
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            scale: 1,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.1,
          });
        },
      });
    } else {
      // Fallback: plain CSS class toggle (no GSAP available)
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              const delay = (i % 4) * 90;
              setTimeout(() => el.classList.add("in"), reduceMotion ? 0 : delay);
              io.unobserve(el);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      items.forEach((item) => io.observe(item));
    }
  }
  if (reduceMotion) {
    document.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("in"));
  }

  /* ---------------- Hero split-line reveal ---------------- */
  function initSplitLines() {
    const lines = document.querySelectorAll(".split-line");
    lines.forEach((line, i) => {
      const text = line.innerHTML;
      line.innerHTML = `<span class="split-inner">${text}</span>`;
      const inner = line.querySelector(".split-inner");
      inner.style.display = "inline-block";
      inner.style.transform = reduceMotion ? "none" : "translateY(110%)";
      inner.style.transition = `transform 1s cubic-bezier(.16,.84,.44,1) ${0.12 * i + 0.1}s`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inner.style.transform = "translateY(0)";
        });
      });
    });
    document.querySelectorAll(".hero .eyebrow, .hero .reveal-up").forEach((el, i) => {
      el.style.transitionDelay = `${0.5 + i * 0.1}s`;
    });
  }

  /* ---------------- Animated stat counters ---------------- */
  const statEls = document.querySelectorAll(".stat-num");
  const statIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const dur = 1400;
        const start = performance.now();
        function tick(now) {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
        statIO.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  statEls.forEach((el) => statIO.observe(el));

  /* ---------------- Tilt cards ---------------- */
  if (!isTouch) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateZ(0)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
      });
    });
  }

  /* ---------------- Hero 3D scene (Three.js) ---------------- */
  // A wireframe geometric object that idles with a slow rotation and reacts
  // to scroll position (rotates further + drifts as you scroll through hero).
  let heroScroll = 0; // 0 → 1 progress through the hero section, used below
  const heroCanvas = document.getElementById("heroCanvas");

  if (heroCanvas && window.THREE && !reduceMotion) {
    const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    function sizeRenderer() {
      const w = heroCanvas.offsetWidth || window.innerWidth;
      const h = heroCanvas.offsetHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    sizeRenderer();
    window.addEventListener("resize", sizeRenderer);

    const group = new THREE.Group();
    scene.add(group);

    const coreGeo = new THREE.IcosahedronGeometry(2.6, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x8b6bff, wireframe: true, transparent: true, opacity: 0.55 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const innerGeo = new THREE.IcosahedronGeometry(1.5, 0);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x4be3ff, wireframe: true, transparent: true, opacity: 0.4 });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    group.add(inner);

    // faint orbiting points for depth
    const pointCount = 140;
    const pointPositions = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      const r = 4 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pointPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pointPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pointPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));
    const pointMat = new THREE.PointsMaterial({ color: 0xd9b26a, size: 0.035, transparent: true, opacity: 0.7 });
    const points = new THREE.Points(pointGeo, pointMat);
    group.add(points);

    let mouseX = 0, mouseY = 0;
    if (!isTouch) {
      window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      });
    }

    function renderHero(time) {
      const t = time * 0.00005;
      group.rotation.y = t * 6 + heroScroll * 2.4;
      group.rotation.x = t * 2.4 + heroScroll * 1.1;
      points.rotation.y = -t * 3;
      group.position.y = -heroScroll * 1.6;
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(renderHero);
    }
    requestAnimationFrame(renderHero);

    if (window.gsap && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => { heroScroll = self.progress; },
      });
    }
  }

  /* ---------------- Parallax ghost numerals ---------------- */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      gsap.to(el, {
        yPercent: 24,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section"),
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    });
  }

  /* ---------------- Contact 3D accent (Three.js) ---------------- */
  const contactCanvas = document.getElementById("contactCanvas");
  if (contactCanvas && window.THREE && !reduceMotion) {
    const renderer2 = new THREE.WebGLRenderer({ canvas: contactCanvas, alpha: true, antialias: true });
    renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const scene2 = new THREE.Scene();
    const camera2 = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera2.position.set(0, 0, 8);

    function sizeRenderer2() {
      const w = contactCanvas.offsetWidth || window.innerWidth;
      const h = contactCanvas.offsetHeight || window.innerHeight;
      renderer2.setSize(w, h, false);
      camera2.aspect = w / h;
      camera2.updateProjectionMatrix();
    }
    sizeRenderer2();
    window.addEventListener("resize", sizeRenderer2);

    const torusGeo = new THREE.TorusKnotGeometry(1.6, 0.32, 140, 12);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x4be3ff, wireframe: true, transparent: true, opacity: 0.28 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.x = 2.2;
    scene2.add(torus);

    let contactActive = false;
    const contactIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => (contactActive = e.isIntersecting)),
      { threshold: 0.05 }
    );
    contactIO.observe(document.getElementById("contact"));

    function renderContact(time) {
      if (contactActive) {
        const t = time * 0.00004;
        torus.rotation.x = t * 5;
        torus.rotation.y = t * 3.2;
        renderer2.render(scene2, camera2);
      }
      requestAnimationFrame(renderContact);
    }
    requestAnimationFrame(renderContact);
  }

  /* ---------------- Contact form ----------------
     Posts to contact-handler.php, which lives alongside this file on your
     GoDaddy hosting and sends the message via PHP's built-in mail() — no
     third-party service, no API key. If that request fails for any reason
     (PHP not reachable, server error, etc.), falls back to opening the
     visitor's email client via mailto: so a message is never lost silently. */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const cfStatus = document.getElementById("cfStatus");
    const cfSubmit = document.getElementById("cfSubmit");

    function fallbackMailto(name, email, message) {
      const subject = encodeURIComponent(`New project inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      cfStatus.textContent = "Opening your email client…";
      cfStatus.className = "form-status success";
      window.location.href = `mailto:johnacharles93@gmail.com?subject=${subject}&body=${body}`;
    }

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("cf-name").value.trim();
      const email = document.getElementById("cf-email").value.trim();
      const message = document.getElementById("cf-message").value.trim();
      const botField = document.querySelector('[name="bot-field"]').value;

      if (!name || !email || !message) {
        cfStatus.textContent = "Please fill out every field before sending.";
        cfStatus.className = "form-status error";
        return;
      }

      cfSubmit.disabled = true;
      cfStatus.textContent = "Sending…";
      cfStatus.className = "form-status";

      try {
        const res = await fetch("contact-handler.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ name, email, message, "bot-field": botField }).toString(),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Submission failed");
        cfStatus.textContent = "We got it — I'll be in touch soon.";
        cfStatus.className = "form-status success";
        contactForm.reset();
      } catch (err) {
        fallbackMailto(name, email, message);
      } finally {
        cfSubmit.disabled = false;
      }
    });
  }

  /* ---------------- Smooth anchor scrolling for nav links ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -20 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });
})();
