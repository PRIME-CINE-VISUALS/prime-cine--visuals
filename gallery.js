/* =========================================================
   PRIME CINE VISUALS — GALLERY LOGIC
   ========================================================= */

const galleryArtworks = [
  {
    id: 1,
    title: "Cybernetic Perfume",
    artist: "Arjun",
    initials: "AR",
    category: "cgi",
    categoryLabel: "CGI",
    software: "Blender",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=85",
    description:
      "A futuristic product visualization exploring luxury, reflections and cinematic lighting.",
    upvotes: 342,
    downvotes: 18,
    createdAt: 6
  },

  {
    id: 2,
    title: "Future Machine",
    artist: "Sarah",
    initials: "SA",
    category: "blender",
    categoryLabel: "BLENDER",
    software: "Blender",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
    description:
      "A hard-surface environment created for a futuristic cinematic sequence.",
    upvotes: 281,
    downvotes: 12,
    createdAt: 5
  },

  {
    id: 3,
    title: "Neon Velocity",
    artist: "Vikram",
    initials: "VI",
    category: "motion",
    categoryLabel: "MOTION",
    software: "Cinema 4D",
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85",
    description:
      "Experimental motion design built around speed, light and abstract forms.",
    upvotes: 496,
    downvotes: 31,
    createdAt: 4
  },

  {
    id: 4,
    title: "Digital Horizon",
    artist: "Meera",
    initials: "ME",
    category: "unreal",
    categoryLabel: "UNREAL",
    software: "Unreal Engine",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85",
    description:
      "A real-time environment concept created for a sci-fi cinematic experience.",
    upvotes: 521,
    downvotes: 27,
    createdAt: 3
  },

  {
    id: 5,
    title: "After Reality",
    artist: "Karan",
    initials: "KA",
    category: "vfx",
    categoryLabel: "VFX",
    software: "Houdini",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85",
    description:
      "A VFX experiment combining procedural destruction and cinematic compositing.",
    upvotes: 397,
    downvotes: 22,
    createdAt: 2
  },

  {
    id: 6,
    title: "Liquid Chrome",
    artist: "Nisha",
    initials: "NI",
    category: "cgi",
    categoryLabel: "CGI",
    software: "Blender",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85",
    description:
      "A stylized CGI study focused on liquid materials and reflective surfaces.",
    upvotes: 612,
    downvotes: 35,
    createdAt: 1
  }
];

// Load custom artworks from localStorage and combine them
let customArtworks = [];
try {
  const stored = localStorage.getItem('pcv_custom_artworks');
  if (stored) {
    customArtworks = JSON.parse(stored);
  }
} catch(e) {
  console.error("Error parsing custom artworks", e);
}

let allArtworks = [...galleryArtworks, ...customArtworks];

const galleryGrid = document.getElementById("galleryGrid");
const galleryEmpty = document.getElementById("galleryEmpty");
const artworkCount = document.getElementById("artworkCount");
const artistCount = document.getElementById("artistCount");
const gallerySort = document.getElementById("gallerySort");

let activeFilter = "all";

function score(artwork) {
  return artwork.upvotes - artwork.downvotes;
}

function renderGallery() {
  let filtered = [...allArtworks];

  if (activeFilter !== "all") {
    filtered = filtered.filter(
      artwork => artwork.category === activeFilter
    );
  }

  switch (gallerySort.value) {
    case "popular":
      filtered.sort((a, b) => score(b) - score(a));
      break;

    case "newest":
      filtered.sort((a, b) => b.createdAt - a.createdAt);
      break;

    case "controversial":
      filtered.sort(
        (a, b) =>
          b.upvotes +
          b.downvotes -
          (a.upvotes + a.downvotes)
      );
      break;
  }

  galleryGrid.innerHTML = "";

  if (!filtered.length) {
    galleryEmpty.classList.add("show");
    return;
  }

  galleryEmpty.classList.remove("show");

  filtered.forEach((artwork, index) => {
    const card = createGalleryCard(artwork);
    card.classList.add("reveal-ready");
    galleryGrid.appendChild(card);
    
    // Staggered reveal
    setTimeout(() => {
      card.classList.add("is-visible");
    }, 50 * index);
  });

  updateStats();
}

/* =========================================================
   ADD ARTWORK MODAL LOGIC
   ========================================================= */

const btnAddArtwork = document.getElementById("btnAddArtwork");
const addArtworkModal = document.getElementById("addArtworkModal");
const addModalBackdrop = document.getElementById("addModalBackdrop");
const addModalClose = document.getElementById("addModalClose");
const addArtworkForm = document.getElementById("addArtworkForm");

function openAddModal() {
  addArtworkModal.classList.add("open");
  addArtworkModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // Prevent scrolling
}

function closeAddModal() {
  addArtworkModal.classList.remove("open");
  addArtworkModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // Restore scrolling
}

if (btnAddArtwork) {
  btnAddArtwork.addEventListener("click", openAddModal);
}
if (addModalBackdrop) {
  addModalBackdrop.addEventListener("click", closeAddModal);
}
if (addModalClose) {
  addModalClose.addEventListener("click", closeAddModal);
}

