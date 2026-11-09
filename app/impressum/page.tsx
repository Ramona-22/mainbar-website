import { ByLang } from "../context/LanguageContext";
import ImpressumDe from "./ImpressumDe";
import ImpressumEn from "./ImpressumEn";

export const metadata = {
  title: "Impressum | MainBar",
  alternates: { canonical: "/impressum" },
};

// German is the binding version; English is shown when the visitor picks EN.
export default function ImpressumPage() {
  return <ByLang de={<ImpressumDe />} en={<ImpressumEn />} />;
}
