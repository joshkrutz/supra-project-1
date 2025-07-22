export class Post {
  constructor(container) {
    this.container = container;
    this.isLoading = true;

    this.renderSkeleton();
    this.loadImageLater();
  }

  async renderSkeleton() {
    this.container.classList.add("post");
    this.container.classList.add("skeleton");

    const svg = document.createElement("div");
    svg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
        </svg>`;

    svg.classList.add("icon");
    this.container.appendChild(svg);
  }

  static async mockImageJSON() {
    Math.random.see;
    let img_src =
      Math.floor(Math.random() * 2) === 0 ? "./test2.png" : "./test.png";

    return new Promise((r) => setTimeout(r({ primaryImage: img_src }), 3000));
  }

  async loadImageLater() {
    //let imageJSON = await Post.mockImageJSON();
    let imageJSON = await Post.getNextImageJSON();
    this.isLoading = false;

    let postContainer = this.container;

    // Remove icon
    this.container.replaceChildren();

    // Prepare import json data
    let imageUrl = imageJSON.primaryImage;
    let artist = "Unknown";
    if (imageJSON.artistDisplayName && imageJSON.artistDisplayName.length > 0)
      artist = imageJSON.artistDisplayName;

    let title = artist;
    if (imageJSON.title && imageJSON.title.length > 0) {
      title = imageJSON.title;
    }

    let objectDate = artist;
    if (imageJSON.objectDate && imageJSON.objectDate.length > 0) {
      objectDate = imageJSON.objectDate;
    }

    // Make post elements: Image
    const image = document.createElement("img");
    image.alt = artist;
    postContainer.appendChild(image);

    // Avatar Container
    const avatar_container = document.createElement("div");
    avatar_container.classList.add("avatar-container");

    // Avatar image
    const avatar = document.createElement("img");
    avatar.classList.add("avatar");
    avatar.alt = "Placeholder avatar";
    avatar_container.appendChild(avatar);
    avatar.addEventListener("load", () => {
      avatar.classList.add("loaded");
    });
    avatar.src = `https://avatar.iran.liara.run/username?username=${artist.replace(
      " ",
      "+"
    )}`;

    const handleImageLoad = () => {
      image.classList.add("loaded");

      const aspectRatio = image.naturalHeight / image.naturalWidth;
      const POST_WIDTH = 300;
      const ROW_HEIGHT = 25;

      const num_rows = Math.max(
        Math.floor((aspectRatio * POST_WIDTH) / ROW_HEIGHT),
        9
      );

      postContainer.style.gridRowEnd = `span ${num_rows}`;

      image.loading = "lazy";

      // Remove skeleton
      postContainer.classList.remove("skeleton");
    };

    image.addEventListener("load", handleImageLoad);

    image.src = imageUrl;

    if (image.complete) {
      handleImageLoad();
    }

    const banner = document.createElement("div");
    banner.innerHTML = `
    <svg class="heart-icon" width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_7_60)">
        <g filter="url(#filter0_d_7_60)">
        <path d="M15 8.66568C12.7342 6.31213 8.57988 5.59239 6.31269 7.94594C4.04839 10.2995 4.38379 13.4678 6.31269 16.2259C8.2416 18.9839 11.2717 21.4627 15 24.5C18.7282 21.4627 21.7569 18.9839 23.6873 16.2259C25.6162 13.4678 25.9516 10.2995 23.6873 7.94594C21.4201 5.59239 17.2657 6.31213 15 8.66568Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
        </g>
      </g>
    </svg>`;

    banner.childNodes.forEach((child) => {
      if (child.classList && child.classList.contains("heart-icon")) {
        child.addEventListener("click", () => {
          child.classList.toggle("liked");
        });
      }
    });

    const name = document.createElement("p");
    name.innerHTML = `${artist}`;
    name.classList.add("name");
    let stage = 0;
    name.addEventListener("click", (e) => {
      stage = (stage + 1) % 3;

      if (stage === 0) {
        name.innerText = artist;
      } else if (stage === 1) {
        name.innerText = title;
      } else {
        name.innerText = objectDate;
      }
    });
    banner.insertBefore(name, banner.childNodes[0]);

    banner.classList.add("banner", "glass");
    banner.insertBefore(avatar_container, banner.childNodes[0]);

    this.container.classList.add("post");
    this.container.append(banner);
  }

  static async getNextImageJSON() {
    try {
      let res = await fetch(`http://localhost:3000/nextArt`);
      if (!res.ok) throw new Error();
      let json = await res.json();
      return json;
    } catch {
      console.log("Max retries reached. Please try again later");
      return null;
    }
  }
}
