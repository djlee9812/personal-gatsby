/**
 * Project data for the Projects page.
 * Add or edit entries here to update the showcase.
 */

export interface Project {
  title: string
  description: string
  techStack: string[]
  /** Public repo only; omit for private repos. */
  githubUrl?: string
  /** Apple App Store product page. */
  appStoreUrl?: string
  /** Optional: path under static/ or full URL for a screenshot or GIF (e.g. from --animate). */
  imagePath?: string
  /**
   * `cover` (default): fill the 16:10 card crop.
   * `contain`: fit the whole image inside the frame (pillar/letterboxing); use for tall phone screenshots.
   */
  imageFit?: "cover" | "contain"
  /** Optional: link to run in Binder, Colab, or similar. */
  liveDemoUrl?: string
}

export const projects: Project[] = [
  {
    title: "Poker Income Tracker",
    description:
      "A mobile app to log poker sessions and hands, track results over time, and view reports—all stored locally on your device.",
    techStack: ["Expo + React Native", "AsyncStorage", "Jest"],
    appStoreUrl: "https://apps.apple.com/us/app/poker-income-tracker/id6762243351",
    imagePath:
      "https://res.cloudinary.com/dongjoongallery/image/upload/v1778273338/homeGraph_iurgpy.png",
    imageFit: "contain",
  },
  {
    title: "Basketball Shot Simulator",
    description:
      "Dynamical simulation of a basketball shot with a 4th-order Runge-Kutta integrator. Models gravity, drag crisis, Magnus effect, and spin-dependent friction on bounces. Includes 3D trajectory visualization and a vectorized parameter sweep for shot-success heatmaps. Run with --animate for 3D animation.",
    techStack: ["Python", "NumPy", "Matplotlib"],
    githubUrl: "https://github.com/djlee9812/basketball-shot",
    imagePath: "https://raw.githubusercontent.com/djlee9812/basketball-shot/master/plots/demo.png",
  },
]
