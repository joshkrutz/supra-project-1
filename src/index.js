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
  loadXImages(50);
});

//If we are close to the bottom of the screen, load more
addEventListener("scroll", function () {
  if (innerHeight + scrollY >= document.documentElement.scrollHeight) {
    window.scrollBy({ top: -110, behavior: "smooth" });
    loadXImages(10);
  }
});
