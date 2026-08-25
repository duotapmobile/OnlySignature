export interface FaqItem {
  question: string;
  answer: string;
}

export const purchaseFaq: readonly FaqItem[] = [
  {
    question: "What does $1.99 buy?",
    answer:
      "The planned U.S. price buys transparent export for one saved signature set: one signature slot and one initials slot. Apple shows the final localized price before purchase.",
  },
  {
    question: "Is this a subscription?",
    answer: "No. It is one purchase for one signature-and-initials set.",
  },
  {
    question: "Can I export the same set again?",
    answer:
      "Yes. Re-export a purchased set in any supported format without paying again while the set remains saved in the app.",
  },
  {
    question: "Does one purchase include initials?",
    answer: "Yes. One signature slot and one initials slot are included.",
  },
  {
    question: "What if I add initials later?",
    answer:
      "If the initials slot was unused when you purchased, fill it later without another payment.",
  },
  {
    question: "What if I change my signature?",
    answer:
      "The original purchased set stays saved. A changed drawing becomes a new draft; transparent export of that new set requires a new purchase.",
  },
  {
    question: "Why does JPEG have a white background?",
    answer:
      "JPEG does not support transparency. Choose PNG, Transparent when you need no white box.",
  },
  {
    question: "Where is my signature stored?",
    answer:
      "Reusable drawings are stored inside Only Signature on this device. Files you export are stored wherever you choose.",
  },
  {
    question: "Does Only Signature upload my document?",
    answer: "No. The app never asks for or uploads a document.",
  },
  {
    question: "Does Only Signature upload my signature?",
    answer:
      "The app does not automatically upload signature content. A destination you choose through Apple’s share tools may store or send the exported file.",
  },
  {
    question: "What happens if I delete the app?",
    answer:
      "Deleting the app may delete sets stored inside it. Exported files remain where you saved them. A consumed purchase cannot reconstruct deleted artwork.",
  },
  {
    question: "How do Apple refunds work?",
    answer:
      "Apple processes purchases and refund requests under Apple’s policies. Only Signature does not receive enough information to rebuild deleted artwork from a refund or purchase record.",
  },
  {
    question: "Can I use another person’s signature?",
    answer:
      "Only if you are authorized to do so. Forgery, impersonation, fraud, and unauthorized use are prohibited.",
  },
  {
    question: "Is this a certified digital signature?",
    answer:
      "No. Only Signature creates an image asset. It does not verify identity, issue a certificate, notarize, or create a cryptographic digital signature.",
  },
  {
    question: "Can every recipient accept an image signature?",
    answer:
      "No. A recipient or law may require another signing method. Only Signature does not guarantee acceptance or legal enforceability.",
  },
] as const;
