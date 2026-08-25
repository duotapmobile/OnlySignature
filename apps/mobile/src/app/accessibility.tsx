import { InfoPage, Section } from "@/components/InfoPage";
export default function AccessibilityScreen() {
  return (
    <InfoPage title="Accessibility">
      <Section title="Designed for clear use">
        Only Signature is designed for large text, labeled controls, large touch
        targets, reduced-motion navigation, portrait and landscape layouts, and
        iPad adaptation. Final support claims will be published only after
        physical-device testing.
      </Section>
      <Section title="Drawing canvas">
        The canvas announces whether it is empty and how many strokes it
        contains. Drawing still requires direct touch input; use the labeled
        Clear action to start over. Contact Support if this interaction does not
        meet your access needs.
      </Section>
      <Section title="Need help?">
        Open Support from Settings to email us. Accessibility support claims
        should be confirmed on physical devices before App Store submission.
      </Section>
    </InfoPage>
  );
}
