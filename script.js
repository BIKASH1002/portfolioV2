const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = Boolean(window.gsap);
const hasScrollTrigger = Boolean(window.gsap && window.ScrollTrigger);
const footerYear = document.querySelector("#footerYear");

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

if (window.Splitting) {
  Splitting();
}
if (hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

const progress = document.querySelector(".progress");
const nav = document.querySelector(".site-nav");
const backToTop = document.querySelector(".back-to-top");
let lenis = null;

function scrollToTarget(target, options = {}) {
  if (lenis && !reduceMotion) {
    lenis.scrollTo(target, options);
    return;
  }

  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
  } else if (target) {
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
}

function updateScrollUI() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) {
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }
  if (nav) {
    nav.classList.toggle("scrolled", window.scrollY > 100);
  }
  if (backToTop) {
    backToTop.classList.toggle("is-visible", window.scrollY > 400);
  }
}
window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    scrollToTarget(0);
  });
}

if (!reduceMotion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1, duration: 1.2, smoothWheel: true });
  if (hasScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href").slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    scrollToTarget(target, { offset: -72 });
    history.pushState(null, "", `#${id}`);
  });
});

const typedStrings = [
    "Building AI that ships to production.",
    "From EEG signals to IEEE publications.",
    "Django APIs meet deep learning models.",
    "Research-grade ML for real-world problems."
];

if (window.Typed) {
  new Typed("#typed", {
    strings: typedStrings,
    typeSpeed: 45,
    backSpeed: 25,
    backDelay: 2000,
    loop: true,
    startDelay: reduceMotion ? 0 : 1200
  });
} else {
  const typed = document.querySelector("#typed");
  if (typed) typed.textContent = typedStrings[0];
}

function countStats() {
  document.querySelectorAll("[data-count]").forEach((item) => {
    const target = Number(item.dataset.count);
    const decimals = String(target).includes(".") ? 2 : 0;
    if (!hasGsap) {
      item.innerText = target + (target === 10 ? "+" : target === 92.4 ? "%" : "");
      return;
    }
    gsap.fromTo(item, { innerText: 0 }, {
      innerText: target,
      duration: 1.5,
      snap: { innerText: decimals ? 0.01 : 1 },
      onUpdate() {
        const value = Number(item.innerText);
        item.innerText = value.toFixed(decimals).replace(/\.00$/, "") + (target === 10 ? "+" : target === 92.4 ? "%" : "");
      }
    });
  });
}

function runHeroSequence() {
  if (!reduceMotion && hasGsap) {
    const lineOneChars = document.querySelectorAll(".hero-name > span:first-child .char");
    const lineTwoChars = document.querySelectorAll(".hero-name > span:nth-child(2) .char");
    const nameStart = .5;
    const nameDuration = .8 + Math.max(0, Math.max(lineOneChars.length, lineTwoChars.length) - 1) * .04;
    const afterNameStart = nameStart + nameDuration + .35;
    const tl = gsap.timeline();
    tl.from(".site-nav", { yPercent: -100, duration: .6, ease: "power3.out" })
      .from(".hero-copy", { opacity: 0, x: -30, duration: .8, ease: "power3.out" }, .3)
      .from(lineOneChars, { yPercent: 100, opacity: 0, duration: .8, stagger: .04, ease: "power3.out" }, nameStart)
      .from(lineTwoChars, { yPercent: 100, opacity: 0, duration: .8, stagger: .04, ease: "power3.out" }, nameStart)
      .from(".hero-bio", { opacity: 0, y: 18, duration: .6 }, afterNameStart)
      .from(".hero-actions .button", { opacity: 0, scale: .95, duration: .45, stagger: .08 }, afterNameStart + .2)
      .from(".hero-stats article", { opacity: 0, y: 18, duration: .5, stagger: .08, onStart: countStats }, afterNameStart + .4);

    if (hasScrollTrigger) {
      gsap.utils.toArray(".journey article, .experience-list article, .publications article, .recognition article").forEach((item) => {
        gsap.from(item, {
          scrollTrigger: { trigger: item, start: "top 84%" },
          opacity: 0,
          y: 24,
          duration: .7,
          ease: "power3.out"
        });
      });
    }
  } else {
    countStats();
  }
}

runHeroSequence();

const cards = hasGsap ? gsap.utils.toArray(".project-card") : Array.from(document.querySelectorAll(".project-card"));

document.querySelectorAll(".filters button").forEach((button) => {
  button.addEventListener("click", () => {
    const active = document.querySelector(".filters .active");
    if (active) active.classList.remove("active");
    button.classList.add("active");
    const filter = button.dataset.filter;

    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.category.includes(filter);
      card.classList.toggle("is-hidden", !show);
    });

    if (hasScrollTrigger) ScrollTrigger.refresh();
  });
});

function escapeSvgText(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const skillGroups = {
  Languages: ["Python", "C/C++", "SQL"],
  "ML / AI": ["Scikit-learn", "TensorFlow", "Keras", "PyTorch", "HuggingFace", "Qiskit"],
  NLP: ["spaCy", "BERT", "TF-IDF", "Transformers"],
  Data: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Power BI"],
  Backend: ["Django", "REST APIs", "Celery", "PostgreSQL", "AWS S3"],
  "Big Data": ["Hadoop", "Spark"],
  Tools: ["Git", "JIRA", "Confluence", "VS Code", "Google Colab", "JMeter"]
};

const skillTags = document.querySelector("#skillTags");
if (skillTags) {
  skillTags.innerHTML = Object.entries(skillGroups).map(([group, items]) => `
    <section>
      <h3>${escapeSvgText(group)}</h3>
      <div>${items.map((item) => `<span>${escapeSvgText(item)}</span>`).join("")}</div>
    </section>
  `).join("");
}

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-links a");
const railLinks = document.querySelectorAll(".section-rail a");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${entry.target.id}`;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    railLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${entry.target.id}`;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  });
}, { threshold: .35 });
sections.forEach((section) => observer.observe(section));

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-links");
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.forEach((link) => link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
}

const copyEmail = document.querySelector(".copy-email");
if (copyEmail) {
  copyEmail.addEventListener("click", async (event) => {
    event.preventDefault();
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(copyEmail.dataset.copy);
    } else {
      const field = document.createElement("textarea");
      field.value = copyEmail.dataset.copy;
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    const label = copyEmail.querySelector("span");
    if (!label) return;
    label.textContent = "Copied!";
    setTimeout(() => { label.textContent = "Copy"; }, 2000);
  });
}
