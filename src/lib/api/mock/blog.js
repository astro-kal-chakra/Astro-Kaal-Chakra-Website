/**
 * Mock blog posts used until the CMS is connected.
 * Shape mirrors what the CMS / backend /blog endpoints should return.
 * Long-form article bodies live here (en + hi), not in the i18n dictionaries.
 *
 * Body section shape: { id, h, p: string[], list?: string[], tip?: string }
 */

/** Category slugs — labels live in content.json → content.blog.categories.<slug>. */
export const BLOG_CATEGORIES = [
  "vedic-astrology",
  "planets",
  "remedies",
  "festivals",
  "love-relationships",
  "career",
  "numerology",
  "tarot",
];

/** Gradient + glyph per category, used for the illustrated cover placeholder. */
export const BLOG_COVERS = {
  "vedic-astrology": { from: "from-brand-600", to: "to-brand-900", glyph: "☉" },
  planets: { from: "from-brand-500", to: "to-brand-900", glyph: "♄" },
  remedies: { from: "from-emerald-600", to: "to-brand-900", glyph: "❁" },
  festivals: { from: "from-gold-500", to: "to-orange-700", glyph: "🪔" },
  "love-relationships": { from: "from-rose-500", to: "to-brand-800", glyph: "♀" },
  career: { from: "from-sky-600", to: "to-brand-900", glyph: "♃" },
  numerology: { from: "from-teal-500", to: "to-brand-900", glyph: "∞" },
  tarot: { from: "from-fuchsia-600", to: "to-brand-950", glyph: "✶" },
};

