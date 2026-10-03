/**
 * Mock CMS content for the trust pages (FAQs, astrologer testimonials).
 * Move to the CMS once it exists. Category labels live in content.json → content.faq.categories.<id>.
 */

export const FAQ_CATEGORIES = ["consultations", "payments", "refunds", "privacy", "account"];

export const MOCK_FAQS = {
  en: {
    consultations: [
      { q: "Is my first chat really free?", a: "Yes. Every new account gets one free chat consultation with eligible astrologers. A countdown shows how much free time is left." },
      { q: "What is the difference between chat and video consultations?", a: "Chat is text-based and great for quick questions. Video lets you see and speak to the astrologer face to face. Both are billed per minute from your wallet." },
      { q: "What happens if the astrologer is busy?", a: "You can join the waitlist. We notify you as soon as it is your turn, and you only pay once the session actually starts." },
      { q: "Can I end a session anytime?", a: "Yes. Tap End at any moment. Billing stops immediately and you only pay for the minutes used." },
    ],
    payments: [
      { q: "How do I add money to my wallet?", a: "Open Wallet, choose a recharge pack or enter an amount and pay securely via UPI, cards or net banking." },
      { q: "How am I charged during a session?", a: "You pay per minute at the astrologer's listed rate. Billing is calculated on our servers based on the actual session time." },
      { q: "Do recharge packs include bonus credit?", a: "Some packs include extra credit, shown clearly before you pay. Bonus credit can be used for any consultation." },
      { q: "Will I get an invoice?", a: "Yes. A GST invoice is available for every recharge in your wallet transaction history." },
    ],
    refunds: [
      { q: "What if I'm not satisfied with a session?", a: "Raise a support ticket from your account within 72 hours. Eligible cases are refunded to your wallet as per our Refund Policy." },
      { q: "What if a session disconnects due to a technical issue?", a: "Any minutes lost to a technical failure on our side are automatically credited back to your wallet." },
      { q: "Can wallet balance be refunded to my bank?", a: "Wallet balance is generally non-withdrawable, except where required by law. Please see the Refund Policy for details." },
    ],
    privacy: [
      { q: "Is my conversation private?", a: "Yes. Phone numbers and contact details are never shared on either side. Sessions may be reviewed only for safety and quality." },
      { q: "How is my birth data used?", a: "Your birth details are stored securely and used only to provide consultations and reports, in line with India's DPDP Act." },
      { q: "How do I report inappropriate behaviour?", a: "Use the Report option during or after a session, or raise a support ticket. Our safety team reviews every report." },
    ],
    account: [
      { q: "How do I log in?", a: "Log in with your mobile number and a one-time password (OTP). No password is needed." },
      { q: "Can I save multiple birth profiles?", a: "Yes. You can save profiles for family members and choose one before each consultation." },
      { q: "How do I delete my account?", a: "Go to Account → Settings → Delete account. Your data is removed as per our Privacy Policy." },
    ],
  },
  hi: {
    consultations: [
      { q: "क्या मेरी पहली चैट सच में मुफ़्त है?", a: "हाँ। हर नए खाते को योग्य ज्योतिषियों के साथ एक मुफ़्त चैट परामर्श मिलता है। काउंटडाउन बताता है कि कितना मुफ़्त समय बचा है।" },
      { q: "चैट और वीडियो परामर्श में क्या अंतर है?", a: "चैट टेक्स्ट आधारित है और छोटे प्रश्नों के लिए बढ़िया है। वीडियो में आप ज्योतिषी को देखकर आमने-सामने बात कर सकते हैं। दोनों का बिल वॉलेट से प्रति मिनट कटता है।" },
      { q: "अगर ज्योतिषी व्यस्त हों तो क्या होगा?", a: "आप वेटलिस्ट में जुड़ सकते हैं। आपकी बारी आते ही हम सूचित करते हैं, और भुगतान सत्र शुरू होने पर ही होता है।" },
      { q: "क्या मैं कभी भी सत्र समाप्त कर सकता हूँ?", a: "हाँ। किसी भी समय समाप्त करें पर टैप करें। बिलिंग तुरंत रुक जाती है और आप केवल उपयोग किए गए मिनटों का भुगतान करते हैं।" },
    ],
    payments: [
      { q: "वॉलेट में पैसे कैसे जोड़ें?", a: "वॉलेट खोलें, रिचार्ज पैक चुनें या राशि दर्ज करें और UPI, कार्ड या नेट बैंकिंग से सुरक्षित भुगतान करें।" },
      { q: "सत्र के दौरान शुल्क कैसे लगता है?", a: "आप ज्योतिषी की दर के अनुसार प्रति मिनट भुगतान करते हैं। बिलिंग हमारे सर्वर पर वास्तविक सत्र समय के आधार पर होती है।" },
      { q: "क्या रिचार्ज पैक में बोनस मिलता है?", a: "कुछ पैक में अतिरिक्त राशि मिलती है, जो भुगतान से पहले साफ़ दिखाई जाती है। बोनस का उपयोग किसी भी परामर्श में हो सकता है।" },
      { q: "क्या मुझे इनवॉइस मिलेगा?", a: "हाँ। हर रिचार्ज का GST इनवॉइस वॉलेट के लेन-देन इतिहास में उपलब्ध है।" },
    ],
    refunds: [
      { q: "अगर मैं सत्र से संतुष्ट नहीं हूँ तो?", a: "72 घंटे के भीतर अपने खाते से सपोर्ट टिकट दर्ज करें। योग्य मामलों में रिफ़ंड नीति के अनुसार वॉलेट में राशि लौटाई जाती है।" },
      { q: "तकनीकी समस्या से सत्र कट जाए तो?", a: "हमारी ओर की तकनीकी खराबी से गए मिनट अपने आप आपके वॉलेट में वापस जुड़ जाते हैं।" },
      { q: "क्या वॉलेट बैलेंस बैंक में वापस मिल सकता है?", a: "कानूनी रूप से आवश्यक स्थितियों को छोड़कर वॉलेट बैलेंस सामान्यतः निकाला नहीं जा सकता। विवरण के लिए रिफ़ंड नीति देखें।" },
    ],
    privacy: [
      { q: "क्या मेरी बातचीत निजी है?", a: "हाँ। फ़ोन नंबर और संपर्क जानकारी किसी भी ओर साझा नहीं की जाती। सत्रों की समीक्षा केवल सुरक्षा और गुणवत्ता के लिए हो सकती है।" },
      { q: "मेरे जन्म विवरण का उपयोग कैसे होता है?", a: "आपके जन्म विवरण सुरक्षित रखे जाते हैं और भारत के DPDP अधिनियम के अनुसार केवल परामर्श और रिपोर्ट के लिए उपयोग होते हैं।" },
      { q: "अनुचित व्यवहार की शिकायत कैसे करें?", a: "सत्र के दौरान या बाद में रिपोर्ट विकल्प का उपयोग करें, या सपोर्ट टिकट दर्ज करें। हमारी सुरक्षा टीम हर शिकायत की समीक्षा करती है।" },
    ],
    account: [
      { q: "मैं लॉगिन कैसे करूँ?", a: "अपने मोबाइल नंबर और वन-टाइम पासवर्ड (OTP) से लॉगिन करें। किसी पासवर्ड की ज़रूरत नहीं।" },
      { q: "क्या मैं कई जन्म प्रोफ़ाइल सेव कर सकता हूँ?", a: "हाँ। आप परिवार के सदस्यों की प्रोफ़ाइल सेव कर सकते हैं और हर परामर्श से पहले एक चुन सकते हैं।" },
      { q: "अपना खाता कैसे हटाएँ?", a: "खाता → सेटिंग्स → खाता हटाएँ पर जाएँ। आपका डेटा हमारी गोपनीयता नीति के अनुसार हटाया जाता है।" },
    ],
  },
};

