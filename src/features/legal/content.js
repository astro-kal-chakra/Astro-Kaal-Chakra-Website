/**
 * Placeholder policy text. These MUST be replaced with lawyer-reviewed copy
 * before launch — Razorpay checks Privacy, Terms and Refund pages during approval.
 */
export const LEGAL_PAGES = {
  "privacy-policy": {
    title: "Privacy Policy",
    sections: [
      ["What we collect", "Your phone number, profile details, and birth details (date, time and place) that you choose to share, plus session and payment records."],
      ["Why we collect it", "To run consultations, generate Kundli and horoscope content, process payments, prevent fraud and improve the service."],
      ["Birth data", "Birth details are personal data under India's Digital Personal Data Protection Act, 2023. They are used only for your consultations and tools, and you can delete them anytime from Settings."],
      ["Sharing", "Astrologers see only your first name and the birth details you share for a session. Your phone number is never shown to astrologers."],
      ["Payments", "Payments are processed by Razorpay. We never see or store your full card, UPI PIN or bank login details."],
      ["Session review", "Chats and calls may be reviewed for safety and quality."],
      ["Your rights", "You can access, correct or delete your data, withdraw consent, and raise a grievance with our Grievance Officer."],
    ],
  },
  terms: {
    title: "Terms of Use",
    sections: [
      ["Eligibility", "You must be 18 or older to use paid consultations."],
      ["Account and devices", "You log in with your mobile number and a one-time password. An account can be signed in on one device at a time — signing in on a new device signs you out of the previous one."],
      [
        "Wallet and billing",
        "You pay the astrologer's own per-minute rate, shown before the session starts. Each minute is held from your wallet as it starts, and any unused part is returned to your wallet automatically when the session ends. To start a paid session you need at least ₹50 or 5 minutes of the rate, whichever is more. Billing is calculated on our servers.",
      ],
      ["Free first chat", "New users get one free chat of 3 minutes, once per account and device. It applies to chat only (not calls or video) and with astrologers who offer it. The chat ends when the free time is over."],
      ["Recharges", "Recharges are processed by Razorpay. Each recharge must be between ₹50 and ₹1,00,000, and 18% GST is added on top of the recharge amount. Bonus credit from packs, coupons or referrals is promotional, can be used only for consultations and may expire."],
      ["Conduct", "Sharing contact details, abusive language or soliciting off-platform payments is not allowed and may lead to suspension."],
      ["Guidance only", "Astrology consultations are for guidance and entertainment and are not a substitute for medical, legal or financial advice."],
    ],
  },
  "refund-policy": {
    title: "Refund & Cancellation Policy",
    sections: [
      ["Wallet recharges", "Recharges are credited to your wallet only after Razorpay confirms the payment. If money is debited but the recharge fails, it is reversed to your bank or card as per their timelines."],
      ["Unused session time", "Each minute of a session is held from your wallet in advance, and any unused part is returned to your wallet automatically when the session ends — you don't need to ask for it."],
      ["Session refunds", "If something went wrong with a session (for example, a technical problem on our side), raise a ticket from Help & Support within 7 days. Our support team reviews each request, and approved refunds are credited to your wallet."],
      ["Refund to your bank or card", "On request through Help & Support, unused recharge money can be refunded to the original payment method. Bonus credit and amounts already spent on sessions are not refundable this way."],
      ["Cancellation", "You are not charged for a request the astrologer does not accept, or for a request you cancel before the session starts."],
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    sections: [
      ["Not a guarantee", "Astrology provides guidance, not guarantees. Predictions and remedies should not replace professional advice."],
      ["Astrologers", "Astrologers are independent consultants. Views expressed in sessions are their own."],
    ],
  },
};
