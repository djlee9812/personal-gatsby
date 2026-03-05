/**
 * Project data for the Projects page.
 * Add or edit entries here to update the showcase.
 */

export interface Project {
  title: string
  description: string
  techStack: string[]
  githubUrl: string
  /** Optional: path under static/ or full URL for a screenshot or GIF (e.g. from --animate). */
  imagePath?: string
  /** Optional: link to run in Binder, Colab, or similar. */
  liveDemoUrl?: string
}

export const projects: Project[] = [
  {
    title: "Basketball Shot Simulator",
    description:
      "Dynamical simulation of a basketball shot with a 4th-order Runge-Kutta integrator. Models gravity, drag crisis, Magnus effect, and spin-dependent friction on bounces. Includes 3D trajectory visualization and a vectorized parameter sweep for shot-success heatmaps. Run with --animate for 3D animation.",
    techStack: ["Python", "NumPy", "Matplotlib"],
    githubUrl: "https://github.com/djlee9812/basketball-shot",
    imagePath: "https://raw.githubusercontent.com/djlee9812/basketball-shot/master/plots/demo.png",
  },
]
