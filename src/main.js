import "./style.css";
import gsap from "gsap";

const pointerRing = document.querySelector(".cursor-ring");
const revealItems = document.querySelectorAll(".reveal");
const intro = document.getElementById("intro");

if (intro) {
  const countEl = document.getElementById("introCount");
  const barEl = document.getElementById("introBar");
  const flashEl = document.getElementById("introFlash");
  const logLines = intro.querySelectorAll("#introLog .line");
  const brandSlots = intro.querySelectorAll(".intro__brand-slot");
  const topChars = brandSlots[0]?.querySelectorAll(".char") ?? [];
  const bottomChars = brandSlots[1]?.querySelectorAll(".char") ?? [];
  const glyphs = "!@#$%&*+<>?/\\|=~0123456789abcdefghijklmnopqrstuvwxyz";
  const finalChars = ["a", "i", "m", "+"];
  const settleAt = [860, 980, 1120, 1320];
  const settled = new Array(finalChars.length).fill(false);
  const lineDelays = [220, 520, 860, 1220];

  let scrambleRaf = 0;
  let countRaf = 0;
  let scrambleStart = 0;
  let finished = false;

  const syncChar = (index, text, cycling) => {
    if (topChars[index]) {
      topChars[index].textContent = text;
      topChars[index].classList.toggle("is-cycling", cycling);
    }

    if (bottomChars[index]) {
      bottomChars[index].textContent = text;
      bottomChars[index].classList.toggle("is-cycling", cycling);
    }
  };

  const scrambleTick = () => {
    const now = performance.now() - scrambleStart;

    finalChars.forEach((char, index) => {
      if (settled[index]) return;

      if (now >= settleAt[index]) {
        settled[index] = true;
        syncChar(index, char, false);
        return;
      }

      if (now > 80) {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        syncChar(index, glyph, true);
      }
    });

    if (settled.some((value) => !value)) {
      scrambleRaf = requestAnimationFrame(scrambleTick);
    }
  };

  const typeLine = (lineEl, text, delay) => {
    window.setTimeout(() => {
      lineEl.classList.add("is-in");
      const body = lineEl.querySelector(".body");
      let index = 0;

      const step = () => {
        if (!body) return;

        if (index <= text.length) {
          body.innerHTML = `${text.slice(0, index)}<span class="intro__caret"> </span>`;
          index += 1;
          window.setTimeout(step, 20);
        } else {
          body.textContent = text;
          lineEl.classList.add("is-done");
        }
      };

      step();
    }, delay);
  };

  const countStart = { time: 0 };

  const tickCount = (time) => {
    if (finished) return;
    if (!countStart.time) countStart.time = time;

    const progress = Math.min(1, (time - countStart.time) / 1900);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * 100);

    if (countEl) countEl.textContent = String(value).padStart(3, "0");
    if (barEl) barEl.style.width = `${eased * 100}%`;

    if (progress < 1) {
      countRaf = requestAnimationFrame(tickCount);
    }
  };

  const finishIntro = () => {
    if (finished) return;
    finished = true;

    if (countEl) countEl.textContent = "100";
    if (barEl) barEl.style.width = "100%";
    finalChars.forEach((char, index) => syncChar(index, char, false));
    cancelAnimationFrame(scrambleRaf);
    cancelAnimationFrame(countRaf);

    flashEl?.classList.add("is-firing");
    window.setTimeout(() => flashEl?.classList.remove("is-firing"), 320);

    window.setTimeout(() => {
      intro.classList.add("is-done");
      document.documentElement.classList.remove("has-intro");
      document.body.classList.remove("has-intro-pending");
    }, 180);

    window.setTimeout(() => intro.remove(), 1500);
  };

  scrambleStart = performance.now();
  scrambleRaf = requestAnimationFrame(scrambleTick);
  countRaf = requestAnimationFrame(tickCount);
  logLines.forEach((line, index) => typeLine(line, line.dataset.text ?? "", lineDelays[index] ?? 0));

  const autoFinish = window.setTimeout(finishIntro, 2500);
  const skip = () => {
    window.clearTimeout(autoFinish);
    finishIntro();
  };

  intro.addEventListener("click", skip);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      skip();
    }
  });
} else {
  document.documentElement.classList.remove("has-intro");
  document.body.classList.remove("has-intro-pending");
}

window.addEventListener("pointermove", (event) => {
  if (!pointerRing) return;

  gsap.to(pointerRing, {
    x: event.clientX,
    y: event.clientY,
    duration: 0.18,
    ease: "power2.out",
  });
});

gsap.set(revealItems, {
  y: 36,
  opacity: 0,
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      gsap.to(entry.target, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      });

      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.2,
  },
);

revealItems.forEach((item) => observer.observe(item));

gsap.to(".ticker-track", {
  xPercent: -50,
  repeat: -1,
  duration: 18,
  ease: "none",
});

gsap.from(".hero-title", {
  y: 42,
  opacity: 0,
  duration: 1,
  delay: 0.25,
  ease: "power3.out",
});
