import { InfoPage, Section } from "@/components/InfoPage";
export default function LicensesScreen() {
  return (
    <InfoPage title="Open-Source Licenses">
      <Section title="Expo and React Native">
        This app includes Expo, React, React Native, Expo Router, React Native
        SVG, React Native View Shot, and their transitive dependencies under
        their respective open-source licenses.
      </Section>
      <Section title="License notices">
        The release package includes the complete generated dependency license
        inventory. No signature content is sent to these open-source projects.
      </Section>
    </InfoPage>
  );
}
