import { Post } from "./post.js";

const loadXImages = async (x) => {
  let postGrid = document.body.querySelector(".grid");

  for (let i = 0; i < x; i++) {
    let container = document.createElement("div");
    postGrid.appendChild(container);
    let post = new Post(container);
    if (!post) return;
  }
};

addEventListener("load", async (event) => {
  // Load data
  // Create post elements
  loadLiquidGlassDefinitions();
  loadXImages(50);
});

//If we are close to the bottom of the screen, load more
addEventListener("scroll", function () {
  if (innerHeight + scrollY >= document.documentElement.scrollHeight) {
    window.scrollBy({ top: -110, behavior: "smooth" });
    loadXImages(10);
  }
});

function loadLiquidGlassDefinitions() {
  const root = document.documentElement;
  function setVar(name, val) {
    root.style.setProperty(name, val);
  }

  function updateSVG() {
    const freq = parseFloat(document.getElementById("noise-frequency").value);
    const scale = document.getElementById("distortion-strength").value;
    document
      .querySelector("feTurbulence")
      .setAttribute("baseFrequency", `${freq} ${freq}`);
    document.querySelector("feDisplacementMap").setAttribute("scale", scale);
  }

  function updateBackground() {
    const url = document.getElementById("bg-url").value;
    if (url) {
      document.body.style.background = `url('${url}') center/cover no-repeat`;
    }
  }

  // From https://liquid-glass-eta.vercel.app/

  const controls = {
    "shadow-color": ["--shadow-color", (v) => v],
    "shadow-blur": ["--shadow-blur", (v) => v + "px"],
    "shadow-spread": ["--shadow-spread", (v) => v + "px"],
    "tint-color": [
      "--tint-color",
      (v) =>
        v
          .match(/\w\w/g)
          .map((h) => parseInt(h, 16))
          .join(","),
    ],
    "tint-opacity": ["--tint-opacity", (v) => v / 100],
    "frost-blur": ["--frost-blur", (v) => v + "px"],
    // 'outer-shadow-blur': ['--outer-shadow-blur', v => v + 'px']
  };

  function updateAll() {
    Object.entries(controls).forEach(([id, [cssVar, fn]]) => {
      const el = document.getElementById(id);
      if (el) setVar(cssVar, fn(el.value));
    });

    // updateSVG();
    // updateBackground();
  }

  document
    .querySelectorAll("#controls input")
    .forEach((i) => i.addEventListener("input", updateAll));
  updateAll();
}
