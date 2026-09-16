import Hero from "@/components/Hero";
import NowPlaying from "@/components/NowPlaying";
import TopTracks from "@/components/TopTracks";
// import CharacterSheet from "@/components/CharacterSheet";

export const revalidate = 30;

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
      <TopTracks />
    </div>
  );
}