/** Testimonials from astrologers already on the platform (become-astrologer page). */
export const MOCK_ASTROLOGER_TESTIMONIALS = {
  en: [
    { id: "t1", name: "Acharya Neha Joshi", since: 2023, text: "I set my own hours and consult from home. The platform handles payments and support, so I can focus on my clients.", rating: 5 },
    { id: "t2", name: "Guru Harish Iyer", since: 2022, text: "Weekly payouts are always on time, and the review system rewards genuine guidance rather than fear-selling.", rating: 5 },
    { id: "t3", name: "Tarot Meera", since: 2024, text: "Onboarding was smooth and the team helped me set up my profile. I now have regular clients across India.", rating: 4 },
  ],
  hi: [
    { id: "t1", name: "आचार्य नेहा जोशी", since: 2023, text: "मैं अपने समय पर घर से परामर्श देती हूँ। भुगतान और सपोर्ट प्लेटफ़ॉर्म संभालता है, इसलिए मैं अपने क्लाइंट्स पर ध्यान दे पाती हूँ।", rating: 5 },
    { id: "t2", name: "गुरु हरीश अय्यर", since: 2022, text: "साप्ताहिक भुगतान हमेशा समय पर आता है, और रिव्यू सिस्टम डर बेचने के बजाय सच्चे मार्गदर्शन को पुरस्कृत करता है।", rating: 5 },
    { id: "t3", name: "टैरो मीरा", since: 2024, text: "ऑनबोर्डिंग आसान थी और टीम ने प्रोफ़ाइल बनाने में मदद की। अब पूरे भारत से मेरे नियमित क्लाइंट हैं।", rating: 4 },
  ],
};
