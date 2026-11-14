/* =========================================================
   Donnybrook Primary School — Site Interactions
   ========================================================= */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initAnnouncementDismiss();
    initMobileNav();
    
    initSliders();
    initHeaderCompactOnScroll();
    initActiveNavOnScroll();
    initBackToTop();
    initRevealOnScroll();
    initLightbox();
    initCurrentYear();
  });

  /* ---- Dismiss announcement bar (temporary dismissal) ---- */
function initAnnouncementDismiss() {
    var bar = document.getElementById("announcement");
    if (!bar) return;

    var closeBtn = bar.querySelector(".announcement-close");

    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            bar.classList.add("is-hidden");
        });
    }
}


/* ---- Responsive mobile hamburger navigation ---- */
function initMobileNav() {
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.contains("is-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when a navigation link is selected
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // Close menu when clicking outside navigation
  document.addEventListener("click", function (event) {
    if (
      nav.classList.contains("is-open") &&
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  // Close menu with Escape key
  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Escape" &&
      nav.classList.contains("is-open")
    ) {
      closeMenu();
      toggle.focus();
    }
  });

  // Reset navigation when switching to desktop width
  window.addEventListener("resize", function () {
    if (window.innerWidth > 720) {
      closeMenu();
    }
  });
}


  /* ---- Shrink the header once the page is scrolled ---- */
  function initHeaderCompactOnScroll() {
    var header = document.getElementById("site-header");
    if (!header) return;

    function update() {
      if (window.scrollY > 40) {
        header.classList.add("is-compact");
      } else {
        header.classList.remove("is-compact");
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---- Highlight the current section in the nav while scrolling ---- */
  function initActiveNavOnScroll() {
    var navLinks = document.querySelectorAll("#primary-nav a");
    if (!navLinks.length || !("IntersectionObserver" in window)) return;

    var sections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href");
      if (id && id.charAt(0) === "#") {
        var section = document.querySelector(id);
        if (section) sections.push({ link: link, section: section });
      }
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            sections.forEach(function (item) {
              item.link.classList.toggle("active", item.section === entry.target);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (item) {
      observer.observe(item.section);
    });
  }
  /* ---- Crossfading photo sliders (hero + sports & culture) ---- */
  function initSliders() {
    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll("[data-slider]").forEach(function (root) {
      var slides = root.querySelectorAll(".slide");
      if (slides.length < 2) return;

      var dotsWrap =
        root.querySelector(".slider-dots") ||
        (root.parentElement && root.parentElement.querySelector(".slider-dots"));
      var delay = parseInt(root.getAttribute("data-interval"), 10) || 6000;
      var current = 0;
      var timer = null;
      var dots = [];

      function setActive(n) {
        current = (n + slides.length) % slides.length;
        slides.forEach(function (s, i) {
          s.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (d, i) {
          d.classList.toggle("is-active", i === current);
          d.setAttribute("aria-current", i === current ? "true" : "false");
        });
      }
      function stop() { clearInterval(timer); }
      function start() {
        if (reduceMotion) return;
        stop();
        timer = setInterval(function () { setActive(current + 1); }, delay);
      }

      if (dotsWrap) {
        slides.forEach(function (_, i) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", "Show photo " + (i + 1));
          b.addEventListener("click", function () { setActive(i); start(); });
          dotsWrap.appendChild(b);
          dots.push(b);
        });
      }

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else start();
      });

      setActive(0);
      start();
    });
  }
  /* ---- Back-to-top button ---- */
  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;

    function update() {
      btn.classList.toggle("is-visible", window.scrollY > 480);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Gentle fade/slide-in reveal as sections enter the viewport ---- */
  function initRevealOnScroll() {
    var targets = document.querySelectorAll(
      ".about-card, .phase-card, .admissions-card, .staff-card, .contact-card, .feature-row, .welcome-card, .quick-links, .vacancy-panel"
    );
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add("reveal");
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---- Click-to-enlarge for photos ---- */
  function initLightbox() {
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightbox-image");
    var closeBtn = lightbox ? lightbox.querySelector(".lightbox-close") : null;
    if (!lightbox || !lightboxImg) return;

    
var zoomables = document.querySelectorAll(
  ".feature-media img, .phase-media img, .community-banner img, .gallery-item img"
);


    zoomables.forEach(function (img) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
      });
    });

    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImg.src = "";
      document.body.style.overflow = "";
    }

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }

  /* ---- Keep the footer copyright year current ---- */
  function initCurrentYear() {
    var el = document.getElementById("current-year");
    if (el) el.textContent = new Date().getFullYear();
  }
})();
