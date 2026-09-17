/*
  File: main.js
  Project: Responsive Personal Portfolio
  Version: 1.0.0
  Description: Navigation toggle, active links, reveal animations, modal, theme toggle, and form UI behavior.
  Author: (Your Name)
*/

(function () {
  "use strict";

  const DOM = {
    navToggle: document.querySelector(".nav_toggle"),
    navMenu: document.getElementById("nav_menu"),
    navLinks: Array.from(document.querySelectorAll(".nav_link")),
    browserSearch: document.getElementById("browser_search"),
    browserSearchInput: document.getElementById("browser_search_input"),
    browserSearchClear: document.getElementById("browser_search_clear"),
    themeToggle: document.getElementById("theme_toggle"),
    themeColor: document.querySelector('meta[name="theme-color"]'),
    year: document.getElementById("year"),
    progress: document.querySelector(".scroll_progress"),
    reveals: Array.from(document.querySelectorAll(".reveal")),
    modal: document.getElementById("project_modal"),
    modalTitle: document.getElementById("modal_title"),
    modalDesc: document.getElementById("modal_desc"),
    modalStack: document.getElementById("modal_stack"),
    modalLink: document.getElementById("modal_link"),
    modalLinkRow: document.getElementById("modal_link_row"),
    modalClose: document.getElementById("modal_close"),
    detailsButtons: Array.from(document.querySelectorAll(".project_details")),
    contactForm: document.getElementById("contact_form"),
    formNote: document.getElementById("form_note"),
  };

  const STORAGE_KEYS = {
    theme: "portfolio_theme",
  };

  function setYear() {
    if (!DOM.year) return;
    DOM.year.textContent = String(new Date().getFullYear());
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = theme === "light" ? "🌞" : "🌙";
    const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode";

    const iconEl = DOM.themeToggle?.querySelector(".theme_icon");
    if (iconEl) iconEl.textContent = icon;
    if (DOM.themeToggle) DOM.themeToggle.setAttribute("aria-label", label);
    if (DOM.themeColor) DOM.themeColor.setAttribute("content", theme === "light" ? "#ffffff" : "#111315");

    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      return;
    }
    // The bright theme is the default for the Google-inspired design.
    setTheme("light");
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  }

  function openMenu() {
    if (!DOM.navMenu || !DOM.navToggle) return;
    DOM.navMenu.classList.add("open");
    DOM.navToggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!DOM.navMenu || !DOM.navToggle) return;
    DOM.navMenu.classList.remove("open");
    DOM.navToggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (!DOM.navMenu) return;
    DOM.navMenu.classList.contains("open") ? closeMenu() : openMenu();
  }

  function handleNavLinkClick() {
    closeMenu();
  }

  function getSearchDestination(rawValue) {
    const value = rawValue.trim();
    if (!value) return null;

    const hasHttpProtocol = /^https?:\/\//i.test(value);
    const looksLikeDomain = /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]\S*)?$/i.test(value);
    const looksLikeIp = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:[/?#]\S*)?$/.test(value);
    const looksLocal = /^(?:localhost|127\.0\.0\.1)(?::\d+)?(?:[/?#]\S*)?$/i.test(value);

    if (hasHttpProtocol) {
      try {
        const url = new URL(value);
        if (url.protocol === "http:" || url.protocol === "https:") return url.href;
      } catch (_) {
        // Invalid addresses fall through to a Google search.
      }
    }

    if (looksLikeDomain || looksLikeIp || looksLocal) {
      try {
        const protocol = looksLocal || looksLikeIp ? "http" : "https";
        return new URL(`${protocol}://${value}`).href;
      } catch (_) {
        // Invalid hostnames fall through to a Google search.
      }
    }

    return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
  }

  function updateSearchClearButton() {
    if (!DOM.browserSearchInput || !DOM.browserSearchClear) return;
    DOM.browserSearchClear.hidden = DOM.browserSearchInput.value.length === 0;
  }

  function initBrowserSearch() {
    if (!DOM.browserSearch || !DOM.browserSearchInput) return;

    DOM.browserSearch.addEventListener("submit", (event) => {
      event.preventDefault();
      const destination = getSearchDestination(DOM.browserSearchInput.value);
      if (destination) window.location.assign(destination);
    });

    DOM.browserSearchInput.addEventListener("input", updateSearchClearButton);

    DOM.browserSearchClear?.addEventListener("click", () => {
      DOM.browserSearchInput.value = "";
      updateSearchClearButton();
      DOM.browserSearchInput.focus();
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      const focusShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      const slashShortcut = event.key === "/" && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey;

      if (focusShortcut || slashShortcut) {
        event.preventDefault();
        DOM.browserSearchInput.focus();
        DOM.browserSearchInput.select();
      }
    });

    updateSearchClearButton();
  }

  function updateProgress() {
    if (!DOM.progress) return;

    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;

    const ratio = scrollHeight > 0 ? (scrollTop / scrollHeight) : 0;
    DOM.progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  }

  function setActiveLink() {
    const sections = DOM.navLinks
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    const y = window.scrollY + 110;

    let activeId = null;
    for (const sec of sections) {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      if (y >= top && y < bottom) {
        activeId = `#${sec.id}`;
        break;
      }
    }

    DOM.navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("active", href === activeId);
    });
  }

  function initRevealObserver() {
    if (!("IntersectionObserver" in window)) {
      DOM.reveals.forEach((el) => el.classList.add("show"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    DOM.reveals.forEach((el) => obs.observe(el));
  }

  function openModal({ title, desc, stack, link }) {
    if (!DOM.modal) return;

    DOM.modalTitle.textContent = title || "Project";
    DOM.modalDesc.textContent = desc || "";
    DOM.modalStack.textContent = stack || "";
    const hasProjectLink = Boolean(link && link !== "#");
    DOM.modalLink.href = hasProjectLink ? link : "#";
    if (DOM.modalLinkRow) DOM.modalLinkRow.hidden = !hasProjectLink;

    DOM.modal.classList.add("open");
    DOM.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    DOM.modalClose?.focus();
  }

  function closeModal() {
    if (!DOM.modal) return;
    DOM.modal.classList.remove("open");
    DOM.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function initModal() {
    DOM.detailsButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        openModal({
          title: btn.dataset.title,
          desc: btn.dataset.desc,
          stack: btn.dataset.stack,
          link: btn.dataset.link,
        });
      });
    });

    DOM.modalClose?.addEventListener("click", closeModal);

    DOM.modal?.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.close === "true") closeModal();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && DOM.modal?.classList.contains("open")) closeModal();
    });
  }

  function initContactForm() {
    if (!DOM.contactForm) return;

    DOM.contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!DOM.formNote) return;

      // UI-only demo behavior
      DOM.formNote.textContent = "Message prepared. Connect this form to a backend (EmailJS / API) to send for real.";
      DOM.contactForm.reset();

      window.setTimeout(() => {
        DOM.formNote.textContent = "";
      }, 4500);
    });
  }

  function init() {
    setYear();
    initTheme();
    initBrowserSearch();
    initRevealObserver();
    initModal();
    initContactForm();

    DOM.navToggle?.addEventListener("click", toggleMenu);
    DOM.navLinks.forEach((a) => a.addEventListener("click", handleNavLinkClick));
    DOM.themeToggle?.addEventListener("click", toggleTheme);

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      // Close menu when clicking outside (mobile)
      if (
        DOM.navMenu?.classList.contains("open") &&
        !DOM.navMenu.contains(target) &&
        !DOM.navToggle?.contains(target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("scroll", () => {
      updateProgress();
      setActiveLink();
    });

    updateProgress();
    setActiveLink();
  }

  init();
})();
