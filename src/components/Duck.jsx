// Files in public/ are copied as-is (not part of Vite's module graph),
// so they're referenced by URL string, not `import`. BASE_URL accounts
// for the "/what-the-quack/" base path set in vite.config.js, so a
// hardcoded "/littleduck.png" would 404 once built under a subpath.
const duckSrc = `${import.meta.env.BASE_URL}littleduck.png`;

/**
 * The duck. It just sits there. That is the entire job.
 */
export default function Duck() {
  return <img src={duckSrc} alt="A rubber duck, listening" className="duck" />;
}
