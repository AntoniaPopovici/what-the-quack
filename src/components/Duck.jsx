// Files in public/ are copied as-is (not part of Vite's module graph),
// so they're referenced by URL string, not `import`. BASE_URL accounts
// for the "/what-the-quack/" GitHub Pages base path set in
// vite.config.js — a hardcoded "/littleduck.png" would 404 once built.
const duckSrc = `${import.meta.env.BASE_URL}littleduck.png`;

/**
 * The duck. Does a small "quack" pop when the user asks for the next
 * question.
 */
export default function Duck({ quacking = false }) {
  return (
    <img
      src={duckSrc}
      alt="A rubber duck"
      className={quacking ? "duck duck-quack" : "duck"}
    />
  );
}
