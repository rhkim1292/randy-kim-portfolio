import Hero from "@/components/Hero";
import NowPlaying from "@/components/NowPlaying";
// import CharacterSheet from "@/components/CharacterSheet";

export default function Home() {
  return (
    <div>
      <Hero />
      {/* <div className="px-4 py-6 sm:px-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-wide text-editor-muted">
          Character Sheet
        </p>
        <CharacterSheet />
      </div> */}
      <NowPlaying />
    </div>
  );
}
