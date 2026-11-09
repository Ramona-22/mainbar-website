import { ByLang } from "../context/LanguageContext";
import DatenschutzDe from "./DatenschutzDe";
import DatenschutzEn from "./DatenschutzEn";

export const metadata = {
  title: "Datenschutzerklärung | MainBar",
  alternates: { canonical: "/datenschutz" },
};

// German is the binding version; English is shown when the visitor picks EN.
export default function DatenschutzPage() {
  return <ByLang de={<DatenschutzDe />} en={<DatenschutzEn />} />;
}
