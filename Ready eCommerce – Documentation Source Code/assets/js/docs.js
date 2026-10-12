"use strict";

(function () {
  const ready = (fn) => {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  };

  ready(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll(".doc-section[id]"));
    const desktopNav = document.getElementById("docs-nav");
    const mobileNav = document.querySelector("#mobileSidebar .sidebar-nav");
    const offcanvasEl = document.getElementById("mobileSidebar");
    const mobileCanvas = offcanvasEl && window.bootstrap ? bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl) : null;
    const searchInputs = Array.from(document.querySelectorAll("#doc-search, #doc-search-sidebar, #doc-search-mobile"));
    const searchForms = Array.from(document.querySelectorAll("form[role='search']"));
    const searchEmpty = document.getElementById("search-empty-state");
    const progressBar = document.getElementById("reading-progress-bar");
    const backTop = document.getElementById("back-to-top");
    const themeToggle = document.getElementById("theme-toggle");
    const mainContent = document.getElementById("main-content");
    const usesMainScroller = () => window.innerWidth >= 992 && mainContent;
    const scrollElement = () => usesMainScroller() ? mainContent : window;

    if (desktopNav && mobileNav && !mobileNav.children.length) {
      mobileNav.innerHTML = desktopNav.innerHTML;
    }

    const navLinks = Array.from(document.querySelectorAll(".nav-link-doc"));

    const setTheme = (theme) => {
      root.setAttribute("data-theme", theme);
      localStorage.setItem("readygrocery-doc-theme", theme);
      if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
        themeToggle.setAttribute("title", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      }
    };

    const storedTheme = localStorage.getItem("readygrocery-doc-theme");
    const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(storedTheme || (systemDark ? "dark" : "light"));

    themeToggle?.addEventListener("click", () => {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });

    const offsetTop = () => {
      const topbar = document.querySelector(".topbar");
      return (topbar?.offsetHeight || 76) + 16;
    };
    const anchorOffset = () => usesMainScroller() ? 36 : offsetTop();

    const scrollToId = (id, push = true) => {
      const target = document.getElementById(id);
      if (!target) return;
      if (usesMainScroller()) {
        const targetTop = target.getBoundingClientRect().top;
        const scrollerTop = mainContent.getBoundingClientRect().top;
        const y = targetTop - scrollerTop + mainContent.scrollTop - anchorOffset();
        mainContent.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else {
        const y = target.getBoundingClientRect().top + window.pageYOffset - anchorOffset();
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
      if (push) history.replaceState(null, "", `#${id}`);
      setActive(id);
    };

    const setActive = (id) => {
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", active);
        active ? link.setAttribute("aria-current", "location") : link.removeAttribute("aria-current");
      });
    };

    const updateActiveFromScroll = () => {
      const rootRect = usesMainScroller()
        ? mainContent.getBoundingClientRect()
        : { top: 0, height: window.innerHeight };
      const marker = rootRect.top + Math.min(180, rootRect.height * 0.25);
      const current = sections.find((section) => {
        if (section.classList.contains("is-hidden-by-search")) return false;
        const rect = section.getBoundingClientRect();
        return rect.top <= marker && rect.bottom > marker;
      });
      if (current?.id) setActive(current.id);
    };

    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      scrollToId(hash.slice(1));
      if (window.innerWidth < 992 && mobileCanvas) mobileCanvas.hide();
    });

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting && !entry.target.classList.contains("is-hidden-by-search"))
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    }, { root: usesMainScroller() ? mainContent : null, rootMargin: "-18% 0px -68% 0px", threshold: [0.1, 0.25, 0.45] });
    sections.forEach((section) => observer.observe(section));

    const sectionText = (section) => `${section.textContent || ""} ${section.dataset.search || ""}`.toLowerCase();
    const runSearch = (value) => {
      const query = (value || "").trim().toLowerCase();
      let firstMatch = null;
      let count = 0;

      sections.forEach((section) => {
        const match = !query || sectionText(section).includes(query);
        section.classList.toggle("is-hidden-by-search", !match);
        section.classList.remove("search-match");
        if (match) {
          count += 1;
          if (query && !firstMatch) firstMatch = section;
        }
      });

      document.querySelectorAll(".nav-group").forEach((group) => {
        const links = Array.from(group.querySelectorAll(".nav-link-doc"));
        const visibleLinks = links.filter((link) => {
          const id = (link.getAttribute("href") || "").replace("#", "");
          const section = id ? document.getElementById(id) : null;
          const match = !query || (section && !section.classList.contains("is-hidden-by-search"));
          link.classList.toggle("is-hidden-by-search", !match);
          return match;
        });
        group.classList.toggle("is-hidden-by-search", visibleLinks.length === 0);
      });

      if (searchEmpty) searchEmpty.hidden = !query || count > 0;

      if (firstMatch) {
        firstMatch.classList.add("search-match");
        window.clearTimeout(runSearch._timer);
        runSearch._timer = window.setTimeout(() => scrollToId(firstMatch.id, false), 130);
      }
    };

    searchForms.forEach((form) => form.addEventListener("submit", (e) => e.preventDefault()));
    searchInputs.forEach((input) => {
      input?.addEventListener("input", (event) => {
        const value = event.target.value;
        searchInputs.forEach((other) => { if (other && other !== event.target) other.value = value; });
        runSearch(value);
      });
      input?.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          input.value = "";
          searchInputs.forEach((other) => { if (other) other.value = ""; });
          runSearch("");
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if ((event.key === "/" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) && !typing) {
        event.preventDefault();
        const visible = searchInputs.find((input) => input && input.offsetParent !== null) || searchInputs[0];
        visible?.focus();
      }
    });

    const updateProgress = () => {
      const scroller = usesMainScroller() ? mainContent : document.documentElement;
      const position = usesMainScroller() ? mainContent.scrollTop : window.scrollY;
      const viewport = usesMainScroller() ? mainContent.clientHeight : window.innerHeight;
      const total = scroller.scrollHeight - viewport;
      const percent = total > 0 ? Math.min(100, Math.max(0, (position / total) * 100)) : 0;
      if (progressBar) progressBar.style.width = `${percent}%`;
      backTop?.classList.toggle("is-visible", position > 700);
      updateActiveFromScroll();
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    mainContent?.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    backTop?.addEventListener("click", () => scrollElement().scrollTo({ top: 0, behavior: "smooth" }));

    document.querySelectorAll(".copy-code-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-copy-target");
        const code = id ? document.getElementById(id) : null;
        if (!code) return;
        const original = button.textContent;
        try {
          await navigator.clipboard.writeText(code.textContent.trim());
          button.textContent = "Copied";
        } catch (_) {
          button.textContent = "Copy failed";
        }
        setTimeout(() => { button.textContent = original || "Copy"; }, 1600);
      });
    });

    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(() => scrollToId(location.hash.slice(1), false), 250);
    } else if (sections[0]) {
      setActive(sections[0].id);
    }
  });
})();
