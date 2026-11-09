import Link from "next/link";

// English legal notice (convenience translation; the German version is binding).
export default function ImpressumEn() {
  return (
    <main className="min-h-screen w-full bg-[#faf8f5] px-6 py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-[#6b6b6b] hover:text-[#b5788f] uppercase tracking-widest text-[10px] md:text-xs transition-colors"
        >
          ← Back to homepage
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl text-[#2d2d2d] mt-6 mb-4">Legal Notice</h1>
        <div className="w-12 h-px bg-[#cda1b1] mb-4" />
        <p className="text-xs text-[#6b6b6b] mb-10 rounded-xl border border-[#cda1b1]/40 bg-[#cda1b1]/10 p-3">
          This English version is provided for convenience. Only the German version is legally binding.
        </p>

        <div className="space-y-8 text-sm text-[#2d2d2d] leading-relaxed">
          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Information pursuant to § 5 DDG</h2>
            <p className="text-[#4a4a4a]">
              Ramona Krines
              <br />
              MainBar drinks &amp; food (sole proprietorship)
              <br />
              Spitalstraße 19
              <br />
              97421 Schweinfurt, Germany
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Contact</h2>
            <p className="text-[#4a4a4a]">
              Phone: <a href="tel:+491702278096" className="hover:text-[#b5788f]">+49 170 2278096</a>
              <br />
              Email:{" "}
              <a href="mailto:ramonakrines@gmail.com" className="hover:text-[#b5788f]">
                ramonakrines@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">VAT ID</h2>
            <p className="text-[#4a4a4a]">
              VAT identification number pursuant to § 27a UStG (German VAT Act): DE357534577
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">
              Responsible for content pursuant to § 18(2) MStV
            </h2>
            <p className="text-[#4a4a4a]">
              Ramona Krines
              <br />
              Spitalstraße 19, 97421 Schweinfurt, Germany
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Consumer dispute resolution</h2>
            <p className="text-[#4a4a4a]">
              We are neither willing nor obliged to take part in dispute resolution proceedings before a
              consumer arbitration board.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Liability for content and links</h2>
            <p className="text-[#4a4a4a]">
              The content of these pages has been created with care. However, we cannot guarantee that it
              is correct, complete or up to date. The operators of external websites we link to are solely
              responsible for their content; no legal violations were apparent at the time the links were
              set. If we become aware of any legal violations, we will remove the content or links
              concerned immediately.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Image credits</h2>
            <p className="text-[#4a4a4a]">Photos and videos: MainBar drinks &amp; food, Schweinfurt.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
