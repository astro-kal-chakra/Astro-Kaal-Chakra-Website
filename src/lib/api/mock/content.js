/**
 * Mock CMS content for the trust pages (FAQs, astrologer testimonials).
 * Move to the CMS once it exists. Category labels live in content.json → content.faq.categories.<id>.
 */

export const FAQ_CATEGORIES = ["consultations", "payments", "refunds", "privacy", "account"];

export const MOCK_FAQS = {
  en: {
    consultations: [
      { q: "Is my first chat really free?", a: "Yes. Your first 3-minute chat is free — once per account and device, for chat only (not calls or video), with astrologers marked FREE. A countdown shows the free time left and the chat ends when it is over; nothing is taken from your wallet." },
      { q: "What is the difference between chat, call and video?", a: "Chat is text-based and great for quick questions. A voice call lets you talk, and video lets you see the astrologer face to face. Each astrologer sets their own per-minute rate for each, paid from your wallet." },
      { q: "How long does an astrologer take to accept?", a: "The astrologer has 30 seconds to accept your request. If they don't, you are not charged and can try again or pick someone available now." },
      { q: "What happens if the astrologer is busy?", a: "You can join the waitlist. When it is your turn you get a notification and have 60 seconds to accept or decline. You only pay once the session actually starts." },
      { q: "Can I end a session anytime?", a: "Yes. Tap End at any moment. Billing stops immediately and you pay only for the exact time used — any unused prepaid time goes back to your wallet automatically." },
    ],
    payments: [
      { q: "How do I add money to my wallet?", a: "Open Wallet, choose a recharge pack or enter any amount from ₹50 to ₹1,00,000, and pay securely via Razorpay with UPI, cards or net banking." },
      { q: "How am I charged during a session?", a: "You pay the astrologer's own per-minute rate, shown before you start. The amount is taken from your wallet during the session and any unused prepaid time is returned automatically when it ends." },
      { q: "How much balance do I need to start?", a: "At least ₹50 or 5 minutes of the astrologer's rate, whichever is more. The free first chat needs no balance." },
      { q: "Do recharge packs include bonus credit?", a: "Some packs include extra credit, shown clearly before you pay. Coupons can add more on top. Bonus credit can be used for consultations and may have an expiry date." },
      { q: "Will I get an invoice?", a: "Yes. An invoice is available for every recharge in your wallet transaction history." },
    ],
    refunds: [
      { q: "What if I'm not satisfied with a session?", a: "Raise a support ticket from Help & Support within 7 days. Our support team reviews every request, and approved refunds are credited to your wallet as per our Refund Policy." },
      { q: "What if a session disconnects?", a: "You only pay for the exact time the session ran, and unused prepaid time is returned to your wallet automatically. If a technical problem on our side affected the session, raise a ticket and our support team will review a wallet refund." },
      { q: "Can wallet money be refunded to my bank?", a: "Yes, on request. Contact Help & Support and unused recharge money can be refunded to the original payment method. Bonus credit and amounts already spent are not refundable this way." },
    ],
    privacy: [
      { q: "Is my conversation private?", a: "Yes. Phone numbers and contact details are never shared on either side. Sessions may be reviewed only for safety and quality." },
      { q: "How is my birth data used?", a: "Your birth details are stored securely and used only to provide consultations and reports, in line with India's DPDP Act." },
      { q: "How do I report inappropriate behaviour?", a: "Use the Report option during or after a session, or raise a support ticket. Our safety team reviews every report." },
    ],
    account: [
      { q: "How do I log in?", a: "Log in with your mobile number and a one-time password (OTP). No password is needed." },
      { q: "Can I use my account on two devices?", a: "Your account can be signed in on one device at a time. If you sign in on another phone or browser, you are signed out of the previous one." },
      { q: "Can I save multiple birth profiles?", a: "Yes. You can save profiles for family members and choose one before each consultation." },
      { q: "How do I delete my account?", a: "Go to Account → Settings → Delete account. Your data is removed as per our Privacy Policy." },
    ],
  },
  hi: {
    consultations: [
      { q: "क्या मेरी पहली चैट सच में मुफ़्त है?", a: "हाँ। आपकी पहली 3 मिनट की चैट मुफ़्त है — हर खाते और डिवाइस पर एक बार, केवल चैट के लिए (कॉल या वीडियो नहीं), FREE चिह्न वाले ज्योतिषियों के साथ। काउंटडाउन बचा हुआ मुफ़्त समय दिखाता है और समय पूरा होने पर चैट समाप्त हो जाती है; वॉलेट से कुछ नहीं कटता।" },
      { q: "चैट, कॉल और वीडियो में क्या अंतर है?", a: "चैट टेक्स्ट आधारित है और छोटे प्रश्नों के लिए बढ़िया है। वॉइस कॉल में आप बात करते हैं और वीडियो में ज्योतिषी को आमने-सामने देखते हैं। हर ज्योतिषी हर तरीके की प्रति मिनट दर तय करते हैं, और बिल वॉलेट से प्रति सेकंड के हिसाब से कटता है।" },
      { q: "ज्योतिषी कितनी देर में अनुरोध स्वीकार करते हैं?", a: "ज्योतिषी के पास अनुरोध स्वीकार करने के लिए 30 सेकंड होते हैं। अगर वे स्वीकार नहीं करते, तो कोई शुल्क नहीं लगता और आप दोबारा कोशिश कर सकते हैं या अभी उपलब्ध किसी और को चुन सकते हैं।" },
      { q: "अगर ज्योतिषी व्यस्त हों तो क्या होगा?", a: "आप वेटलिस्ट में जुड़ सकते हैं। आपकी बारी आने पर सूचना मिलती है और स्वीकार या अस्वीकार करने के लिए 60 सेकंड मिलते हैं। भुगतान सत्र शुरू होने पर ही होता है।" },
      { q: "क्या मैं कभी भी सत्र समाप्त कर सकता हूँ?", a: "हाँ। किसी भी समय समाप्त करें पर टैप करें। बिलिंग तुरंत रुक जाती है और आप केवल उपयोग किए गए सटीक समय का भुगतान करते हैं — बचा हुआ अग्रिम समय अपने आप वॉलेट में लौट आता है।" },
    ],
    payments: [
      { q: "वॉलेट में पैसे कैसे जोड़ें?", a: "वॉलेट खोलें, रिचार्ज पैक चुनें या ₹50 से ₹1,00,000 तक कोई भी राशि दर्ज करें, और Razorpay के ज़रिए UPI, कार्ड या नेट बैंकिंग से सुरक्षित भुगतान करें।" },
      { q: "सत्र के दौरान शुल्क कैसे लगता है?", a: "आप ज्योतिषी की अपनी प्रति मिनट दर चुकाते हैं, जो शुरू करने से पहले दिखती है। राशि सत्र के दौरान वॉलेट से कटती है और सत्र खत्म होने पर बचा हुआ प्रीपेड समय अपने आप लौट आता है।" },
      { q: "सत्र शुरू करने के लिए कितना बैलेंस चाहिए?", a: "कम से कम ₹50 या ज्योतिषी की दर के 5 मिनट, जो भी ज़्यादा हो। मुफ़्त पहली चैट के लिए बैलेंस नहीं चाहिए।" },
      { q: "क्या रिचार्ज पैक में बोनस मिलता है?", a: "कुछ पैक में अतिरिक्त राशि मिलती है, जो भुगतान से पहले साफ़ दिखाई जाती है। कूपन से और भी मिल सकता है। बोनस का उपयोग परामर्श में होता है और इसकी समय-सीमा हो सकती है।" },
      { q: "क्या मुझे इनवॉइस मिलेगा?", a: "हाँ। हर रिचार्ज का इनवॉइस वॉलेट के लेन-देन इतिहास में उपलब्ध है।" },
    ],
    refunds: [
      { q: "अगर मैं सत्र से संतुष्ट नहीं हूँ तो?", a: "7 दिनों के भीतर हेल्प और सपोर्ट से टिकट दर्ज करें। हमारी सपोर्ट टीम हर अनुरोध की समीक्षा करती है, और स्वीकृत रिफ़ंड रिफ़ंड नीति के अनुसार वॉलेट में जमा होते हैं।" },
      { q: "अगर सत्र बीच में कट जाए तो?", a: "आप केवल उतने समय का भुगतान करते हैं जितना सत्र चला, और बचा हुआ अग्रिम समय अपने आप वॉलेट में लौट आता है। अगर हमारी ओर की तकनीकी समस्या से सत्र प्रभावित हुआ, तो टिकट दर्ज करें — सपोर्ट टीम वॉलेट रिफ़ंड की समीक्षा करेगी।" },
      { q: "क्या वॉलेट की राशि बैंक में वापस मिल सकती है?", a: "हाँ, अनुरोध पर। हेल्प और सपोर्ट से संपर्क करें — बिना उपयोग की रिचार्ज राशि मूल भुगतान माध्यम में लौटाई जा सकती है। बोनस राशि और खर्च हो चुकी राशि इस तरह वापस नहीं होती।" },
    ],
    privacy: [
      { q: "क्या मेरी बातचीत निजी है?", a: "हाँ। फ़ोन नंबर और संपर्क जानकारी किसी भी ओर साझा नहीं की जाती। सत्रों की समीक्षा केवल सुरक्षा और गुणवत्ता के लिए हो सकती है।" },
      { q: "मेरे जन्म विवरण का उपयोग कैसे होता है?", a: "आपके जन्म विवरण सुरक्षित रखे जाते हैं और भारत के DPDP अधिनियम के अनुसार केवल परामर्श और रिपोर्ट के लिए उपयोग होते हैं।" },
      { q: "अनुचित व्यवहार की शिकायत कैसे करें?", a: "सत्र के दौरान या बाद में रिपोर्ट विकल्प का उपयोग करें, या सपोर्ट टिकट दर्ज करें। हमारी सुरक्षा टीम हर शिकायत की समीक्षा करती है।" },
    ],
    account: [
      { q: "मैं लॉगिन कैसे करूँ?", a: "अपने मोबाइल नंबर और वन-टाइम पासवर्ड (OTP) से लॉगिन करें। किसी पासवर्ड की ज़रूरत नहीं।" },
      { q: "क्या मैं दो डिवाइस पर खाता उपयोग कर सकता हूँ?", a: "आपका खाता एक समय में एक ही डिवाइस पर साइन इन रह सकता है। दूसरे फ़ोन या ब्राउज़र पर साइन इन करते ही पिछले डिवाइस से साइन आउट हो जाता है।" },
      { q: "क्या मैं कई जन्म प्रोफ़ाइल सेव कर सकता हूँ?", a: "हाँ। आप परिवार के सदस्यों की प्रोफ़ाइल सेव कर सकते हैं और हर परामर्श से पहले एक चुन सकते हैं।" },
      { q: "अपना खाता कैसे हटाएँ?", a: "खाता → सेटिंग्स → खाता हटाएँ पर जाएँ। आपका डेटा हमारी गोपनीयता नीति के अनुसार हटाया जाता है।" },
    ],
  },
};

