import Image from "next/image";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { FaLinkedin } from "react-icons/fa";

export default function Hero() {
  return (
    <div className="flex flex-col-reverse items-center justify-center gap-6 content-center border-b border-editor-line px-4 py-12 sm:flex-row sm:items-stretch sm:gap-0 sm:px-6 sm:py-16">
      <div className="basis-auto sm:basis-2/3 content-center">
        <p className="font-mono text-sm text-editor-muted">
          <span className="text-editor-violet">01</span> import {"{"} you {"}"}{" "}
          from &quot;self&quot;;
        </p>

        <h1 className="mt-4 font-mono text-xl leading-snug text-editor-text sm:text-2xl">
          Hi, I&apos;m <span className="text-editor-amber">Randy Kim</span> —
          I'm a game programmer.
          <span className="animate-blink text-editor-amber">▍</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-editor-muted sm:text-base">
          I design and build gameplay systems in Unreal Engine, C++ game
          engines, as well as websites like this one.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 font-mono text-sm">
          <a
            href="mailto:rhkim1292@gmail.com"
            className="text-editor-amber hover:underline"
          >
            rhkim1292@gmail.com
          </a>
          <a
            href="https://github.com/rhkim1292"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-editor-muted hover:text-editor-text hover:underline"
          >
            <SiGithub size={16} color="currentColor" title="" aria-hidden />
          </a>
          <a
            href="https://www.linkedin.com/in/randy-kim-7025a1160/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-editor-muted hover:text-editor-text hover:underline"
          >
            <FaLinkedin size={16} aria-hidden />
          </a>
        </div>
      </div>
      <div className="relative h-[200px] w-[200px] self-center overflow-hidden rounded-full sm:self-start">
        <Image
          src="/images/personalsitepic.png"
          alt="Randy Kim in Mexico"
          fill
          sizes="(min-width: 1024px) 320px, 30vw"
          className="object-cover"
          style={{ objectPosition: "50% 23%", transform: "scale(1.00)" }}
          priority
        />
      </div>
    </div>
  );
}
