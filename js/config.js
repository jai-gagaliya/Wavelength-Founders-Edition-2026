/**
 * WAVELENGTH — Founders' Edition 2026
 * Central Configuration & Asset Registry
 *
 * Digital & Augmented Reality Companion
 * Includes:
 * 1. White House Grand Prix 3D Racing Game
 * 2. Studio AI-Narration Audiobook Library (Kind 1: On-Page Player)
 * 3. Optical VFX AR Video & In-Engine Audiobooks (Kind 2: MindAR Engine)
 */

const WAVELENGTH_CONFIG = {
  // Magazine Metadata
  magazine: {
    title: "Wavelength",
    edition: "Founders' Edition 2026",
    subtitle: "Digital & Augmented Reality Companion",
    school: "Welham Boys' School",
    foundedYear: "1937",
    publisher: "Editorial Board, Welham Boys' School",
    theme: "Print, Motion & Acoustic Synthesis",
    date: "Founders' 2026",
    copyright: "Wavelength Magazine. All rights reserved."
  },

  // Pillar 1: The 3D Racing Game
  game: {
    id: "white-house-grand-prix",
    title: "White House Grand Prix",
    editionTitle: "White House Lawn & Jr. School Circuit",
    circuit: "The White House Lawn & Jr. School",
    laps: 3,
    competitors: 4,
    path: "./white-house-grand-prix/index.html",
    heroImage: "./assets/images/game/white-house-grand-prix-hero.jpg",
    renderImage: "./assets/images/game/game-render.jpg",
    aerialImage: "./assets/images/game/white-house-aerial.jpg",
    facadeImage: "./assets/images/game/white-house-facade.jpg",
    description:
      "High-octane 3D physics-driven racing through the White House Lawn and the Jr. School. Featuring authentic campus vehicles, Cannon.js physics, dynamic drifting, and synthesized engine acoustics.",
    vehicles: [
      {
        id: "ambassador",
        number: "01",
        name: "Vintage Ambassador",
        badge: "Staff Classic",
        tagline: "The marvel of Indian roads. Balanced, dignified, unstoppable.",
        image: "./assets/images/game/ambassador.jpg",
        topSpeedDisplay: "142",
        topSpeedUnit: "KM/H",
        accelDisplay: "3.8s 0-100",
        stats: { topSpeed: 88, accel: 78, drift: 85, handling: 82 }
      },
      {
        id: "rickshaw",
        number: "02",
        name: "Auto-Rickshaw",
        badge: "Drift King",
        tagline: "Three wheels of fury. Quick off the line, born to drift.",
        image: "./assets/images/game/rickshaw.jpg",
        topSpeedDisplay: "126",
        topSpeedUnit: "KM/H",
        accelDisplay: "2.9s 0-100",
        stats: { topSpeed: 80, accel: 94, drift: 96, handling: 90 }
      },
      {
        id: "carriage",
        number: "03",
        name: "Royal Carriage",
        badge: "Campus Royal",
        tagline: "Speed meets classic momentum. Dignified and fast.",
        image: "./assets/images/game/carriage.jpg",
        topSpeedDisplay: "135",
        topSpeedUnit: "KM/H",
        accelDisplay: "4.2s 0-100",
        stats: { topSpeed: 84, accel: 72, drift: 75, handling: 80 }
      },
      {
        id: "jeep",
        number: "04",
        name: "Mountain Jeep",
        badge: "Off-Road Enforcer",
        tagline: "Rugged authority. Cuts through campus terrain effortlessly.",
        image: "./assets/images/game/jeep.jpg",
        topSpeedDisplay: "152",
        topSpeedUnit: "KM/H",
        accelDisplay: "3.4s 0-100",
        stats: { topSpeed: 92, accel: 86, drift: 80, handling: 88 }
      }
    ]
  },

  // Pillar 2: Audiobook Library (Kind 1 - On-Page Player, MHS 2026 Style)
  audiobooks: [
    {
      id: "article-1",
      number: "01",
      title: "Breaking Point: Bohr’s Critique of Einstein’s Light Box Experiment (For Quantum Physics)",
      author: "Satwik Sameer",
      narrator: "AI-Narration",
      category: "Theoretical Physics · Quantum Foundations",
      description:
        "A rigorous exploration of Niels Bohr's historic counter-argument using Einstein's own General Relativity against his photon box thought experiment.",
      audioSrc: "./assets/audio/breaking-point-bohr.mp3",
      coverImage: "./assets/images/covers/cover-1.svg?v=2026.founders_rev4",
      tag: "Cover Feature · Page 08",
      duration: "3:57",
      accentColor: "#c8a97e"
    },
    {
      id: "article-2",
      number: "02",
      title: "Breaking Point: Einstein’s Light Box Experiment (Anti-Quantum Physics)",
      author: "Shaurya Agarwal",
      narrator: "AI-Narration",
      category: "Quantum Mechanics & Epistemology",
      description:
        "Albert Einstein's ingenious challenge to the Heisenberg time-energy uncertainty principle utilizing an idealized photon clock suspended in gravity.",
      audioSrc: "./assets/audio/breaking-point-einstein.mp3",
      coverImage: "./assets/images/covers/cover-2.svg?v=2026.founders_rev4",
      tag: "Special Dispatch · Page 12",
      duration: "3:57",
      accentColor: "#d97746"
    },
    {
      id: "article-3",
      number: "03",
      title: "Nobel Prize Winners 2026 – Medicine and Physiology",
      author: "Chirag Rajparohit",
      narrator: "AI-Narration",
      category: "Biomedical Sciences & Genetics",
      description:
        "Comprehensive breakdown of the groundbreaking discoveries recognized by the Nobel Assembly in physiology and post-transcriptional gene regulation.",
      audioSrc: "./assets/audio/nobel-prize-medicine-2026.mp3",
      coverImage: "./assets/images/covers/cover-3.svg?v=2026.founders_rev4",
      tag: "Nobel Series · Page 16",
      duration: "4:10",
      accentColor: "#8eb69b"
    },
    {
      id: "article-4",
      number: "04",
      title: "Nobel Prize Winners 2026- Chemistry",
      author: "Tejas Gulati",
      narrator: "AI-Narration",
      category: "Chemical Biology & Computation",
      description:
        "Analyzing the revolutionary synthesis and computational breakthroughs in macromolecular molecular modeling crowned in Stockholm.",
      audioSrc: "./assets/audio/nobel-prize-chemistry-2026.mp3",
      coverImage: "./assets/images/covers/cover-4.svg?v=2026.founders_rev4",
      tag: "Nobel Series · Page 20",
      duration: "4:13",
      accentColor: "#d89f53"
    },
    {
      id: "article-5",
      number: "05",
      title: "Physics Nobel Prize Winner 2026",
      author: "Dhruv Aggarwal",
      narrator: "AI-Narration",
      category: "Computational Physics & Machine Learning",
      description:
        "Foundational investigations into statistical mechanics and artificial neural architectures honored by the Royal Swedish Academy of Sciences.",
      audioSrc: "./assets/audio/nobel-prize-physics-2026.mp3",
      coverImage: "./assets/images/covers/cover-5.svg?v=2026.founders_rev4",
      tag: "Nobel Series · Page 24",
      duration: "4:19",
      accentColor: "#799be4"
    },
    {
      id: "article-6",
      number: "06",
      title: "Tesla Roadster Review",
      author: "Agastya Gupta",
      narrator: "AI-Narration",
      category: "Automotive Engineering & Electric Propulsion",
      description:
        "An in-depth technical analysis and road critique of the all-electric supercar, its cold-gas thruster package, and next-generation powertrain dynamics.",
      audioSrc: "./assets/audio/tesla-roadster-review.mp3",
      coverImage: "./assets/images/covers/cover-6.svg?v=2026.founders_rev4",
      tag: "Automotive Desk · Page 30",
      duration: "3:06",
      accentColor: "#ef4444"
    }
  ],

  // Pillar 3: Optical VFX AR Engine & In-Engine Audio (Kind 2 - Baisakhi 2026 Style)
  vfx: {
    targetsFile: "./mindar-targets/targets.mind",
    isTargetFileCompiled: true,
    totalTargets: 7,

    // AR Experience 1: VFX Motion Video Reveal (Target Index 4 - Page 30)
    videoExperience: {
      targetIndex: 4,
      markerId: "page30",
      videoSrc: "./assets/videos/Navier-%20Strokes%20VFX.mp4",
      fallbackVideoSrc: "./assets/videos/Navier-%20Strokes%20VFX.mp4",
      title: "Navier-Stokes VFX Motion Reveal",
      subtitle: "Page 30 · Visual Motion Overlay",
      description:
        "Align your camera over Page 30 to unlock the full-motion Navier-Stokes VFX sequence anchored directly atop the physical page.",
      aspectRatio: { width: 1.0, height: 1.4145 },
      accentColor: "#8c5e35"
    },

    // AR Experience 2: In-Engine AR Audiobooks (Pages 06, 07, 08, 13, 37, 38)
    audioExperience: [
      {
        targetIndex: 0,
        markerId: "page06",
        audioSrc: "./assets/audio/06.mp3",
        audioId: "arAudio06",
        title: "Physics Nobel Prize Winner 2026",
        author: "Dhruv Aggarwal",
        magazineRef: "Spread · Page 06",
        description: "Scanning Page 06 triggers the in-camera AR Audiobook floating controls for Dhruv Aggarwal's analysis.",
        accentColor: "#7e5a9b"
      },
      {
        targetIndex: 1,
        markerId: "page07",
        audioSrc: "./assets/audio/07.mp3",
        audioId: "arAudio07",
        title: "Nobel Prize Winners 2026 – Chemistry",
        author: "Tejas Gulati",
        magazineRef: "Spread · Page 07",
        description: "Scanning Page 07 streams Tejas Gulati's audio narration directly over the chemistry spread.",
        accentColor: "#c8a97e"
      },
      {
        targetIndex: 2,
        markerId: "page08",
        audioSrc: "./assets/audio/08.mp3",
        audioId: "arAudio08",
        title: "Nobel Prize Winners 2026 – Medicine & Physiology",
        author: "Chirag Rajparohit",
        magazineRef: "Spread · Page 08",
        description: "Scanning Page 08 unlocks the floating AR audio player for Chirag Rajparohit's Nobel coverage.",
        accentColor: "#3a7d65"
      },
      {
        targetIndex: 3,
        markerId: "page13",
        audioSrc: "./assets/audio/13.mp3",
        audioId: "arAudio13",
        title: "Tesla Roadster Review",
        author: "Agastya Gupta",
        magazineRef: "Tech Review · Page 13",
        description: "Scanning Page 13 streams Agastya Gupta's comprehensive Tesla Roadster review.",
        accentColor: "#d94b46"
      },
      {
        targetIndex: 5,
        markerId: "page37",
        audioSrc: "./assets/audio/37.mp3",
        audioId: "arAudio37",
        title: "Breaking Point: Einstein’s Light Box Experiment",
        author: "Shaurya Agarwal",
        magazineRef: "Special Dispatch · Page 37",
        description: "Scanning Page 37 reveals the floating AR audio player for Shaurya Agarwal's light box challenge.",
        accentColor: "#d97746"
      },
      {
        targetIndex: 6,
        markerId: "page38",
        audioSrc: "./assets/audio/38.mp3",
        audioId: "arAudio38",
        title: "Breaking Point: Bohr’s Critique",
        author: "Satwik Sameer",
        magazineRef: "Feature Spread · Page 38",
        description: "Scanning Page 38 brings up the floating AR audio HUD for Satwik Sameer's Bohr critique.",
        accentColor: "#c8a97e"
      }
    ]
  }
};

// Export for module systems or attach to window
if (typeof module !== "undefined" && module.exports) {
  module.exports = WAVELENGTH_CONFIG;
} else if (typeof window !== "undefined") {
  window.WAVELENGTH_CONFIG = WAVELENGTH_CONFIG;
}
