import Link from "next/link";
import { Section, linkClass } from "./Section";

// English privacy policy (convenience translation; the German version is binding).
export default function DatenschutzEn() {
  return (
    <main className="min-h-screen w-full bg-[#faf8f5] px-6 py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-[#6b6b6b] hover:text-[#b5788f] uppercase tracking-widest text-[10px] md:text-xs transition-colors"
        >
          ← Back to homepage
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2d2d2d] mt-6 mb-4 break-words">Privacy Policy</h1>
        <div className="w-12 h-px bg-[#cda1b1] mb-4" />
        <p className="text-xs text-[#6b6b6b] mb-4">Last updated: November 2026</p>
        <p className="text-xs text-[#6b6b6b] mb-10 rounded-xl border border-[#cda1b1]/40 bg-[#cda1b1]/10 p-3">
          This English version is provided for convenience. Only the German version is legally binding.
        </p>

        <div className="space-y-8 text-sm text-[#2d2d2d] leading-relaxed">
          <Section title="1. Controller">
            <p>
              MainBar drinks &amp; food, owner: Ramona Krines (sole proprietorship)
              <br />
              Spitalstraße 19, 97421 Schweinfurt, Germany
              <br />
              Email: <a href="mailto:ramonakrines@gmail.com" className={linkClass}>ramonakrines@gmail.com</a>
              <br />
              Phone: <a href="tel:+491702278096" className={linkClass}>+49 170 2278096</a>
            </p>
          </Section>

          <Section title="2. Overview">
            <p>
              We only process personal data to the extent necessary to operate this website, handle your
              enquiries or display your review. We do not use analytics, tracking or advertising cookies
              and do not create usage profiles. The connection between your browser and our website is
              encrypted via TLS (HTTPS).
            </p>
          </Section>

          <Section title="3. Hosting and server log files">
            <p>
              This website is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. When
              you visit the website, the hosting provider automatically processes technical data (server
              log files), in particular your IP address, the date and time of access, the page visited,
              the referrer and the browser type. This is necessary to deliver the website and to ensure
              its security and stability (Art. 6(1)(f) GDPR).
            </p>
            <p>
              We have concluded a data processing agreement with Vercel. Transfers to the USA are based on
              the EU-US Data Privacy Framework, under which Vercel is certified, and additionally on the
              European Commission&apos;s Standard Contractual Clauses.
            </p>
          </Section>

          <Section title="4. Protection against misuse">
            <p>
              When you submit the booking form, a review or a deletion request, we process your IP address
              (for bookings and deletion requests also the email address you provide) in order to limit
              the number of requests per sender and per recipient and thus prevent mass spam requests.
              Both are stored only briefly for this purpose (for a maximum of about 20 minutes), in our
              server&apos;s memory and, where applicable, with our service provider Upstash, Inc. (Redis
              database). The legal basis is our legitimate interest in the security of the website
              (Art. 6(1)(f) GDPR).
            </p>
          </Section>

          <Section title="5. Event & catering enquiries (booking form)">
            <p>
              When you send an enquiry via the booking form, we process: the requested area (indoors,
              outdoors or catering), number of guests, date, federal state, city, phone number and email
              address.
            </p>
            <p>
              Your details are first checked by our server, then sent to us by email and stored in our
              Firebase database (see section 10) so that we can handle your enquiry. You will receive an
              email confirmation of receipt containing only the date, number of guests and area.
            </p>
            <p>
              The legal basis is the performance of pre-contractual measures at your request
              (Art. 6(1)(b) GDPR) and your consent via the checkbox in the form (Art. 6(1)(a) GDPR). The
              data is deleted once the enquiry has been fully handled and no statutory retention
              obligations apply.
            </p>
          </Section>

          <Section title="6. Sending emails">
            <p>
              To send the enquiry and confirmation emails, we use the Gmail email service of Google
              Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland. Google processes the
              contents of the email and the email addresses involved. A transfer to Google LLC in the USA
              is possible; Google is certified under the EU-US Data Privacy Framework. The legal basis is
              Art. 6(1)(b) or (f) GDPR.
            </p>
          </Section>

          <Section title="7. Reviews">
            <p>
              If you leave a review on the homepage, we store the first name you provide, the star
              rating, your text and the time of submission. Reviews are only published on the website
              after we have checked them; we may reject or remove reviews, for example in the case of
              offensive content or spam.
            </p>
            <p>
              The legal basis is your consent given by submitting the form including the checkbox
              (Art. 6(1)(a) GDPR). Reviews are stored in Firebase (section 10). You can withdraw your
              consent at any time and request deletion (section 12).
            </p>
          </Section>

          <Section title="8. Deletion requests via the website">
            <p>
              Using the “Delete data” link on the homepage, you can request the deletion of your data. The
              email address you provide is sent to us by email. We review the request, delete the related
              enquiries and reviews and confirm the deletion to you by email, at the latest within one
              month. The legal basis is the fulfilment of our legal obligations (Art. 6(1)(c) in
              conjunction with Art. 17 GDPR).
            </p>
          </Section>

          <Section title="9. Cookies and local storage">
            <p>
              This website does not set any cookies for analytics, tracking or advertising purposes and
              does not embed any third-party content that would require consent. Your browser&apos;s local
              storage (entry “cookie-consent”) holds your choice in the cookie notice, together with the
              time, the version of the notice and a randomly generated ID, so that the notice does not
              appear again on every visit. This storage is strictly necessary (§ 25(2) no. 2 TDDDG). After
              12 months the notice is shown again.
            </p>
            <p>
              On your first visit to the homepage, a short welcome animation is shown. So that it does
              not play again on every page view, we store the entry “mb-intro-seen” with the value “1” in
              local storage. It contains no information about you, is not transmitted to us or third
              parties and serves solely to display the website as you request it (§ 25(2) no. 2 TDDDG).
              You can delete it at any time in your browser settings; the animation will then be shown
              again.
            </p>
            <p>
              If you switch the website to English, we store the entry “mb-lang” with the value “en” in
              local storage so that your chosen language is kept the next time you visit. The entry is
              only created when you choose English and is removed again when you switch back to German.
              It contains no information about you, is not transmitted to us or third parties and serves
              solely to display the website in the way you have requested (§ 25(2) no. 2 TDDDG).
            </p>
            <p>
              As proof of your choice, we additionally store an anonymous record in our Firebase database
              (section 10): the random ID, the version of the notice and the time. We do not store your IP
              address, browser data or any other information about you; when the record is saved, your IP
              address is transmitted to Google for technical reasons. The record is deleted automatically
              after three years. The legal basis is our obligation to provide proof (Art. 5(2),
              Art. 7(1) in conjunction with Art. 6(1)(c) and (f) GDPR).
            </p>
            <p>
              You can open the notice again at any time via “Cookie settings” at the bottom of the page;
              there you can also see the time and ID of your saved choice. You can delete the entry in
              your browser via your browser settings.
            </p>
          </Section>

          <Section title="10. Firebase (Google Cloud)">
            <p>
              For the menu, reviews, booking enquiries and the records of cookie settings, we use the
              Firebase Cloud Firestore database of Google Ireland Limited, Gordon House, Barrow Street,
              Dublin 4, Ireland. When you open the homepage, your browser loads the menu and the published
              reviews directly from Google&apos;s servers; in the process, your IP address is transmitted to
              Google. The legal basis is our legitimate interest in displaying up-to-date content
              (Art. 6(1)(f) GDPR) or, for enquiries and reviews, the bases stated in sections 5 and 7.
            </p>
            <p>
              We have concluded a data processing agreement with Google. A transfer to Google LLC in the
              USA is possible; Google is certified under the EU-US Data Privacy Framework.
            </p>
          </Section>

          <Section title="11. Fonts and external links">
            <p>
              The fonts used are delivered from our own server; no connection to Google Fonts is made when
              a page is loaded.
            </p>
            <p>
              We link to our profile on Instagram (Meta Platforms Ireland Ltd.) and to Google Maps. These
              are simple links: data is only transferred when you click a link and leave our website. The
              privacy policy of the respective provider then applies.
            </p>
          </Section>

          <Section title="12. Your rights">
            <p>
              You have the right to access, rectification, erasure, restriction of processing, data
              portability and objection (Art. 15–21 GDPR). To exercise these rights, simply send an email
              to <a href="mailto:ramonakrines@gmail.com" className={linkClass}>ramonakrines@gmail.com</a> or
              use the “Delete data” link on the homepage.
            </p>
            <p>
              <strong>Withdrawal of consent:</strong> You can withdraw any consent you have given at any
              time with effect for the future (Art. 7(3) GDPR), e.g. by email. The lawfulness of the
              processing carried out until then remains unaffected.
            </p>
            <p>
              <strong>Right to object:</strong> Where we process data on the basis of legitimate interests
              (Art. 6(1)(f) GDPR), you may object at any time on grounds relating to your particular
              situation (Art. 21 GDPR).
            </p>
            <p>
              <strong>Right to lodge a complaint:</strong> You can lodge a complaint with a data protection
              supervisory authority, e.g. the Bavarian Data Protection Authority (Bayerisches Landesamt
              für Datenschutzaufsicht), Promenade 18, 91522 Ansbach, Germany.
            </p>
            <p>
              Providing your data in the forms is voluntary; without it, however, we cannot process your
              enquiry or publish your review. No automated decision-making, including profiling, takes
              place.
            </p>
          </Section>

          <Section title="13. Storage period">
            <p>
              We only store personal data for as long as is necessary for the respective purpose or as
              required by statutory retention obligations (e.g. up to 10 years for tax-relevant documents
              relating to concluded orders). We delete booking enquiries and reviews once they have been
              handled or at your request. Anonymous records of cookie settings are deleted automatically
              after three years.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