/** Testimonials from astrologers already on the platform (become-astrologer page). */
export const MOCK_ASTROLOGER_TESTIMONIALS = {
  en: [
    { id: "t1", name: "Acharya Neha Joshi", since: 2023, text: "I set my own hours and consult from home. The platform handles payments and support, so I can focus on my clients.", rating: 5 },
    { id: "t2", name: "Guru Harish Iyer", since: 2022, text: "Payouts reach my bank on time, and the review system rewards genuine guidance rather than fear-selling.", rating: 5 },
    { id: "t3", name: "Tarot Meera", since: 2024, text: "The 6-day training with the support team made going live easy, and they helped me set up my profile. I now have regular clients across India.", rating: 4 },
  ],
  hi: [
    { id: "t1", name: "आचार्य नेहा जोशी", since: 2023, text: "मैं अपने समय पर घर से परामर्श देती हूँ। भुगतान और सपोर्ट प्लेटफ़ॉर्म संभालता है, इसलिए मैं अपने क्लाइंट्स पर ध्यान दे पाती हूँ।", rating: 5 },
    { id: "t2", name: "गुरु हरीश अय्यर", since: 2022, text: "भुगतान समय पर बैंक में आता है, और रिव्यू सिस्टम डर बेचने के बजाय सच्चे मार्गदर्शन को पुरस्कृत करता है।", rating: 5 },
    { id: "t3", name: "टैरो मीरा", since: 2024, text: "सपोर्ट टीम के साथ 6 दिन की ट्रेनिंग से लाइव होना आसान रहा, और टीम ने प्रोफ़ाइल बनाने में मदद की। अब पूरे भारत से मेरे नियमित क्लाइंट हैं।", rating: 4 },
  ],
};
