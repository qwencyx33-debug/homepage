/* ==========================================================================
   Jhon Marvin S. Ibanez — Digital Portfolio
   Vanilla JavaScript: nav, scroll reveal, progress, interactions
   ========================================================================== */
(function () {
  "use strict";

  // Enables reveal styles only when JS runs, so content is never hidden without it.
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Profile image fallback (no inline handlers) ---------- */
  function initPortrait() {
    var img = $("#portrait");
    if (!img) return;

    function showFallback() {
      var frame = img.parentElement;
      if (!frame || $(".portrait-fallback", frame)) return;
      img.style.display = "none";
      var box = document.createElement("div");
      box.className = "portrait-fallback";
      box.innerHTML = "<strong>JM</strong><span>Add your photo as<br>assets/profile.jpg</span>";
      frame.appendChild(box);
    }

    if (img.complete && img.naturalWidth === 0) showFallback();
    img.addEventListener("error", showFallback);
  }

  /* ---------- Header state + back-to-top + progress (one rAF-throttled scroll handler) ---------- */
  function initScrollUI() {
    var header = $("#siteHeader");
    var toTop = $("#toTop");
    var bar = $("#scrollProgress");
    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (header) header.classList.toggle("scrolled", y > 24);
      if (toTop) toTop.classList.toggle("show", y > 600);
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var toggle = $("#navToggle");
    var menu = $("#navMenu");
    if (!toggle || !menu) return;

    $$("li", menu).forEach(function (li, i) { li.style.setProperty("--i", i); });

    function setOpen(open) {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 880) setOpen(false);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  function initActiveNav() {
    var links = $$(".nav-link");
    var sections = links
      .map(function (a) { return $(a.getAttribute("href")); })
      .filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;

    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.remove("active");
          a.removeAttribute("aria-current");
        });
        var active = byId[entry.target.id];
        if (active) {
          active.classList.add("active");
          active.setAttribute("aria-current", "page");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Scroll reveal with stagger ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;

    // Stagger children of reveal groups
    $$(".reveal-group").forEach(function (group) {
      $$(".reveal", group).forEach(function (el, i) {
        el.style.setProperty("--stagger", Math.min(i * 70, 560) + "ms");
      });
    });
    // Tags inside groups are plain <li>; give them the same staggered entrance.
    $$(".tags.reveal-group .tag").forEach(function (tag, i, all) {
      tag.classList.add("reveal");
      var idx = Array.prototype.indexOf.call(tag.parentElement.children, tag);
      tag.style.setProperty("--stagger", Math.min(idx * 45, 500) + "ms");
    });
    $$(".trio .reveal, .projects-grid .reveal, .skills-grid .reveal").forEach(function (el) {
      if (!el.style.getPropertyValue("--stagger")) {
        var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.setProperty("--stagger", idx * 110 + "ms");
      }
    });

    items = $$(".reveal");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("in");
        obs.unobserve(el);
        // Remove stagger delay after the entrance so hover feels instant.
        window.setTimeout(function () { el.classList.add("settled"); }, 1400);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Education timeline progress ---------- */
  function initEducationProgress() {
    var timeline = $(".education-timeline");
    if (!timeline) return;
    var queued = false;

    function update() {
      var rect = timeline.getBoundingClientRect();
      var range = Math.max(rect.height, 1);
      var progress = Math.max(0, Math.min(1, (window.innerHeight * 0.72 - rect.top) / range));
      timeline.style.setProperty("--timeline-progress", progress.toFixed(3));
      queued = false;
    }

    function requestUpdate() {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  /* ---------- Fine-pointer cursor and restrained hero parallax ---------- */
  function initPointerMotion() {
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var cursor = $("#customCursor");
    if (!finePointer || reduceMotion) return;

    if (cursor) {
      var queued = false;
      var pointerX = 0;
      var pointerY = 0;
      document.documentElement.classList.add("custom-cursor-enabled");
      window.addEventListener("pointermove", function (event) {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
          cursor.style.transform = "translate3d(" + pointerX + "px," + pointerY + "px,0)";
          queued = false;
        });
      }, { passive: true });

      document.addEventListener("pointerover", function (event) {
        var target = event.target;
        if (target && target.closest && target.closest("a, button, .project, .tag")) cursor.classList.add("hover");
      });
      document.addEventListener("pointerout", function (event) {
        var next = event.relatedTarget;
        if (!next || !next.closest || !next.closest("a, button, .project, .tag")) cursor.classList.remove("hover");
      });
      document.addEventListener("pointerleave", function () { cursor.style.opacity = "0"; });
      document.addEventListener("pointerenter", function () { cursor.style.opacity = ""; });
    }

    var hero = $(".hero");
    var portrait = $(".portrait-wrap");
    if (!hero || !portrait) return;
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      var offsetX = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      var offsetY = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      portrait.style.setProperty("--parallax-x", (offsetX * 10).toFixed(1) + "px");
      portrait.style.setProperty("--parallax-y", (offsetY * 8).toFixed(1) + "px");
    }, { passive: true });
    hero.addEventListener("pointerleave", function () {
      portrait.style.setProperty("--parallax-x", "0px");
      portrait.style.setProperty("--parallax-y", "0px");
    });
  }

  /* ---------- Gentle project-card tilt ---------- */
  function initProjectTilt() {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".project").forEach(function (card) {
      var bounds;
      card.addEventListener("pointerenter", function () { bounds = card.getBoundingClientRect(); });
      card.addEventListener("pointermove", function (event) {
        if (!bounds) return;
        var x = (event.clientX - bounds.left) / bounds.width - 0.5;
        var y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty("--tilt-x", (y * -1.2).toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", (x * 1.2).toFixed(2) + "deg");
      }, { passive: true });
      card.addEventListener("pointerleave", function () {
        bounds = null;
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  /* ---------- ScrollTrigger image and timeline reveals ---------- */
  function initGsapMotion() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);

    window.gsap.fromTo(".project-featured .project-preview",
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".project-featured", start: "top 78%", once: true }
      }
    );

    window.gsap.fromTo(".education-entry .card",
      { clipPath: "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0 0 0% 0)",
        duration: 0.8,
        stagger: 0.16,
        ease: "power2.out",
        scrollTrigger: { trigger: ".education-timeline", start: "top 76%", once: true }
      }
    );
  }

  /* ---------- Copy email ---------- */
  function initCopyEmail() {
    var btn = $("#copyEmail");
    var toast = $("#toast");
    if (!btn) return;
    var timer;

    function notify(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("show");
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { toast.classList.remove("show"); }, 2200);
    }

    function fallbackCopy(text) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    btn.addEventListener("click", function () {
      var email = btn.getAttribute("data-email");

      function done(ok) {
        if (ok) {
          btn.textContent = "Copied!";
          btn.classList.add("done");
          notify("Email copied to clipboard");
          window.setTimeout(function () {
            btn.textContent = "Copy";
            btn.classList.remove("done");
          }, 2000);
        } else {
          notify("Couldn't copy — please copy it manually");
        }
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(fallbackCopy(email)); });
      } else {
        done(fallbackCopy(email));
      }
    });
  }

  /* ---------- Init ---------- */
  initPortrait();
  initScrollUI();
  initMenu();
  initActiveNav();
  initReveal();
  initEducationProgress();
  initPointerMotion();
  initProjectTilt();
  initGsapMotion();
  initCopyEmail();
})();
