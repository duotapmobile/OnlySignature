import { InfoPage, Section } from "@/components/InfoPage";
import { sharedCopy } from "@/integrations/workspace";

const fallback = [
  [
    "What does $1.99 buy?",
    "The planned U.S. price buys transparent export for one signature + initials set. Apple shows the localized price before purchase.",
  ],
  ["Is this a subscription?", "No. There is no weekly or monthly payment."],
  [
    "Can I export the same set again?",
    "Yes. Re-export a purchased set anytime without paying again.",
  ],
  [
    "Does one purchase include initials?",
    "Yes. One signature slot and one initials slot are included.",
  ],
  [
    "What if I add initials later?",
    "The unused included slot remains available without another purchase.",
  ],
  [
    "What if I change my signature?",
    "Your original purchased set stays saved. A changed drawing becomes a new draft and needs its own purchase only for transparent export.",
  ],
  [
    "Why does JPEG have a white background?",
    "JPEG does not support transparency. Choose transparent PNG when you need no white box.",
  ],
  [
    "Where is my signature stored?",
    "Reusable sets are stored inside the app on this device.",
  ],
  [
    "Does Only Signature upload my document?",
    "No. The app never asks for your document.",
  ],
  [
    "Does Only Signature upload my signature?",
    "The app does not upload signature content. You choose where an exported file goes using Apple share and save tools.",
  ],
  [
    "What happens if I delete the app?",
    "Deleting the app may delete reusable sets inside it. Files you exported remain where you saved them. A consumed purchase cannot recreate deleted artwork.",
  ],
  [
    "How do Apple refunds work?",
    "Apple processes purchases and refund requests under its current policies.",
  ],
  [
    "Can I use another person’s signature?",
    "Only when you are authorized. Forgery, impersonation, and fraud are prohibited.",
  ],
  [
    "Is this a certified digital signature?",
    "No. It is an image of handwriting, not identity verification, notarization, a certificate, or an audit trail.",
  ],
  [
    "Can every recipient accept an image signature?",
    "No. Ask the recipient what form of signature they accept.",
  ],
] as const;

function normalizedFaq(): readonly (readonly [string, string])[] {
  const candidate = sharedCopy.purchaseFaq as unknown;
  if (!Array.isArray(candidate)) return fallback;
  const rows = candidate.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const question = record.question;
    const answer = record.answer;
    return typeof question === "string" && typeof answer === "string"
      ? [[question, answer] as const]
      : [];
  });
  return rows.length ? rows : fallback;
}

export default function FaqScreen() {
  return (
    <InfoPage title="Purchase FAQ">
      {normalizedFaq().map(([question, answer]) => (
        <Section key={question} title={question}>
          {answer}
        </Section>
      ))}
    </InfoPage>
  );
}
