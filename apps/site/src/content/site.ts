export const PRODUCT_NAME = "Only Signature";
export const SUPPORT_EMAIL =
  import.meta.env.PUBLIC_SUPPORT_EMAIL || "admin@onlysignature.app";
export const APP_STORE_URL =
  import.meta.env.PUBLIC_APP_STORE_URL || "/download/";
export const IS_APP_STORE_PLACEHOLDER = !import.meta.env.PUBLIC_APP_STORE_URL;

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/faq/", label: "Purchase FAQ" },
  { href: "/support/", label: "Support" },
  { href: "/accessibility/", label: "Accessibility" },
];

export const purchaseFacts = {
  plannedUSPrice: "$1.99",
  scope: "one signature + initials set",
  freeExport: "PNG or JPEG with a white background",
} as const;

export const faqItems = [
  {
    question: "What does $1.99 buy?",
    answer:
      "The planned U.S. price buys transparent export for one Signature Set: one signature slot and one initials slot. The App Store shows Apple’s current localized price before purchase.",
  },
  {
    question: "Is this a subscription?",
    answer: "No. There is no weekly or monthly payment.",
  },
  {
    question: "Can I export the same set again?",
    answer:
      "Yes. Re-export, share, and change supported file formats for that purchased set without paying again.",
  },
  {
    question: "Does one purchase include initials?",
    answer:
      "Yes. One purchase includes one signature slot and one initials slot.",
  },
  {
    question: "What if I add initials later?",
    answer:
      "If the initials slot was unused when you purchased, you may fill that included slot later without another purchase.",
  },
  {
    question: "What if I change my signature?",
    answer:
      "A purchased drawing stays unchanged. Duplicating it or drawing different strokes creates a new draft. A later transparent export for that new set requires a new purchase.",
  },
  {
    question: "Why does JPEG have a white background?",
    answer:
      "JPEG does not support transparency. Only Signature always exports JPEG with a white background.",
  },
  {
    question: "Where is my signature stored?",
    answer:
      "Reusable sets are stored inside the app on your device. There is no Only Signature account or developer cloud storage.",
  },
  {
    question: "Does Only Signature upload my document?",
    answer:
      "No. The app does not ask for or upload your contract, PDF, form, invoice, or other private document.",
  },
  {
    question: "Does Only Signature upload my signature?",
    answer:
      "The app does not automatically upload signature or initials content to the developer. You decide where exported files go through Apple’s system share sheet, such as Files, AirDrop, or another destination offered on your device.",
  },
  {
    question: "What happens if I delete the app?",
    answer:
      "Deleting the app may delete reusable sets stored inside it. Files you already exported remain wherever you saved them. A consumed purchase cannot recreate deleted drawing strokes.",
  },
  {
    question: "How do Apple refunds work?",
    answer:
      "Apple processes purchases and refund requests. Visit reportaproblem.apple.com or use Apple Support. A refund does not reconstruct deleted local artwork.",
  },
  {
    question: "Can I use another person’s signature?",
    answer:
      "Only if you are authorized to use it. Forgery, impersonation, fraud, and unauthorized use are prohibited.",
  },
  {
    question: "Is this a certified digital signature?",
    answer:
      "No. Only Signature creates an image of handwriting. It does not verify identity, issue a certificate, notarize, or create a cryptographic signature or audit trail.",
  },
  {
    question: "Can every recipient accept an image signature?",
    answer:
      "No acceptance is guaranteed. The recipient, document type, and applicable rules determine whether an image signature is acceptable.",
  },
] as const;