if (addArtworkForm) {
  addArtworkForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById("newImage");
    if (!fileInput.files || fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
      const base64Image = event.target.result;
      const artist = document.getElementById("newArtist").value;
      const initials = artist.substring(0, 2).toUpperCase();
      const catVal = document.getElementById("newCategory").value;
      const catLabel = document.getElementById("newCategory").options[document.getElementById("newCategory").selectedIndex].text;
      
      const newArtwork = {
        id: Date.now(), // Generate unique ID
        title: document.getElementById("newTitle").value,
        artist: artist,
        initials: initials,
        category: catVal,
        categoryLabel: catLabel,
        software: document.getElementById("newSoftware").value,
        image: base64Image,
        description: document.getElementById("newDescription").value,
        upvotes: 0,
        downvotes: 0,
        createdAt: Date.now()
      };
      
      // Save and update
      customArtworks.push(newArtwork);
      allArtworks = [...galleryArtworks, ...customArtworks];
      localStorage.setItem('pcv_custom_artworks', JSON.stringify(customArtworks));
      
      // Reset form and close
      addArtworkForm.reset();
      closeAddModal();
      
      // Re-render
      renderGallery();
      
      // Show cursor again (cleanup if modal messed it up)
      const dot = document.getElementById("cursorDot");
      const ring = document.querySelector(".cursor-ring");
      if (dot) dot.classList.remove("cursor-active");
      if (ring) ring.classList.remove("cursor-ring-active");
    };
    
    reader.readAsDataURL(file);
  });
}

// Initial Render
renderGallery();

function createGalleryCard(artwork) {
  const card = document.createElement("article");

  card.className = "gallery-card";

  card.innerHTML = `
    <div class="gallery-image-wrapper">
      <img
        class="gallery-image"
        src="${artwork.image}"
        alt="${artwork.title}"
        loading="lazy"
      />

      <span class="gallery-category">
        ${artwork.categoryLabel}
      </span>
    </div>

    <div class="gallery-card-body">

      <h3 class="gallery-card-title">
        ${artwork.title}
      </h3>

      <div class="gallery-artist">

        <div class="gallery-avatar">
          ${artwork.initials}
        </div>

        <div class="gallery-artist-info">
          <span class="gallery-artist-name">
            ${artwork.artist}
          </span>

          <span class="gallery-software">
            ${artwork.software}
          </span>
        </div>

      </div>

      <div class="gallery-votes">

        <div class="vote-group">

          <button
            class="vote-button upvote"
            data-id="${artwork.id}"
          >
            ↑ ${artwork.upvotes}
          </button>

          <button
            class="vote-button downvote"
            data-id="${artwork.id}"
          >
            ↓ ${artwork.downvotes}
          </button>

        </div>

        <span class="gallery-score">
          ${score(artwork)} score
        </span>

      </div>

    </div>
  `;

  card.querySelector(".gallery-image-wrapper")
    .addEventListener("click", () => openModal(artwork));

  card.querySelector(".gallery-card-title")
    .addEventListener("click", () => openModal(artwork));

  card.querySelector(".upvote")
    .addEventListener("click", event => {
      event.stopPropagation();
      vote(artwork.id, "up");
    });

  card.querySelector(".downvote")
    .addEventListener("click", event => {
      event.stopPropagation();
      vote(artwork.id, "down");
    });

  return card;
}

function vote(id, type) {
  const artwork = allArtworks.find(
    item => item.id === id
  );

  if (!artwork) return;

  if (type === "up") {
    artwork.upvotes++;
  }

  if (type === "down") {
    artwork.downvotes++;
  }

  renderGallery();
}

function updateStats() {
  artworkCount.textContent = allArtworks.length;

  const uniqueArtists = new Set(
    allArtworks.map(artwork => artwork.artist)
  );

  artistCount.textContent = uniqueArtists.size;
}

/* FILTERS */

document.querySelectorAll(".gallery-filter")
  .forEach(button => {
    button.addEventListener("click", () => {

      document
        .querySelectorAll(".gallery-filter")
        .forEach(btn => btn.classList.remove("active"));

      button.classList.add("active");

      activeFilter = button.dataset.filter;

      renderGallery();
    });
  });

gallerySort.addEventListener(
  "change",
  renderGallery
);

/* MODAL */

const modal = document.getElementById("artworkModal");

function openModal(artwork) {
  document.getElementById("modalImage").src =
    artwork.image;

  document.getElementById("modalImage").alt =
    artwork.title;

  document.getElementById("modalCategory").textContent =
    artwork.categoryLabel;

  document.getElementById("modalTitle").textContent =
    artwork.title;

  document.getElementById("modalArtist").textContent =
    artwork.artist;

  document.getElementById("modalAvatar").textContent =
    artwork.initials;

  document.getElementById("modalDescription").textContent =
    artwork.description;

  document.getElementById("modalSoftware").textContent =
    `Software: ${artwork.software}`;

  document.getElementById("modalScore").textContent =
    `Score: ${score(artwork)}`;

  document.getElementById("modalUpvote").onclick = () => {
    vote(artwork.id, "up");
    openModal(
      allArtworks.find(item => item.id === artwork.id)
    );
  };

  document.getElementById("modalDownvote").onclick = () => {
    vote(artwork.id, "down");
    openModal(
      allArtworks.find(item => item.id === artwork.id)
    );
  };

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

document
  .querySelectorAll("[data-close-modal]")
  .forEach(element => {
    element.addEventListener(
      "click",
      closeModal
    );
  });

document.addEventListener(
  "keydown",
  event => {
    if (event.key === "Escape") {
      closeModal();
    }
  }
);

/* INITIALIZE */

renderGallery();