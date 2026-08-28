export default function Terminal() {
  const year = new Date().getFullYear();

  return (
    <div className="border-t border-editor-line bg-editor-panel px-4 py-6 sm:px-6">
      <p className="font-mono text-xs text-editor-muted">
        <span className="text-editor-teal">$</span> echo &quot;built with
        Next.js, deployed on Vercel&quot;
      </p>
      <p className="mt-1 font-mono text-xs text-editor-muted">
        © {year} Randy Kim. Source on{" "}
        <a
          href="https://github.com/yourname/portfolio"
          target="_blank"
          rel="noreferrer"
          className="text-editor-amber hover:underline"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