export const MOCK_POSTS = [
  {
    slug: "beginners-guide-to-vedic-astrology",
    category: "vedic-astrology",
    authorSlug: "acharya-vikram-shastri",
    specialty: "Vedic",
    publishedAt: "2026-09-28",
    updatedAt: "2026-09-30",
    readingMinutes: 7,
    featured: true,
    signs: ["aries", "leo", "sagittarius"],
    en: {
      title: "A Beginner's Guide to Vedic Astrology: Lagna, Rashi and Nakshatra",
      excerpt: "New to Jyotish? Learn the three building blocks of your birth chart and how astrologers use them to read your life path.",
      sections: [
        {
          id: "what-is-vedic-astrology",
          h: "What is Vedic astrology?",
          p: [
            "Vedic astrology, or Jyotish, is the traditional system of astrology from India. It uses the sidereal zodiac, which accounts for the slow shift of the constellations, so your Vedic sign is often one sign behind your Western sun sign.",
            "Rather than predicting a fixed fate, a good Vedic reading describes tendencies, timing and choices — helping you act with more clarity.",
          ],
        },
        {
          id: "lagna",
          h: "Lagna: your ascendant",
          p: [
            "The Lagna is the zodiac sign rising on the eastern horizon at the exact moment of your birth. It sets up the twelve houses of your chart and describes your body, temperament and overall approach to life.",
            "Because the ascendant changes roughly every two hours, an accurate birth time matters a lot.",
          ],
          tip: "Not sure of your birth time? Mention it to your astrologer — techniques like birth-time rectification can help.",
        },
        {
          id: "rashi",
          h: "Rashi: your moon sign",
          p: ["In Vedic astrology the Moon sign (Rashi) is central. It reflects your mind and emotions, and most daily horoscopes in India are read by Rashi."],
          list: ["The Moon changes sign roughly every 2.5 days.", "Your Rashi is used for Sade Sati and transit predictions.", "It is also the basis for Guna Milan in Kundli matching."],
        },
        {
          id: "nakshatra",
          h: "Nakshatra: the lunar mansion",
          p: [
            "The zodiac is further divided into 27 Nakshatras. The Nakshatra your Moon occupies at birth shapes your Vimshottari Dasha — the planetary periods that time major events in life.",
            "Together, Lagna, Rashi and Nakshatra give a surprisingly detailed first picture of who you are.",
          ],
        },
      ],
    },
    hi: {
      title: "वैदिक ज्योतिष की शुरुआती गाइड: लग्न, राशि और नक्षत्र",
      excerpt: "ज्योतिष में नए हैं? अपनी जन्म कुंडली के तीन मूल आधार जानें और समझें कि ज्योतिषी इनसे आपके जीवन पथ को कैसे पढ़ते हैं।",
      sections: [
        {
          id: "what-is-vedic-astrology",
          h: "वैदिक ज्योतिष क्या है?",
          p: [
            "वैदिक ज्योतिष भारत की पारंपरिक ज्योतिष पद्धति है। इसमें निरयन (साइडरियल) राशिचक्र का उपयोग होता है, जो नक्षत्रों के धीमे खिसकाव को ध्यान में रखता है, इसलिए आपकी वैदिक राशि अक्सर पश्चिमी सूर्य राशि से एक राशि पीछे होती है।",
            "एक अच्छी वैदिक रीडिंग तय भाग्य बताने के बजाय प्रवृत्तियों, समय और विकल्पों को समझाती है — ताकि आप अधिक स्पष्टता से निर्णय ले सकें।",
          ],
        },
        {
          id: "lagna",
          h: "लग्न: आपका उदय राशि",
          p: [
            "लग्न वह राशि है जो आपके जन्म के ठीक समय पूर्वी क्षितिज पर उदित हो रही थी। इससे कुंडली के बारह भाव तय होते हैं और यह आपके शरीर, स्वभाव और जीवन के प्रति दृष्टिकोण को दर्शाता है।",
            "लग्न लगभग हर दो घंटे में बदलता है, इसलिए सही जन्म समय बहुत महत्वपूर्ण है।",
          ],
          tip: "जन्म समय पक्का नहीं पता? अपने ज्योतिषी को बताएँ — जन्म समय शोधन जैसी तकनीकें मदद कर सकती हैं।",
        },
        {
          id: "rashi",
          h: "राशि: आपकी चंद्र राशि",
          p: ["वैदिक ज्योतिष में चंद्र राशि का विशेष महत्व है। यह आपके मन और भावनाओं को दर्शाती है, और भारत में अधिकांश दैनिक राशिफल राशि के आधार पर ही पढ़े जाते हैं।"],
          list: ["चंद्रमा लगभग हर ढाई दिन में राशि बदलता है।", "साढ़ेसाती और गोचर फल आपकी राशि से देखे जाते हैं।", "कुंडली मिलान में गुण मिलान का आधार भी यही है।"],
        },
        {
          id: "nakshatra",
          h: "नक्षत्र: चंद्र का निवास",
          p: [
            "राशिचक्र को 27 नक्षत्रों में बाँटा गया है। जन्म के समय चंद्रमा जिस नक्षत्र में होता है, उससे आपकी विंशोत्तरी दशा तय होती है — ग्रहों की वे अवधियाँ जो जीवन की बड़ी घटनाओं का समय बताती हैं।",
            "लग्न, राशि और नक्षत्र मिलकर आपके व्यक्तित्व की आश्चर्यजनक रूप से विस्तृत पहली तस्वीर देते हैं।",
          ],
        },
      ],
    },
  },
  {
    slug: "saturn-sade-sati-explained",
    category: "planets",
    authorSlug: "pandit-rajesh-mishra",
    specialty: "Vedic",
    publishedAt: "2026-09-24",
    readingMinutes: 6,
    signs: ["capricorn", "aquarius", "pisces"],
    en: {
      title: "Sade Sati Explained: What Saturn's 7.5-Year Transit Really Means",
      excerpt: "Sade Sati has a scary reputation. Here is what actually happens during Saturn's transit over your Moon — and how to make the most of it.",
      sections: [
        {
          id: "what-is-sade-sati",
          h: "What is Sade Sati?",
          p: ["Sade Sati is the roughly seven-and-a-half-year period when Saturn transits the sign before your Moon sign, your Moon sign itself, and the sign after it — about 2.5 years in each."],
        },
        {
          id: "three-phases",
          h: "The three phases",
          p: ["Each phase tends to emphasise a different area of life:"],
          list: ["Rising phase: expenses, travel and changes in routine.", "Peak phase: emotional pressure, responsibility and maturity.", "Setting phase: consolidation, family matters and finances."],
        },
        {
          id: "not-all-bad",
          h: "Why it is not all bad",
          p: [
            "Saturn rewards discipline and honesty. Many people get married, build careers or buy property during Sade Sati. The outcome depends on Saturn's strength in your chart and your running Dasha.",
          ],
          tip: "Simple practices like serving elders, keeping commitments and regular routine are traditional ways to work with Saturn.",
        },
      ],
    },
    hi: {
      title: "साढ़ेसाती क्या है: शनि के 7.5 साल के गोचर का असली अर्थ",
      excerpt: "साढ़ेसाती को लेकर बहुत डर है। जानिए आपकी चंद्र राशि पर शनि के गोचर में वास्तव में क्या होता है — और इसका सर्वोत्तम उपयोग कैसे करें।",
      sections: [
        {
          id: "what-is-sade-sati",
          h: "साढ़ेसाती क्या है?",
          p: ["साढ़ेसाती लगभग साढ़े सात साल की वह अवधि है जब शनि आपकी चंद्र राशि से पिछली राशि, चंद्र राशि और अगली राशि से गुजरता है — हर राशि में लगभग ढाई साल।"],
        },
        {
          id: "three-phases",
          h: "तीन चरण",
          p: ["हर चरण जीवन के अलग क्षेत्र पर ज़ोर देता है:"],
          list: ["पहला चरण: खर्च, यात्रा और दिनचर्या में बदलाव।", "मध्य चरण: भावनात्मक दबाव, ज़िम्मेदारी और परिपक्वता।", "अंतिम चरण: स्थिरता, पारिवारिक मामले और आर्थिक स्थिति।"],
        },
        {
          id: "not-all-bad",
          h: "यह हमेशा बुरा क्यों नहीं है",
          p: ["शनि अनुशासन और ईमानदारी का फल देता है। कई लोग साढ़ेसाती में विवाह करते हैं, करियर बनाते हैं या संपत्ति खरीदते हैं। परिणाम आपकी कुंडली में शनि की स्थिति और चल रही दशा पर निर्भर करता है।"],
          tip: "बुज़ुर्गों की सेवा, वादे निभाना और नियमित दिनचर्या शनि के साथ सामंजस्य के पारंपरिक उपाय हैं।",
        },
      ],
    },
  },
  {
    slug: "simple-remedies-for-mangal-dosha",
    category: "remedies",
    authorSlug: "acharya-neha-joshi",
    specialty: "Vedic",
    publishedAt: "2026-09-20",
    readingMinutes: 5,
    signs: ["aries", "scorpio"],
    en: {
      title: "Mangal Dosha: Myths, Facts and Simple Remedies",
      excerpt: "Is Mangal Dosha really a barrier to marriage? We separate fact from fear and share gentle, practical remedies.",
      sections: [
        {
          id: "what-is-mangal-dosha",
          h: "What is Mangal Dosha?",
          p: ["Mangal Dosha is said to occur when Mars sits in the 1st, 4th, 7th, 8th or 12th house of a chart. Because these are five of twelve houses, a large share of people have it in some form."],
        },
        {
          id: "cancellation",
          h: "When the dosha is cancelled",
          p: ["Classical texts list many cancellations, so a careful reading is essential before drawing conclusions."],
          list: ["Mars in its own sign or exalted.", "Both partners having a similar Mars placement.", "Strong benefic aspects on Mars or the 7th house."],
        },
        {
          id: "remedies",
          h: "Gentle remedies",
          p: ["Remedies should never be fear-based or expensive. Common suggestions include reciting the Hanuman Chalisa, fasting on Tuesdays if health permits, and channelling Mars energy into sport or service."],
          tip: "Be cautious of anyone insisting on costly rituals. A verified astrologer will explain the reasoning behind every remedy.",
        },
      ],
    },
    hi: {
      title: "मांगलिक दोष: भ्रम, तथ्य और सरल उपाय",
      excerpt: "क्या मांगलिक दोष सच में विवाह में बाधा है? हम डर और तथ्य को अलग करते हैं और सरल, व्यावहारिक उपाय बताते हैं।",
      sections: [
        {
          id: "what-is-mangal-dosha",
          h: "मांगलिक दोष क्या है?",
          p: ["जब मंगल कुंडली के पहले, चौथे, सातवें, आठवें या बारहवें भाव में हो, तो मांगलिक दोष माना जाता है। बारह में से पाँच भाव होने के कारण बड़ी संख्या में लोगों की कुंडली में यह किसी रूप में होता है।"],
        },
        {
          id: "cancellation",
          h: "दोष कब निरस्त होता है",
          p: ["शास्त्रों में कई परिहार बताए गए हैं, इसलिए निष्कर्ष से पहले सावधानीपूर्वक विश्लेषण ज़रूरी है।"],
          list: ["मंगल का स्वराशि या उच्च राशि में होना।", "दोनों साथियों की कुंडली में मंगल की समान स्थिति।", "मंगल या सप्तम भाव पर शुभ ग्रहों की दृष्टि।"],
        },
        {
          id: "remedies",
          h: "सरल उपाय",
          p: ["उपाय कभी डर पर आधारित या महँगे नहीं होने चाहिए। आम सुझावों में हनुमान चालीसा का पाठ, स्वास्थ्य अनुमति दे तो मंगलवार का व्रत, और मंगल की ऊर्जा को खेल या सेवा में लगाना शामिल है।"],
          tip: "महँगे अनुष्ठानों पर ज़ोर देने वालों से सावधान रहें। सत्यापित ज्योतिषी हर उपाय का कारण समझाएँगे।",
        },
      ],
    },
  },
  {
    slug: "diwali-2026-lakshmi-puja-muhurat",
    category: "festivals",
    authorSlug: "pandit-suresh-tiwari",
    specialty: "Vedic",
    publishedAt: "2026-10-01",
    readingMinutes: 4,
    signs: ["taurus", "libra"],
    en: {
      title: "Diwali 2026: Lakshmi Puja Muhurat and Rituals",
      excerpt: "Plan your Diwali puja with the auspicious timings, a simple step-by-step ritual and the meaning behind each tradition.",
      sections: [
        {
          id: "date-and-muhurat",
          h: "Date and muhurat",
          p: ["Lakshmi Puja is performed on Amavasya during Pradosh Kaal, ideally within the Sthir Lagna (Vrishabha). Exact timings vary by city, so check your local Panchang."],
        },
        {
          id: "puja-steps",
          h: "Simple puja steps",
          p: ["A heartfelt puja matters more than an elaborate one. A simple sequence:"],
          list: ["Clean the home and decorate the entrance with rangoli.", "Place idols of Lakshmi and Ganesha on a clean red cloth.", "Light diyas, offer flowers, sweets and recite the Lakshmi mantra.", "End with aarti and share prasad with family."],
        },
        {
          id: "meaning",
          h: "The meaning behind the lights",
          p: ["Diwali celebrates the victory of light over darkness. Astrologically, the new moon is a time to set intentions for prosperity and let go of what no longer serves you."],
          tip: "Want a personalised muhurat for a new business or purchase? Ask an astrologer with your birth details.",
        },
      ],
    },
    hi: {
      title: "दिवाली 2026: लक्ष्मी पूजन मुहूर्त और विधि",
      excerpt: "शुभ मुहूर्त, सरल चरणबद्ध पूजन विधि और हर परंपरा के अर्थ के साथ अपनी दिवाली पूजा की योजना बनाएँ।",
      sections: [
        {
          id: "date-and-muhurat",
          h: "तिथि और मुहूर्त",
          p: ["लक्ष्मी पूजन अमावस्या को प्रदोष काल में, आदर्श रूप से स्थिर लग्न (वृषभ) में किया जाता है। सटीक समय शहर के अनुसार बदलता है, इसलिए अपना स्थानीय पंचांग देखें।"],
        },
        {
          id: "puja-steps",
          h: "सरल पूजन विधि",
          p: ["भव्य पूजा से अधिक महत्वपूर्ण सच्चे मन से की गई पूजा है। एक सरल क्रम:"],
          list: ["घर की सफ़ाई करें और प्रवेश द्वार पर रंगोली बनाएँ।", "साफ़ लाल कपड़े पर लक्ष्मी और गणेश की प्रतिमा रखें।", "दीप जलाएँ, फूल और मिठाई अर्पित करें और लक्ष्मी मंत्र का जाप करें।", "आरती करें और परिवार के साथ प्रसाद बाँटें।"],
        },
        {
          id: "meaning",
          h: "दीपों के पीछे का अर्थ",
          p: ["दिवाली अंधकार पर प्रकाश की विजय का उत्सव है। ज्योतिषीय रूप से अमावस्या समृद्धि के संकल्प लेने और अनावश्यक चीज़ों को छोड़ने का समय है।"],
          tip: "नए व्यवसाय या खरीदारी के लिए व्यक्तिगत मुहूर्त चाहिए? अपने जन्म विवरण के साथ ज्योतिषी से पूछें।",
        },
      ],
    },
  },
  {
    slug: "kundli-matching-guna-milan-guide",
    category: "love-relationships",
    authorSlug: "acharya-deepak-sharma",
    specialty: "Vedic",
    publishedAt: "2026-09-15",
    readingMinutes: 6,
    signs: ["libra", "cancer", "taurus"],
    en: {
      title: "Guna Milan Explained: How Kundli Matching Works",
      excerpt: "What do 36 gunas actually measure? A clear walkthrough of the Ashtakoota system and what a score really tells you.",
      sections: [
        {
          id: "ashtakoota",
          h: "The eight kootas",
          p: ["Guna Milan compares the Moon Nakshatras of two people across eight factors (kootas), worth a total of 36 points."],
          list: ["Varna, Vashya, Tara and Yoni — temperament and compatibility.", "Graha Maitri — mental friendship.", "Gana — nature and behaviour.", "Bhakoot and Nadi — emotional bond, health and progeny."],
        },
        {
          id: "what-score-means",
          h: "What the score means",
          p: ["Traditionally 18 or more points is considered acceptable. But a high score with major chart conflicts can be weaker than a moderate score with strong supportive placements."],
        },
        {
          id: "beyond-gunas",
          h: "Looking beyond the gunas",
          p: ["A complete match also studies the 7th house, Venus, Mangal Dosha and the Dashas both partners will run in the coming years."],
          tip: "Try our free Kundli Matching tool, then discuss the result with an astrologer for a full picture.",
        },
      ],
    },
    hi: {
      title: "गुण मिलान: कुंडली मिलान कैसे काम करता है",
      excerpt: "36 गुण वास्तव में क्या मापते हैं? अष्टकूट प्रणाली की सरल व्याख्या और स्कोर का असली मतलब।",
      sections: [
        {
          id: "ashtakoota",
          h: "आठ कूट",
          p: ["गुण मिलान में दो लोगों के चंद्र नक्षत्रों की आठ कारकों (कूटों) पर तुलना होती है, जिनके कुल 36 अंक होते हैं।"],
          list: ["वर्ण, वश्य, तारा और योनि — स्वभाव और अनुकूलता।", "ग्रह मैत्री — मानसिक मित्रता।", "गण — प्रकृति और व्यवहार।", "भकूट और नाड़ी — भावनात्मक संबंध, स्वास्थ्य और संतान।"],
        },
        {
          id: "what-score-means",
          h: "स्कोर का मतलब",
          p: ["परंपरागत रूप से 18 या अधिक अंक स्वीकार्य माने जाते हैं। लेकिन बड़े कुंडली दोषों के साथ ऊँचा स्कोर, मज़बूत सहायक योगों वाले मध्यम स्कोर से कमज़ोर हो सकता है।"],
        },
        {
          id: "beyond-gunas",
          h: "गुणों से आगे",
          p: ["पूर्ण मिलान में सप्तम भाव, शुक्र, मांगलिक दोष और आने वर्षों में दोनों की दशाओं का भी अध्ययन होता है।"],
          tip: "हमारा मुफ़्त कुंडली मिलान टूल आज़माएँ, फिर पूरी तस्वीर के लिए ज्योतिषी से चर्चा करें।",
        },
      ],
    },
  },
  {
    slug: "best-career-for-your-zodiac-sign",
    category: "career",
    authorSlug: "dr-ananya-rao",
    specialty: "Vedic",
    publishedAt: "2026-09-10",
    readingMinutes: 5,
    signs: ["virgo", "capricorn", "gemini"],
    en: {
      title: "Which Career Suits Your Zodiac Sign?",
      excerpt: "From the analytical earth signs to the expressive fire signs — how your chart points to work that feels meaningful.",
      sections: [
        {
          id: "tenth-house",
          h: "Start with the 10th house",
          p: ["In Vedic astrology, career is read primarily from the 10th house, its lord and the planets aspecting it. Your sign gives the flavour; the 10th house gives the direction."],
        },
        {
          id: "by-element",
          h: "Career themes by element",
          p: ["As a broad starting point:"],
          list: ["Fire (Aries, Leo, Sagittarius): leadership, entrepreneurship, teaching.", "Earth (Taurus, Virgo, Capricorn): finance, operations, healthcare.", "Air (Gemini, Libra, Aquarius): communication, law, technology.", "Water (Cancer, Scorpio, Pisces): care, research, the arts."],
        },
        {
          id: "timing",
          h: "Timing a career move",
          p: ["Job changes often line up with Dasha changes or major Jupiter and Saturn transits over the 10th house. An astrologer can help you pick a favourable window."],
        },
      ],
    },
    hi: {
      title: "आपकी राशि के लिए कौन-सा करियर सही है?",
      excerpt: "विश्लेषणात्मक पृथ्वी राशियों से लेकर अभिव्यक्तिशील अग्नि राशियों तक — आपकी कुंडली सार्थक काम की ओर कैसे इशारा करती है।",
      sections: [
        {
          id: "tenth-house",
          h: "दशम भाव से शुरुआत करें",
          p: ["वैदिक ज्योतिष में करियर मुख्य रूप से दशम भाव, उसके स्वामी और उस पर दृष्टि डालने वाले ग्रहों से देखा जाता है। राशि स्वभाव बताती है; दशम भाव दिशा।"],
        },
        {
          id: "by-element",
          h: "तत्व के अनुसार करियर",
          p: ["एक व्यापक शुरुआत के रूप में:"],
          list: ["अग्नि (मेष, सिंह, धनु): नेतृत्व, उद्यमिता, शिक्षण।", "पृथ्वी (वृषभ, कन्या, मकर): वित्त, संचालन, स्वास्थ्य सेवा।", "वायु (मिथुन, तुला, कुंभ): संचार, कानून, तकनीक।", "जल (कर्क, वृश्चिक, मीन): सेवा, शोध, कला।"],
        },
        {
          id: "timing",
          h: "करियर बदलाव का समय",
          p: ["नौकरी में बदलाव अक्सर दशा परिवर्तन या दशम भाव पर गुरु और शनि के बड़े गोचर के साथ होते हैं। ज्योतिषी अनुकूल समय चुनने में मदद कर सकते हैं।"],
        },
      ],
    },
  },
  {
    slug: "how-to-calculate-your-life-path-number",
    category: "numerology",
    authorSlug: "numerologist-kavya",
    specialty: "Numerology",
    publishedAt: "2026-09-05",
    readingMinutes: 4,
    signs: ["sagittarius", "aquarius"],
    en: {
      title: "How to Calculate Your Life Path Number",
      excerpt: "Your date of birth hides a single number that numerologists use to describe your core purpose. Here is how to find it.",
      sections: [
        {
          id: "calculate",
          h: "The calculation",
          p: ["Add every digit of your full date of birth and keep reducing until you reach a single digit. Master numbers 11, 22 and 33 are usually not reduced."],
          list: ["Example: 14-08-1995 → 1+4+0+8+1+9+9+5 = 37", "3 + 7 = 10 → 1 + 0 = 1", "Life Path Number: 1"],
        },
        {
          id: "meanings",
          h: "What each number suggests",
          p: ["1 is the leader, 2 the peacemaker, 3 the communicator, 4 the builder, 5 the explorer, 6 the nurturer, 7 the seeker, 8 the achiever and 9 the humanitarian."],
        },
        {
          id: "use-it",
          h: "Using it wisely",
          p: ["Treat your Life Path Number as a lens for self-reflection, not a limitation. Combined with your name number it gives a richer profile."],
          tip: "Try our free Numerology calculator to see your name and destiny numbers too.",
        },
      ],
    },
    hi: {
      title: "अपना मूलांक (लाइफ पाथ नंबर) कैसे निकालें",
      excerpt: "आपकी जन्मतिथि में एक ऐसा अंक छिपा है जिससे अंक ज्योतिषी आपके मूल उद्देश्य को समझते हैं। जानिए इसे कैसे निकालें।",
      sections: [
        {
          id: "calculate",
          h: "गणना",
          p: ["अपनी पूरी जन्मतिथि के सभी अंक जोड़ें और तब तक घटाते रहें जब तक एक अंक न बचे। मास्टर नंबर 11, 22 और 33 को आम तौर पर नहीं घटाया जाता।"],
          list: ["उदाहरण: 14-08-1995 → 1+4+0+8+1+9+9+5 = 37", "3 + 7 = 10 → 1 + 0 = 1", "लाइफ पाथ नंबर: 1"],
        },
        {
          id: "meanings",
          h: "हर अंक का संकेत",
          p: ["1 नेता, 2 शांतिदूत, 3 संवादक, 4 निर्माता, 5 खोजी, 6 पालनकर्ता, 7 साधक, 8 उपलब्धि प्राप्तकर्ता और 9 मानवतावादी है।"],
        },
        {
          id: "use-it",
          h: "समझदारी से उपयोग करें",
          p: ["अपने लाइफ पाथ नंबर को आत्मचिंतन का माध्यम मानें, सीमा नहीं। नामांक के साथ मिलकर यह और समृद्ध प्रोफ़ाइल देता है।"],
          tip: "अपना नामांक और भाग्यांक जानने के लिए हमारा मुफ़्त अंक ज्योतिष कैलकुलेटर आज़माएँ।",
        },
      ],
    },
  },
  {
    slug: "tarot-for-beginners-major-arcana",
    category: "tarot",
    authorSlug: "tarot-meera",
    specialty: "Tarot",
    publishedAt: "2026-08-29",
    readingMinutes: 5,
    signs: ["pisces", "cancer", "scorpio"],
    en: {
      title: "Tarot for Beginners: Understanding the Major Arcana",
      excerpt: "The 22 Major Arcana cards tell the story of a soul's journey. Learn what they mean and how a tarot reading works.",
      sections: [
        {
          id: "the-deck",
          h: "How a tarot deck is organised",
          p: ["A standard deck has 78 cards: 22 Major Arcana that represent big life themes, and 56 Minor Arcana across four suits that describe everyday situations."],
        },
        {
          id: "key-cards",
          h: "Key cards to know",
          list: ["The Fool — new beginnings and trust.", "The Lovers — choices and relationships.", "The Tower — sudden change that clears the way.", "The Star — hope and healing."],
          p: ["No card is purely good or bad; context and position matter."],
        },
        {
          id: "asking-questions",
          h: "Asking better questions",
          p: ["Open questions like \"What do I need to know about my career right now?\" give more useful readings than yes/no questions."],
        },
      ],
    },
    hi: {
      title: "शुरुआती लोगों के लिए टैरो: मेजर आर्काना को समझें",
      excerpt: "22 मेजर आर्काना कार्ड आत्मा की यात्रा की कहानी कहते हैं। जानिए इनका अर्थ और टैरो रीडिंग कैसे होती है।",
      sections: [
        {
          id: "the-deck",
          h: "टैरो डेक की संरचना",
          p: ["एक सामान्य डेक में 78 कार्ड होते हैं: जीवन के बड़े विषयों वाले 22 मेजर आर्काना, और चार सूट में बँटे 56 माइनर आर्काना जो रोज़मर्रा की स्थितियों को दर्शाते हैं।"],
        },
        {
          id: "key-cards",
          h: "मुख्य कार्ड",
          list: ["द फ़ूल — नई शुरुआत और विश्वास।", "द लवर्स — चुनाव और रिश्ते।", "द टावर — अचानक बदलाव जो नया रास्ता खोलता है।", "द स्टार — आशा और उपचार।"],
          p: ["कोई कार्ड पूरी तरह अच्छा या बुरा नहीं होता; संदर्भ और स्थिति मायने रखती है।"],
        },
        {
          id: "asking-questions",
          h: "बेहतर प्रश्न पूछें",
          p: ["\"अभी मेरे करियर के बारे में मुझे क्या जानना चाहिए?\" जैसे खुले प्रश्न हाँ/ना वाले प्रश्नों से अधिक उपयोगी रीडिंग देते हैं।"],
        },
      ],
    },
  },
  {
    slug: "mercury-retrograde-survival-guide",
    category: "planets",
    authorSlug: "guru-harish-iyer",
    specialty: "KP",
    publishedAt: "2026-08-22",
    readingMinutes: 4,
    signs: ["gemini", "virgo"],
    en: {
      title: "Mercury Retrograde: A Calm Survival Guide",
      excerpt: "Miscommunication, delays and tech glitches? Here is what Mercury retrograde really affects and how to plan around it.",
      sections: [
        {
          id: "what-happens",
          h: "What actually happens",
          p: ["About three times a year Mercury appears to move backwards from Earth's point of view. Astrologically it is a time to review, revise and reconnect rather than launch."],
        },
        {
          id: "dos-and-donts",
          h: "Do's and don'ts",
          list: ["Do back up data and double-check documents.", "Do revisit unfinished projects.", "Avoid signing major contracts without careful review.", "Avoid impulsive gadget purchases."],
          p: ["None of this means life stops — just slow down a little."],
        },
        {
          id: "signs-most-affected",
          h: "Signs most affected",
          p: ["Gemini and Virgo, ruled by Mercury, often feel retrogrades most strongly. Check your weekly horoscope for specifics."],
        },
      ],
    },
    hi: {
      title: "बुध वक्री: शांत रहने की गाइड",
      excerpt: "गलतफ़हमियाँ, देरी और तकनीकी गड़बड़ियाँ? जानिए बुध वक्री वास्तव में किन चीज़ों को प्रभावित करता है और कैसे योजना बनाएँ।",
      sections: [
        {
          id: "what-happens",
          h: "वास्तव में क्या होता है",
          p: ["साल में लगभग तीन बार पृथ्वी से देखने पर बुध पीछे चलता प्रतीत होता है। ज्योतिषीय रूप से यह नई शुरुआत के बजाय समीक्षा, सुधार और पुनः जुड़ने का समय है।"],
        },
        {
          id: "dos-and-donts",
          h: "क्या करें, क्या न करें",
          list: ["डेटा का बैकअप लें और दस्तावेज़ दोबारा जाँचें।", "अधूरे प्रोजेक्ट फिर से देखें।", "बिना ध्यान से पढ़े बड़े अनुबंध पर हस्ताक्षर न करें।", "जल्दबाज़ी में गैजेट न खरीदें।"],
          p: ["इसका मतलब यह नहीं कि जीवन रुक जाता है — बस थोड़ा धीमे चलें।"],
        },
        {
          id: "signs-most-affected",
          h: "सबसे प्रभावित राशियाँ",
          p: ["बुध की राशियाँ मिथुन और कन्या अक्सर वक्री का प्रभाव सबसे अधिक महसूस करती हैं। विवरण के लिए अपना साप्ताहिक राशिफल देखें।"],
        },
      ],
    },
  },
  {
    slug: "gemstones-in-astrology-what-to-know",
    category: "remedies",
    authorSlug: "pandit-arjun-pathak",
    specialty: "Vedic",
    publishedAt: "2026-08-15",
    readingMinutes: 6,
    signs: ["leo", "sagittarius", "taurus"],
    en: {
      title: "Gemstones in Astrology: What to Know Before You Buy",
      excerpt: "Ruby, emerald, yellow sapphire — gemstones are powerful but not for everyone. Learn how astrologers recommend them responsibly.",
      sections: [
        {
          id: "how-they-work",
          h: "How gemstones are believed to work",
          p: ["Each gemstone is associated with a planet and is said to strengthen that planet's influence. That is why the wrong stone can amplify a difficult placement."],
        },
        {
          id: "planet-stones",
          h: "Planets and their stones",
          list: ["Sun — Ruby", "Moon — Pearl", "Mars — Red Coral", "Mercury — Emerald", "Jupiter — Yellow Sapphire", "Venus — Diamond", "Saturn — Blue Sapphire"],
          p: [],
        },
        {
          id: "buy-responsibly",
          h: "Buying responsibly",
          p: ["Always get a recommendation based on your full chart, ask for a lab certificate, and never feel pressured into an expensive purchase."],
          tip: "Our astrologers never sell gemstones during consultations — guidance stays independent.",
        },
      ],
    },
    hi: {
      title: "ज्योतिष में रत्न: खरीदने से पहले क्या जानें",
      excerpt: "माणिक, पन्ना, पुखराज — रत्न प्रभावशाली हैं पर सबके लिए नहीं। जानिए ज्योतिषी इन्हें ज़िम्मेदारी से कैसे सुझाते हैं।",
      sections: [
        {
          id: "how-they-work",
          h: "रत्न कैसे काम करते हैं",
          p: ["हर रत्न एक ग्रह से जुड़ा है और माना जाता है कि वह उस ग्रह के प्रभाव को बढ़ाता है। इसीलिए गलत रत्न कठिन ग्रह स्थिति को और बढ़ा सकता है।"],
        },
        {
          id: "planet-stones",
          h: "ग्रह और उनके रत्न",
          list: ["सूर्य — माणिक", "चंद्र — मोती", "मंगल — मूंगा", "बुध — पन्ना", "गुरु — पुखराज", "शुक्र — हीरा", "शनि — नीलम"],
          p: [],
        },
        {
          id: "buy-responsibly",
          h: "ज़िम्मेदारी से खरीदें",
          p: ["हमेशा पूरी कुंडली के आधार पर सलाह लें, लैब प्रमाणपत्र माँगें, और महँगी खरीदारी का दबाव कभी न मानें।"],
          tip: "हमारे ज्योतिषी परामर्श के दौरान कभी रत्न नहीं बेचते — मार्गदर्शन निष्पक्ष रहता है।",
        },
      ],
    },
  },
];
