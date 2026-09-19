import type { CmsContent, CheckoutCms } from "@/types";

export const defaultCmsContent: CmsContent = {
  logoUrl: "",
  brandName: "nanami",
  brandSuffix: "kitchen",
  tagline: "Good food, made with love.",
  description:
    "Delicious bento boxes, crispy chicken, snacks, and refreshing handcrafted drinks made fresh for families and co-workers.",
  heroImage: "",
  heroTitleLine1: "Good Food.",
  heroTitleLine2: "Made with Love",
  heroSlogan: "Good Food. Made with Love",
  heroCtaText: "Order Now",
  heroActive: true,
  announcement: {
    enabled: true,
    text: "🎉 Special Promo: Get 20% OFF all menu items with voucher code NANAMI20!",
    type: "promo",
    link: "/vouchers",
  },
  welcomeScreen: {
    enabled: true,
    durationSec: 2.6,
    title: "nanami",
    subtitle: "kitchen",
    slogan: "Good Food.\nMade with Love",
    imageUrl: "",
  },
  socials: {
    instagram: "@nanami.kitchen",
    tiktok: "@nanami.kitchen",
    whatsapp: "27812345678",
    mapsUrl: "https://maps.google.com/?q=Nanami+Kitchen",
    active: true,
  },
  aboutStory:
    "Nanami Kitchen serves authentic Japanese bento boxes, fiery crispy smashed chicken, and refreshing handcrafted beverages prepared fresh daily using high-quality ingredients.",
  faqs: [
    {
      id: "faq-1",
      question: "What is the estimated preparation and delivery time?",
      answer:
        "Orders are freshly cooked in 15–20 minutes. Delivery time depends on your distance (approx. 15–30 minutes).",
      active: true,
    },
    {
      id: "faq-2",
      question: "Does Nanami Kitchen offer a Pick-up (Takeaway) option?",
      answer: "Yes, you can choose Pick-up at checkout with zero delivery fee.",
      active: true,
    },
    {
      id: "faq-3",
      question: "How do I redeem a discount voucher?",
      answer: "Go to Vouchers, tap 'Apply' on your voucher or enter the code during Checkout.",
      active: true,
    },
    {
      id: "faq-4",
      question: "Which payment methods are accepted?",
      answer:
        "We accept Bank Transfer (EFT), E-Wallets / Capitec Pay, and Cash on Delivery / Pickup.",
      active: true,
    },
  ],
  mustTryItemIds: ["m1", "m2", "m3", "m4"],
  categoryOrder: ["Meals", "Snacks", "Drinks", "Combos", "Others"],
  categoryNames: {
    Meals: "Meals",
    Snacks: "Snacks",
    Drinks: "Drinks",
    Combos: "Combos",
    Others: "Others",
  },
  checkout: {
    detailsTitle: "Your Details",
    fullNameLabel: "Full Name",
    defaultFullName: "Nanami Owner",
    phoneLabel: "WhatsApp Number",
    defaultPhone: "0834567890",
    ewalletEnabled: true,
    ewalletLabel: "eWallet / Pay2Cell",
    ewalletSub: "(Scan QR or Mobile Transfer)",
    bankEnabled: true,
    bankLabel: "Bank Transfer / Instant EFT",
    bankSub: "(ATM/MBANK/IBANK)",
    codEnabled: true,
    codLabel: "Cash on Delivery",
    codSub: "(For Pickup & Delivery)",
    instructionsTitle: "Payment Instructions",
    step1Text: "1. Transfer to the following account:",
    ewalletTitle: "E-Wallet",
    ewalletAccountName: "Nanami Kitchen",
    ewalletNumber: "0812345678 (Capitec Pay / SnapScan)",
    copyButtonText: "Copy",
    bankTitle: "EFT",
    bankName: "First National Bank (FNB)",
    bankAccountName: "Nanami Kitchen CC",
    bankAccountNumber: "62123456789",
    codInstructions:
      "Pay in cash when your order arrives or when you pick it up. Please prepare the exact amount if possible.",
    step2Text: "2. Upload proof of payment (Screenshot) in the WhatsApp chat after ordering.",
  },
};

export const defaultCheckoutCms: CheckoutCms = defaultCmsContent.checkout;
