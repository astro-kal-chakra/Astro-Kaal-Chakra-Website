/**
 * Text looked up at runtime by key (status names, planet names, catalogue copy,
 * form error codes…). All other UI text is written inline in the components.
 * Translation for visitors is handled by Google Translate (features/translate).
 */
export const LABELS = {
  "account": {
    "birthProfiles": {
      "relations": {
        "child": "Child",
        "friend": "Friend",
        "other": "Other",
        "parent": "Parent",
        "self": "Self",
        "sibling": "Sibling",
        "spouse": "Spouse / Partner"
      }
    },
    "dashboard": {
      "stats": {
        "following": "Following",
        "minutes": "Minutes consulted",
        "profiles": "Birth profiles",
        "sessions": "Sessions"
      }
    },
    "kundlis": {
      "type": {
        "kundli": "Kundli",
        "matching": "Kundli matching"
      }
    },
    "meta": {
      "account": "My Account",
      "birthProfiles": "Saved Birth Profiles",
      "following": "Followed Astrologers",
      "notificationSettings": "Notification Settings",
      "notifications": "Notifications",
      "profile": "My Profile",
      "referral": "Refer & Earn",
      "savedKundlis": "Saved Kundlis",
      "sessions": "Session History",
      "settings": "Settings",
      "support": "Help & Support",
      "supportTicket": "Support Ticket"
    },
    "nav": {
      "back": "My Account",
      "birthProfiles": "Saved birth profiles",
      "dashboard": "Overview",
      "following": "Followed astrologers",
      "label": "Account navigation",
      "notifications": "Notifications",
      "profile": "My profile",
      "referral": "Refer & earn",
      "reports": "My reports",
      "savedKundlis": "Saved kundlis",
      "sessions": "Session history",
      "settings": "Settings",
      "support": "Help & support",
      "wallet": "Wallet & transactions"
    },
    "navDesc": {
      "birthProfiles": "Family members for kundli & matching",
      "following": "Get alerts when they come online",
      "notifications": "Alerts, offers and reminders",
      "profile": "Name, birth details and email",
      "referral": "Invite friends, earn wallet credit",
      "reports": "Detailed reports you purchased",
      "savedKundlis": "Charts you generated",
      "sessions": "Past chats and calls, rebook",
      "settings": "Language, theme, privacy",
      "support": "Raise a ticket, track replies",
      "wallet": "Balance, recharge and invoices"
    },
    "notificationSettings": {
      "categories": {
        "follows": "Followed astrologers",
        "horoscope": "Daily horoscope",
        "offers": "Offers & promotions",
        "payments": "Payments & wallet",
        "sessions": "Sessions & queue"
      },
      "categoryDesc": {
        "follows": "When an astrologer you follow comes online or goes live",
        "horoscope": "Your daily prediction every morning",
        "offers": "Discounts and festive offers",
        "payments": "Recharge success, refunds and low balance",
        "sessions": "Your turn in queue, session start and summaries"
      },
      "channels": {
        "email": "Email",
        "push": "Web push",
        "sms": "SMS"
      },
      "pushStatus": {
        "default": "Not enabled yet",
        "denied": "Blocked in this browser",
        "granted": "Enabled in this browser",
        "unsupported": "Not supported in this browser"
      }
    },
    "notifications": {
      "types": {
        "daily_horoscope": "Horoscope",
        "follow_online": "Astrologer online",
        "offer": "Offers",
        "payment_success": "Payments",
        "queue_turn": "Queue"
      }
    },
    "profile": {
      "birth": "Birth details",
      "birthDataNotice": "Birth details are stored securely and used only for your consultations and tools, as per India's DPDP Act.",
      "contact": "Contact",
      "dob": "Date of birth",
      "edit": "Edit profile",
      "email": "Email",
      "emailHint": "For invoices and important updates only.",
      "emailPlaceholder": "you@example.com",
      "errors": {
        "name": "Enter at least 2 characters",
        "gender": "Select a gender",
        "dob": "Enter the date of birth",
        "tob": "Enter the time of birth or tick \"don't know\"",
        "place": "Select a place from the list",
        "email": "Enter a valid email address"
      },
      "female": "Female",
      "gender": "Gender",
      "male": "Male",
      "name": "Full name",
      "other": "Other",
      "personal": "Personal details",
      "phone": "Mobile number",
      "phoneHint": "Your number is used to log in and can't be changed here. It is never shown to astrologers.",
      "pob": "Place of birth",
      "pobPlaceholder": "Start typing a city",
      "saved": "Profile updated",
      "subtitle": "Keep your details up to date for accurate readings.",
      "timeUnknown": "Time unknown",
      "title": "My profile",
      "tob": "Time of birth",
      "unknownTime": "I don't know the birth time"
    },
    "push": {
      "text": "Turn on notifications to know when your astrologer is ready or someone you follow comes online.",
      "textAfterSession": "Get notified about your session summary, replies and when your astrologer is next online.",
      "textFollow": "Turn on notifications and we'll tell you the moment this astrologer comes online or goes live."
    },
    "referral": {
      "how1Text": "Send your code or link to friends and family.",
      "how1Title": "Share your code",
      "how2Text": "They log in with their phone and recharge for the first time.",
      "how2Title": "Friend signs up",
      "how3Text": "Bonus credit lands in both wallets after their first recharge of ₹100 or more.",
      "how3Title": "You both earn",
      "howTitle": "How it works",
      "rewardStatus": {
        "credited": "Credited",
        "pending": "Pending"
      },
      "terms": {
        "t1": "Rewards are credited as bonus wallet balance and can only be used for consultations. They can't be withdrawn or transferred, and expire 30 days after they are credited.",
        "t2": "The referred friend must be a new user signing up with a phone number that has never been registered.",
        "t3": "Referral reward is credited after the friend's first recharge of at least ₹100.",
        "t4": "Self-referrals, duplicate accounts or misuse will lead to rewards being cancelled.",
        "t5": "We may change or end the programme at any time. Rewards already earned will be honoured."
      }
    },
    "sessions": {
      "status": {
        "completed": "Completed",
        "missed": "Missed",
        "refunded": "Refunded"
      },
      "tabs": {
        "all": "All",
        "call": "Voice call",
        "chat": "Chat",
        "video": "Video call"
      },
      "type": {
        "call": "Voice call",
        "chat": "Chat",
        "video": "Video call"
      }
    },
    "settings": {
      "reasons": {
        "another_account": "I have another account",
        "bad_experience": "Bad experience with an astrologer",
        "not_useful": "Not useful for me",
        "other": "Other",
        "privacy": "Privacy concerns",
        "too_expensive": "Too expensive"
      }
    },
    "support": {
      "categories": {
        "account": "Account & profile",
        "other": "Something else",
        "payment": "Payment / recharge",
        "refund": "Refund request",
        "session": "Session issue",
        "technical": "Technical problem"
      },
      "status": {
        "closed": "Closed",
        "in_progress": "In progress",
        "open": "Open",
        "resolved": "Resolved"
      }
    }
  },
  "astrologers": {
    "becameBusy": "This astrologer is now busy. Join the waitlist to be next.",
    "wentOffline": "This astrologer just went offline. You can join the waitlist or pick someone similar."
  },
  "auth": {
    "attemptsLeft": "{count} attempts left",
    "birthDataNotice": "Your birth details are stored securely and used only for your consultations, as per India's DPDP Act.",
    "changeNumber": "Change",
    "dob": "Date of birth",
    "female": "Female",
    "gender": "Gender",
    "invalidOtp": "Incorrect OTP. Please try again.",
    "invalidPhone": "Enter a valid 10-digit mobile number",
    "loginRequired": "Please log in to continue",
    "loginRequiredText": "Browse freely — we only ask you to log in when you chat, call, recharge or save something.",
    "loginSubtitle": "We'll send a 6-digit OTP. No password needed.",
    "loginTitle": "Login with your phone",
    "male": "Male",
    "name": "Full name",
    "other": "Other",
    "otpSentTo": "Sent to +91 {phone}",
    "otpTitle": "Enter OTP",
    "phoneLabel": "Mobile number",
    "pob": "Place of birth",
    "pobPlaceholder": "Start typing a city",
    "profileSubtitle": "Birth details help astrologers give you accurate guidance.",
    "profileTitle": "Tell us about yourself",
    "rateLimited": "Too many requests. Please wait a moment and try again.",
    "resend": "Resend OTP",
    "resendIn": "Resend OTP in {seconds}s",
    "saveProfile": "Save & Continue",
    "sendOtp": "Send OTP",
    "terms": "By continuing you agree to our Terms and Privacy Policy.",
    "tob": "Time of birth",
    "tooManyAttempts": "Too many attempts. Please request a new OTP.",
    "unknownTime": "I don't know my birth time",
    "verify": "Verify & Continue"
  },
  "categories": {
    "career": "Career",
    "finance": "Finance",
    "health": "Health",
    "love": "Love",
    "marriage": "Marriage"
  },
  "common": {
    "chat": "Chat",
    "joinWaitlist": "Join Waitlist",
    "videoCall": "Video Call"
  },
  "content": {
    "about": {
      "stats": {
        "astrologers": "Verified astrologers",
        "astrologersValue": "500+",
        "consultations": "Consultations completed",
        "consultationsValue": "20 lakh+",
        "languages": "Languages",
        "languagesValue": "8+",
        "rating": "Average rating",
        "ratingValue": "4.8/5"
      },
      "values": {
        "v1Text": "Astrologers are trained to give practical, balanced advice. Fear-based upselling is not allowed.",
        "v1Title": "Guidance, not fear",
        "v2Text": "Your contact details are never shared. Birth data is stored securely as per India's DPDP Act.",
        "v2Title": "Privacy first",
        "v3Text": "Every astrologer's per-minute rate is shown upfront, billing runs on our servers and unused prepaid time comes back to your wallet automatically.",
        "v3Title": "Transparent pricing",
        "v4Text": "Only users who completed a session can leave a rating, so reviews stay honest.",
        "v4Title": "Real reviews"
      },
      "verifySteps": {
        "s1Text": "Identity and qualification documents are checked by our onboarding team.",
        "s1Title": "Application & documents",
        "s2Text": "A written test covers chart reading, Dasha, transits and remedies.",
        "s2Title": "Knowledge test",
        "s3Text": "Senior astrologers run a mock consultation to assess accuracy and empathy.",
        "s3Title": "Live interview",
        "s4Text": "Ratings, reports and session reviews are monitored continuously.",
        "s4Title": "Ongoing quality checks"
      }
    },
    "become": {
      "benefits": {
        "b1Text": "Consult via chat, voice call or video from your phone or laptop.",
        "b1Title": "Work from anywhere",
        "b2Text": "Go online when it suits you. No minimum hours.",
        "b2Title": "Set your own hours",
        "b3Text": "The full amount of every session counts as your earnings. A platform charge (30% by default) and 1% TDS are deducted only when you request a payout to your bank.",
        "b3Title": "Keep the full session amount",
        "b4Text": "We bring the users; you focus on guidance.",
        "b4Title": "Steady flow of clients",
        "b5Text": "Only real clients can rate you — your reputation is protected.",
        "b5Title": "Fair, honest reviews",
        "b6Text": "Your phone number stays private, and our support team trains you for 6 days before you go live.",
        "b6Title": "Privacy & support"
      },
      "earningsRow1": "2 hours",
      "earningsRow1Value": "₹46,800",
      "earningsRow1Net": "₹32,400",
      "earningsRow2": "4 hours",
      "earningsRow2Value": "₹93,600",
      "earningsRow2Net": "₹64,900",
      "earningsRow3": "6 hours",
      "earningsRow3Value": "₹1,40,400",
      "earningsRow3Net": "₹97,300",
      "form": {
        "applicationId": "Application ID",
        "backHome": "Back to home",
        "bio": "Short bio",
        "bioPlaceholder": "Tell clients about your background, training and approach.",
        "certificate": "Astrology certificate (optional)",
        "chooseFile": "Choose file",
        "city": "City",
        "consent": "I confirm the information is accurate and agree to the Terms of Use and Privacy Policy.",
        "dayNames": {
          "mon": "Mon",
          "tue": "Tue",
          "wed": "Wed",
          "thu": "Thu",
          "fri": "Fri",
          "sat": "Sat",
          "sun": "Sun"
        },
        "days": "Available days",
        "email": "Email",
        "errors": {
          "fullName": "Please enter your full name",
          "email": "Enter a valid email address",
          "phone": "Enter a valid 10-digit mobile number",
          "city": "Please enter your city",
          "specialties": "Choose at least one specialty",
          "languages": "Choose at least one language",
          "experience": "Please select your experience",
          "modes": "Choose at least one mode",
          "days": "Choose at least one day",
          "slots": "Choose at least one time slot",
          "idProof": "Please upload a government ID",
          "consent": "Please accept to continue"
        },
        "experience": "Years of experience",
        "experienceOptions": {
          "2-5": "2–5 years",
          "5-10": "5–10 years",
          "10-20": "10–20 years",
          "20+": "20+ years"
        },
        "fileTooLarge": "File is larger than 5 MB",
        "fileType": "Only JPG, PNG or PDF files are allowed",
        "fullName": "Full name",
        "gender": "Gender",
        "genderFemale": "Female",
        "genderMale": "Male",
        "genderOther": "Other",
        "hoursPerDay": "Hours per day",
        "idProof": "Government ID (Aadhaar, PAN, Passport…)",
        "kycNote": "After approval you log in to the astrologer app with your mobile number (OTP) and complete KYC (ID and PAN) and your bank details — both are required before you can go live and receive payouts.",
        "languages": "Languages you can consult in",
        "modeCall": "Voice call",
        "modeChat": "Chat",
        "modeVideo": "Video call",
        "modes": "Consultation modes",
        "phone": "Mobile number",
        "phoneHint": "Used only by our onboarding team — never shown publicly.",
        "removeFile": "Remove",
        "replaceFile": "Replace",
        "selectPlaceholder": "Select",
        "slotNames": {
          "morning": "Morning (6 AM – 12 PM)",
          "afternoon": "Afternoon (12 – 5 PM)",
          "evening": "Evening (5 – 10 PM)",
          "night": "Night (10 PM – 2 AM)"
        },
        "slots": "Preferred time slots",
        "specialties": "Specialties",
        "specialtiesHint": "Select all that apply.",
        "stepOf": "Step {current} of {total}",
        "steps": {
          "personal": "Personal details",
          "expertise": "Expertise",
          "availability": "Availability",
          "documents": "Documents",
          "review": "Review & submit"
        },
        "submit": "Submit application",
        "subtitle": "It takes about 5 minutes. Your details are kept confidential.",
        "successNext": "Keep this ID for reference. You'll receive updates by email.",
        "successText": "Thank you, {name}. Our onboarding team will review your application and contact you within 2–3 working days.",
        "successTitle": "Application submitted!",
        "title": "Application form",
        "uploadHint": "JPG, PNG or PDF, up to 5 MB"
      },
      "heroStat1": "Active users",
      "heroStat1Value": "10 lakh+",
      "heroStat2": "Of every session is yours",
      "heroStat2Value": "100%",
      "heroStat3": "Joining fee",
      "heroStat3Value": "₹0",
      "process": {
        "p1Text": "Fill in the form below in about 5 minutes.",
        "p1Title": "Apply online",
        "p2Text": "We verify your ID and certificates, then you complete KYC and bank details after logging in with your mobile number (OTP).",
        "p2Title": "Documents & KYC",
        "p3Text": "A short knowledge test and a mock consultation with our panel.",
        "p3Title": "Test & interview",
        "p4Text": "After approval, 6 days of training with our support team, then set your rates and go live. Our team may waive training for experienced astrologers.",
        "p4Title": "Training & go live"
      },
      "requirements": {
        "r1": "At least 2 years of practical astrology experience",
        "r2": "Expertise in at least one discipline (Vedic, KP, Tarot, Numerology, Vastu…)",
        "r3": "KYC documents (government ID, PAN) and a bank account in your name",
        "r4": "A smartphone with your own mobile number (login is by OTP) and a stable internet connection",
        "r5": "Commitment to ethical, non-fear-based guidance"
      }
    },
    "blog": {
      "categories": {
        "career": "Career",
        "festivals": "Festivals",
        "love-relationships": "Love & Relationships",
        "numerology": "Numerology",
        "planets": "Planets",
        "remedies": "Remedies",
        "tarot": "Tarot",
        "vedic-astrology": "Vedic Astrology"
      }
    },
    "contact": {
      "errors": {
        "contact": "Enter a valid email or 10-digit mobile number",
        "message": "Please write at least 20 characters",
        "name": "Please enter your name",
        "topic": "Please choose a topic"
      },
      "topics": {
        "account": "Account & login",
        "consultation": "Consultation issue",
        "feedback": "Feedback or suggestion",
        "other": "Something else",
        "partnership": "Partnership / media",
        "payment": "Payment or wallet",
        "refund": "Refund request",
        "technical": "Technical problem"
      }
    },
    "faq": {
      "categories": {
        "account": "Account",
        "consultations": "Consultations",
        "payments": "Payments & Wallet",
        "privacy": "Privacy & Safety",
        "refunds": "Refunds"
      }
    },
    "how": {
      "chat": {
        "nav": "Chat",
        "title": "Chat consultation",
        "intro": "Private, text-based consultations — perfect for focused questions.",
        "s1Title": "Pick an astrologer",
        "s1Text": "Filter by language, specialty, price and rating. Green means online now.",
        "s2Title": "Share your birth details",
        "s2Text": "Choose a saved birth profile so the astrologer can prepare your chart.",
        "s3Title": "Start chatting",
        "s3Text": "The astrologer accepts within seconds. A live timer shows your session time.",
        "s4Title": "End and review",
        "s4Text": "End anytime. Rate your session and find the transcript in My Sessions."
      },
      "ctaText": "Find an astrologer online right now.",
      "ctaTitle": "Ready to start?",
      "eyebrow": "How it works",
      "freeChat": {
        "nav": "Free first chat",
        "title": "Your free first chat",
        "intro": "New here? Your first chat is free.",
        "s1Title": "Log in with your phone",
        "s1Text": "Verify with a one-time OTP — no password needed.",
        "s2Title": "Look for the FREE tag",
        "s2Text": "Your first chat is free with astrologers marked FREE — chat only, once per account and device.",
        "s3Title": "Enjoy your free minutes",
        "s3Text": "A countdown shows how much free time is left, and the chat ends when it's over. No wallet balance needed."
      },
      "jumpTo": "Jump to",
      "metaDescription": "Step-by-step guide to consulting an astrologer: choose an expert, recharge your wallet, start a chat or video call, use your free first chat or join the waitlist.",
      "metaTitle": "How It Works – Chat, Video Call, Wallet & Free First Chat",
      "stepLabel": "Step {n}",
      "subtitle": "Everything you need to know about chatting, video calls, your wallet, the free first chat and the waitlist.",
      "title": "Your consultation, step by step",
      "video": {
        "nav": "Video call",
        "title": "Video consultation",
        "intro": "Face-to-face guidance from anywhere, right in your browser.",
        "s1Title": "Check your device",
        "s1Text": "We test your camera, microphone and connection before the call starts.",
        "s2Title": "Request the call",
        "s2Text": "Tap Video Call on an astrologer's profile. You'll see the per-minute rate first. The astrologer has 30 seconds to accept.",
        "s3Title": "Talk face to face",
        "s3Text": "Switch camera or mute anytime. Your number is never shared.",
        "s4Title": "Wrap up",
        "s4Text": "Billing stops the moment the session ends, and unused prepaid time goes back to your wallet."
      },
      "waitlist": {
        "nav": "Waitlist",
        "title": "Waitlist",
        "intro": "Your favourite astrologer is busy? Wait in line without staying on the page.",
        "s1Title": "Join the waitlist",
        "s1Text": "Tap Join Waitlist on a busy astrologer to see your position.",
        "s2Title": "Get notified",
        "s2Text": "We'll alert you the moment it's your turn.",
        "s3Title": "Start your session",
        "s3Text": "Accept or decline within 60 seconds. You only pay once the session starts."
      },
      "wallet": {
        "nav": "Wallet",
        "title": "Wallet & payments",
        "intro": "One secure wallet for every consultation.",
        "s1Title": "Recharge",
        "s1Text": "Choose a pack or any amount from ₹50 to ₹1,00,000. Pay securely via Razorpay with UPI, cards or net banking.",
        "s2Title": "Get bonus credit",
        "s2Text": "Many packs include extra credit, shown before you pay.",
        "s3Title": "Pay the astrologer's rate",
        "s3Text": "Each astrologer sets their own per-minute rate. Each minute is held as it starts and any unused part is returned automatically.",
        "s4Title": "Track everything",
        "s4Text": "Download invoices and see every transaction in your wallet history."
      }
    },
    "live": {
      "gifts": {
        "crown": "Crown",
        "diya": "Diya",
        "flower": "Flower",
        "moon": "Moon",
        "rocket": "Rocket",
        "star": "Star"
      }
    },
    "why": {
      "i1Text": "Interviewed, tested and identity-verified before they can consult.",
      "i1Title": "Verified experts",
      "i2Text": "No phone numbers or contact details shared — ever.",
      "i2Title": "100% private",
      "i3Text": "Pay the astrologer's per-minute rate. End anytime — unused time is returned.",
      "i3Title": "Pay only for time used",
      "i4Text": "Your first chat is free — try it before you recharge.",
      "i4Title": "First chat free",
      "i5Text": "Consult in Hindi, English and 6+ regional languages.",
      "i5Title": "Your language",
      "i6Text": "Support tickets answered quickly; refund requests are reviewed by our support team.",
      "i6Title": "Help when you need it"
    }
  },
  "home": {
    "heroCta": "Talk to an Astrologer"
  },
  "horoscope": {
    "career": "Career",
    "chooseSign": "Choose your sign",
    "ctaButton": "Talk to an astrologer about this",
    "ctaText": "Talk to an astrologer about this horoscope — your first chat is free.",
    "ctaTitle": "Want a personal reading?",
    "daily": "Daily",
    "health": "Health",
    "love": "Love",
    "luckyColor": "Lucky colour",
    "luckyNumber": "Lucky number",
    "money": "Money",
    "monthly": "Monthly",
    "otherSigns": "Other signs",
    "title": "Horoscope",
    "weekly": "Weekly",
    "yearly": "Yearly"
  },
  "meta": {
    "signDescription": "Read the {period} horoscope for {sign}: love, career, money and health predictions. Talk to an astrologer for a personal reading.",
    "signTitle": "{sign} {period} Horoscope – {date}"
  },
  "nav": {
    "astrologers": "Talk to Astrologer",
    "blog": "Blog",
    "horoscope": "Horoscope",
    "kundli": "Free Kundli",
    "kundliMatching": "Kundli Matching",
    "live": "Live Now",
    "panchang": "Panchang"
  },
  "session": {
    "call": {
      "help": {
        "android": {
          "name": "Chrome on Android",
          "step1": "Tap the icon on the left of the address bar, then Permissions.",
          "step2": "Turn on Camera and Microphone. If they are greyed out, allow them for Chrome in phone Settings → Apps → Chrome → Permissions.",
          "step3": "Return to this tab and tap “Try again”."
        },
        "chrome": {
          "name": "Google Chrome (computer)",
          "step1": "Click the camera / lock icon on the left of the address bar.",
          "step2": "Set Camera and Microphone to “Allow”.",
          "step3": "Reload the page if Chrome asks you to."
        },
        "edge": {
          "name": "Microsoft Edge",
          "step1": "Click the lock icon on the left of the address bar.",
          "step2": "Open “Permissions for this site” and set Camera and Microphone to “Allow”.",
          "step3": "Come back to this tab and tap “Try again”."
        },
        "firefox": {
          "name": "Mozilla Firefox",
          "step1": "Click the crossed-out camera / microphone icon in the address bar.",
          "step2": "Remove the “Blocked” permission for camera and microphone.",
          "step3": "Tap “Try again” and choose “Allow” when Firefox asks."
        },
        "iosSafari": {
          "name": "iPhone / iPad",
          "step1": "Tap the “aA” icon in the address bar, then Website Settings.",
          "step2": "Set Camera and Microphone to “Allow”. If it's missing, open iPhone Settings → Safari → Camera / Microphone.",
          "step3": "Return to this tab and tap “Try again”."
        },
        "safari": {
          "name": "Safari (Mac)",
          "step1": "In the menu bar, open Safari → Settings for This Website.",
          "step2": "Set Camera and Microphone to “Allow”.",
          "step3": "Come back to this tab and tap “Try again”."
        },
        "yourBrowser": "Your browser"
      },
      "problem": {
        "errorText": "We couldn't access your devices. Please try again.",
        "errorTitle": "Something went wrong",
        "inuseText": "Close other apps or tabs that may be using your camera or microphone (like Zoom or Meet), then try again.",
        "inuseTitle": "Device is being used by another app",
        "notfoundText": "Connect a microphone (and camera for video), or check that it is switched on, then try again.",
        "notfoundTitle": "No camera or microphone found",
        "unsupportedText": "Please open this page in the latest Chrome, Safari, Edge or Firefox, or use our app.",
        "unsupportedTitle": "This browser can't make calls"
      }
    },
    "chat": {
      "status": {
        "delivered": "Delivered",
        "failed": "Not sent",
        "read": "Read",
        "sending": "Sending",
        "sent": "Sent"
      },
      "system": {
        "free_ended": "Your free minutes are over · the chat has ended",
        "free_started": "Your free chat has started · {minutes} minutes free",
        "reconnected": "Reconnected",
        "session_started": "Session started · {rate}/min"
      }
    },
    "consult": {
      "start": {
        "chat": "Start chat",
        "call": "Start voice call",
        "video": "Start video call"
      }
    },
    "dev": {
      "adminEnds": "Admin ends session",
      "astrologerEnds": "Astrologer ends session",
      "drop": "Drop connection (5s)",
      "expireLogin": "Expire login",
      "lowBalance": "Low balance",
      "signInElsewhere": "Sign in on another device",
      "skipFree": "End free time",
      "title": "Mock simulator"
    },
    "ended": {
      "adminText": "This session was ended by our support team. If you think this was a mistake, please contact support.",
      "adminTitle": "Session ended by support",
      "astrologerText": "You pay only for the exact time used — any unused prepaid time is back in your wallet. We hope it helped!",
      "astrologerTitle": "{name} ended the session",
      "balanceText": "The session ended because your wallet couldn't cover the next minute. Recharge to continue with this astrologer.",
      "balanceTitle": "Your balance ran out",
      "free_overText": "Your free chat is over. Recharge to start a paid chat with this astrologer.",
      "free_overTitle": "Your free chat has ended",
      "otherText": "This session has finished.",
      "otherTitle": "Session ended",
      "rechargeCta": "Recharge wallet",
      "userText": "This session was ended from another device or tab.",
      "userTitle": "Session ended",
      "viewSummary": "View summary"
    },
    "errors": {
      "activeSession": "You already have a session in progress.",
      "astrologerBusy": "This astrologer just got busy. Join the waitlist or try someone similar.",
      "astrologerOffline": "This astrologer just went offline.",
      "insufficientBalance": "Your balance is too low to start this session."
    },
    "modes": {
      "call": "Voice call",
      "chat": "Chat",
      "video": "Video call"
    },
    "summary": {
      "ratingLabels": {
        "1": "1 star — Poor",
        "2": "2 stars — Fair",
        "3": "3 stars — Good",
        "4": "4 stars — Very good",
        "5": "5 stars — Excellent"
      },
      "reason": {
        "admin": "This session was ended by our support team.",
        "astrologer": "{name} ended the session.",
        "balance": "The session ended because your wallet balance ran out.",
        "free_over": "Your free chat ended when the free time was over."
      }
    },
    "waiting": {
      "cancel": "Cancel request",
      "changeMode": "Change chat / call type",
      "countdown": "{seconds}s left to respond",
      "notCharged": "You won't be charged until the session starts.",
      "rejectedText": "They may be with another client right now. Try again, or pick a similar astrologer below.",
      "rejectedTitle": "{name} couldn't take your request",
      "retry": "Try again",
      "text": "The astrologer has 30 seconds to accept. Please stay on this screen.",
      "timeoutText": "The astrologer didn't accept within 30 seconds, so you have not been charged. Try again or choose someone available now.",
      "timeoutTitle": "No response from {name}",
      "title": "Waiting for {name} to accept"
    }
  },
  "status": {
    "busy": "Busy",
    "offline": "Offline",
    "online": "Online"
  },
  "tools": {
    "common": {
      "mockNotice": "Demo calculation: these results are approximate and for preview only. Precise calculations will come from our servers.",
      "faqTitle": "Frequently asked questions",
      "otherTools": "More free astrology tools",
      "ctaTitle": "Want an expert to read this for you?",
      "ctaText": "Our verified astrologers can explain your chart, timing and remedies in a private chat. Your first chat is free.",
      "ctaButton": "Talk to an astrologer",
      "name": "Name",
      "namePlaceholder": "Full name",
      "gender": "Gender",
      "selectGender": "Select gender",
      "male": "Male",
      "female": "Female",
      "other": "Other",
      "dob": "Date of birth",
      "tob": "Time of birth",
      "pob": "Place of birth",
      "pobPlaceholder": "Start typing a city",
      "required": "This field is required",
      "placeRequired": "Please select a place from the list",
      "futureDate": "Date of birth can't be in the future",
      "edit": "Edit details",
      "yes": "Yes",
      "no": "No",
      "tryAgain": "Something went wrong. Please try again.",
      "breadcrumbTools": "Free tools"
    },
    "kundli": {
      "metaTitle": "Free Kundli Online – Janam Kundli with North & South Indian Charts",
      "metaDescription": "Generate your free Janam Kundli online. Get your ascendant, moon sign, nakshatra, North and South Indian birth charts, planetary positions and Vimshottari dasha.",
      "title": "Free Kundli Generator",
      "intro": "Your Kundli (Janam Kundli or birth chart) is a map of the sky at the exact moment you were born. Enter your birth details to see your ascendant, moon sign and nakshatra, your Lagna chart in North and South Indian styles, planetary positions and your Vimshottari dasha periods.",
      "formTitle": "Enter birth details",
      "submit": "Generate Kundli",
      "resultFor": "Kundli of {name}",
      "resultForAnon": "Your Kundli",
      "emptyText": "Fill in your birth details to see your charts, planets and dasha here.",
      "tabs": {
        "basic": "Basic details",
        "charts": "Charts",
        "planets": "Planets",
        "dasha": "Vimshottari Dasha"
      },
      "tabsLabel": "Kundli sections",
      "birthDetails": "Birth details",
      "astroDetails": "Astrological details",
      "ascendant": "Ascendant (Lagna)",
      "moonSign": "Moon sign (Rashi)",
      "sunSign": "Sun sign",
      "nakshatra": "Nakshatra",
      "nakshatraWithPada": "{nakshatra}, Pada {pada}",
      "nakshatraLord": "Nakshatra lord",
      "gana": "Gana",
      "nadi": "Nadi",
      "varna": "Varna",
      "tithi": "Birth tithi",
      "manglik": "Manglik",
      "manglikYes": "Yes (Mars in house {house})",
      "manglikNo": "No",
      "coordinates": "Coordinates",
      "lagnaChart": "Lagna (birth) chart",
      "northIndian": "North Indian",
      "southIndian": "South Indian",
      "chartAria": "{style} style Lagna chart showing planets in the twelve houses",
      "chartLegend": "Numbers show the sign in each house (1 = Aries … 12 = Pisces). R = retrograde.",
      "southLegend": "Signs are fixed in the South Indian chart. The diagonal line marks the ascendant.",
      "planet": "Planet",
      "sign": "Sign",
      "degree": "Degree",
      "house": "House",
      "status": "Motion",
      "retro": "Retrograde",
      "direct": "Direct",
      "pada": "Pada {pada}",
      "dashaIntro": "Vimshottari Dasha is a 120-year cycle of planetary periods that starts from the lord of your birth nakshatra. Tap a Mahadasha to see its Antardashas.",
      "mahadasha": "Mahadasha",
      "antardasha": "Antardasha",
      "years": "{count} years",
      "current": "Current",
      "period": "{start} – {end}",
      "periodLabel": "Period",
      "saveTitle": "Save or download your Kundli",
      "saveText": "Log in to save this Kundli to your account and download a printable PDF.",
      "save": "Save Kundli",
      "download": "Download PDF",
      "saved": "Kundli saved",
      "savedText": "You can find it later in your account under Saved Kundlis.",
      "pdfSoon": "PDF is being prepared",
      "pdfSoonText": "PDF download will be available once our servers are connected.",
      "faqs": [
        {
          "q": "What details do I need to make a Kundli?",
          "a": "You need your date of birth, exact time of birth and place of birth. The time decides your ascendant and house positions, so try to use the time from your birth certificate."
        },
        {
          "q": "What is the difference between North and South Indian charts?",
          "a": "Both show the same planetary positions. In the North Indian (diamond) chart the houses are fixed and the signs move; in the South Indian (square) chart the signs are fixed and the ascendant is marked."
        },
        {
          "q": "What is Vimshottari Dasha?",
          "a": "It is a 120-year system of planetary periods used to time events. Each Mahadasha is divided into nine Antardashas, and the sequence begins from the lord of your birth nakshatra."
        },
        {
          "q": "Is this Kundli free?",
          "a": "Yes. Generating your Kundli is completely free. Log in if you want to save it or download a PDF."
        }
      ]
    },
    "matching": {
      "metaTitle": "Kundli Matching – Free Guna Milan & Manglik Check for Marriage",
      "metaDescription": "Free Kundli matching by name and date of birth. Get Ashtakoot Guna Milan score out of 36, koota-wise breakdown and Manglik dosha check for both partners.",
      "title": "Kundli Matching (Guna Milan)",
      "intro": "Kundli matching compares the birth charts of a boy and a girl to check marriage compatibility. The Ashtakoot system scores eight aspects (kootas) for a total of 36 gunas, and we also check both charts for Manglik dosha.",
      "boy": "Boy",
      "girl": "Girl",
      "boyDetails": "Boy's birth details",
      "girlDetails": "Girl's birth details",
      "submit": "Match Kundli",
      "resultTitle": "Compatibility result",
      "gunasMatched": "Gunas matched",
      "scoreOf": "{score} out of {max}",
      "tableCaption": "Ashtakoot Guna Milan",
      "koota": "Koota",
      "obtained": "Obtained",
      "max": "Max",
      "total": "Total",
      "kootas": {
        "varna": {
          "name": "Varna",
          "desc": "Spiritual compatibility and ego"
        },
        "vashya": {
          "name": "Vashya",
          "desc": "Mutual attraction and control"
        },
        "tara": {
          "name": "Tara",
          "desc": "Health and well-being"
        },
        "yoni": {
          "name": "Yoni",
          "desc": "Physical and intimate compatibility"
        },
        "grahaMaitri": {
          "name": "Graha Maitri",
          "desc": "Mental compatibility and friendship"
        },
        "gana": {
          "name": "Gana",
          "desc": "Temperament and nature"
        },
        "bhakoot": {
          "name": "Bhakoot",
          "desc": "Love, family and finances"
        },
        "nadi": {
          "name": "Nadi",
          "desc": "Health and progeny"
        }
      },
      "manglikTitle": "Manglik check",
      "isManglik": "Manglik",
      "notManglik": "Not Manglik",
      "marsIn": "Mars in house {house}",
      "manglikNone": "Neither chart has Manglik dosha. No Manglik concerns for this match.",
      "manglikBoth": "Both are Manglik, so the dosha is considered cancelled for this match.",
      "manglikOne": "Only one partner is Manglik. Please consult an astrologer about remedies before deciding.",
      "verdict": {
        "excellent": {
          "title": "Excellent match",
          "text": "A very high score. The two charts are strongly compatible across most kootas."
        },
        "good": {
          "title": "Good match",
          "text": "A good score. This match is considered favourable for marriage."
        },
        "average": {
          "title": "Average match",
          "text": "An acceptable score. Some areas need attention; an astrologer can suggest remedies."
        },
        "low": {
          "title": "Low compatibility",
          "text": "Below the traditional minimum of 18 gunas. We recommend a detailed reading before taking a decision."
        }
      },
      "ctaTitle": "Discuss this match with an expert",
      "ctaText": "Guna score is only one part of compatibility. Get a full chart comparison, dosha analysis and remedies from a verified astrologer.",
      "faqs": [
        {
          "q": "How many gunas should match for marriage?",
          "a": "Traditionally, 18 or more out of 36 gunas is considered acceptable, 25 to 32 is good and above 32 is excellent. Nadi and Bhakoot dosha also matter."
        },
        {
          "q": "What is Manglik dosha?",
          "a": "A chart is called Manglik when Mars sits in the 1st, 2nd, 4th, 7th, 8th or 12th house. It is believed to affect married life, and it is usually considered cancelled when both partners are Manglik."
        },
        {
          "q": "Can a low guna score be fixed?",
          "a": "Many doshas have recognised cancellations and remedies. An experienced astrologer looks at the full charts, not just the score, before giving advice."
        },
        {
          "q": "Is birth time needed for Kundli matching?",
          "a": "Yes. Guna Milan depends on the Moon's nakshatra, which can change within a day, and the Manglik check depends on houses, which need an accurate birth time."
        }
      ]
    },
    "names": {
      "signsShort": [
        "Ari",
        "Tau",
        "Gem",
        "Can",
        "Leo",
        "Vir",
        "Lib",
        "Sco",
        "Sag",
        "Cap",
        "Aqu",
        "Pis"
      ],
      "nakshatras": [
        "Ashwini",
        "Bharani",
        "Krittika",
        "Rohini",
        "Mrigashira",
        "Ardra",
        "Punarvasu",
        "Pushya",
        "Ashlesha",
        "Magha",
        "Purva Phalguni",
        "Uttara Phalguni",
        "Hasta",
        "Chitra",
        "Swati",
        "Vishakha",
        "Anuradha",
        "Jyeshtha",
        "Mula",
        "Purva Ashadha",
        "Uttara Ashadha",
        "Shravana",
        "Dhanishta",
        "Shatabhisha",
        "Purva Bhadrapada",
        "Uttara Bhadrapada",
        "Revati"
      ],
      "planets": {
        "ascendant": "Ascendant",
        "sun": "Sun",
        "moon": "Moon",
        "mars": "Mars",
        "mercury": "Mercury",
        "jupiter": "Jupiter",
        "venus": "Venus",
        "saturn": "Saturn",
        "rahu": "Rahu",
        "ketu": "Ketu"
      },
      "planetsShort": {
        "ascendant": "Asc",
        "sun": "Su",
        "moon": "Mo",
        "mars": "Ma",
        "mercury": "Me",
        "jupiter": "Ju",
        "venus": "Ve",
        "saturn": "Sa",
        "rahu": "Ra",
        "ketu": "Ke"
      },
      "tithis": [
        "Pratipada",
        "Dwitiya",
        "Tritiya",
        "Chaturthi",
        "Panchami",
        "Shashthi",
        "Saptami",
        "Ashtami",
        "Navami",
        "Dashami",
        "Ekadashi",
        "Dwadashi",
        "Trayodashi",
        "Chaturdashi",
        "Purnima"
      ],
      "amavasya": "Amavasya",
      "yogas": [
        "Vishkambha",
        "Priti",
        "Ayushman",
        "Saubhagya",
        "Shobhana",
        "Atiganda",
        "Sukarma",
        "Dhriti",
        "Shoola",
        "Ganda",
        "Vriddhi",
        "Dhruva",
        "Vyaghata",
        "Harshana",
        "Vajra",
        "Siddhi",
        "Vyatipata",
        "Variyana",
        "Parigha",
        "Shiva",
        "Siddha",
        "Sadhya",
        "Shubha",
        "Shukla",
        "Brahma",
        "Indra",
        "Vaidhriti"
      ],
      "karanas": [
        "Bava",
        "Balava",
        "Kaulava",
        "Taitila",
        "Gara",
        "Vanija",
        "Vishti (Bhadra)",
        "Shakuni",
        "Chatushpada",
        "Naga",
        "Kimstughna"
      ],
      "weekdays": [
        "Sunday (Ravivar)",
        "Monday (Somvar)",
        "Tuesday (Mangalvar)",
        "Wednesday (Budhvar)",
        "Thursday (Guruvar)",
        "Friday (Shukravar)",
        "Saturday (Shanivar)"
      ],
      "gana": {
        "deva": "Deva",
        "manushya": "Manushya",
        "rakshasa": "Rakshasa"
      },
      "nadi": {
        "adi": "Adi",
        "madhya": "Madhya",
        "antya": "Antya"
      },
      "varna": {
        "brahmin": "Brahmin",
        "kshatriya": "Kshatriya",
        "vaishya": "Vaishya",
        "shudra": "Shudra"
      },
      "paksha": {
        "shukla": "Shukla Paksha",
        "krishna": "Krishna Paksha"
      },
      "elements": {
        "fire": "Fire",
        "earth": "Earth",
        "air": "Air",
        "water": "Water"
      }
    },
    "nav": {
      "kundli": {
        "title": "Free Kundli",
        "desc": "Birth chart, planets & dasha"
      },
      "kundliMatching": {
        "title": "Kundli Matching",
        "desc": "Guna Milan for marriage"
      },
      "panchang": {
        "title": "Today's Panchang",
        "desc": "Tithi, nakshatra & Rahu Kaal"
      },
      "zodiacFinder": {
        "title": "Zodiac Sign Finder",
        "desc": "Find your sun sign"
      },
      "numerology": {
        "title": "Numerology Calculator",
        "desc": "Life path & destiny numbers"
      }
    },
    "numerology": {
      "metaTitle": "Numerology Calculator – Life Path, Destiny & Soul Urge Numbers",
      "metaDescription": "Free numerology calculator. Enter your name and date of birth to find your life path, destiny (expression), soul urge and personality numbers with meanings.",
      "title": "Numerology Calculator",
      "intro": "Numerology studies the vibration of numbers in your name and birth date. Enter your full name and date of birth to calculate your life path, destiny, soul urge and personality numbers using the Pythagorean system.",
      "nameLabel": "Full name",
      "namePlaceholder": "As written in English",
      "nameHint": "Use your full birth name in English letters.",
      "nameLatin": "Please type your name in English (A–Z) letters",
      "submit": "Calculate numbers",
      "resultTitle": "Your core numbers",
      "master": "Master number",
      "calculation": "Calculation: {steps}",
      "lifePath": "Life Path Number",
      "lifePathDesc": "From your date of birth. Your life's main purpose and path.",
      "destiny": "Destiny (Expression) Number",
      "destinyDesc": "From all letters of your name. Your talents and goals.",
      "soulUrge": "Soul Urge Number",
      "soulUrgeDesc": "From the vowels in your name. Your inner desires.",
      "personality": "Personality Number",
      "personalityDesc": "From the consonants in your name. How others see you.",
      "meanings": {
        "1": {
          "title": "The Leader",
          "text": "Independent, ambitious and original. You are driven to start things and lead the way."
        },
        "2": {
          "title": "The Peacemaker",
          "text": "Sensitive, cooperative and diplomatic. You thrive in partnerships and bring people together."
        },
        "3": {
          "title": "The Communicator",
          "text": "Creative, expressive and social. You inspire others with words, art and optimism."
        },
        "4": {
          "title": "The Builder",
          "text": "Practical, disciplined and dependable. You create stability through hard work."
        },
        "5": {
          "title": "The Freedom Seeker",
          "text": "Adventurous, versatile and curious. You need change, travel and new experiences."
        },
        "6": {
          "title": "The Nurturer",
          "text": "Caring, responsible and family-oriented. You find purpose in serving others."
        },
        "7": {
          "title": "The Seeker",
          "text": "Analytical, spiritual and introspective. You search for deeper truth and wisdom."
        },
        "8": {
          "title": "The Achiever",
          "text": "Ambitious, authoritative and business-minded. You are built for success and material power."
        },
        "9": {
          "title": "The Humanitarian",
          "text": "Compassionate, generous and idealistic. You are here to give back to the world."
        },
        "11": {
          "title": "The Intuitive (Master)",
          "text": "Highly intuitive and inspiring. You carry a strong spiritual message for others."
        },
        "22": {
          "title": "The Master Builder",
          "text": "Visionary and practical. You can turn big dreams into lasting reality."
        },
        "33": {
          "title": "The Master Teacher",
          "text": "Selfless, healing and wise. You uplift others through love and guidance."
        }
      },
      "faqs": [
        {
          "q": "What is a life path number?",
          "a": "It is the most important number in numerology, calculated by reducing your full date of birth to a single digit (or the master numbers 11, 22 and 33)."
        },
        {
          "q": "Which name should I use?",
          "a": "Use your full birth name as it is spelled in English. Nicknames and changed names show other influences and can be checked separately."
        },
        {
          "q": "What are master numbers?",
          "a": "11, 22 and 33 are called master numbers. They are not reduced further and are believed to carry stronger potential and responsibility."
        },
        {
          "q": "Which numerology system is used here?",
          "a": "We use the Pythagorean system, where letters A to Z are assigned values 1 to 9 in sequence."
        }
      ]
    },
    "panchang": {
      "metaTitle": "Today's Panchang – Tithi, Nakshatra, Rahu Kaal & Muhurat",
      "metaDescription": "Check today's Panchang: tithi, nakshatra, yoga, karana, vaar, sunrise, sunset, moonrise, Rahu Kaal, Gulika, Yamaganda and Abhijit muhurat for your city.",
      "title": "Today's Panchang",
      "intro": "Panchang is the Hindu calendar of five limbs: tithi, vaar, nakshatra, yoga and karana. Check today's Panchang with sunrise and sunset, Rahu Kaal and auspicious muhurat timings for your city, or pick any other date.",
      "date": "Date",
      "city": "City",
      "today": "Today",
      "prevDay": "Previous day",
      "nextDay": "Next day",
      "heading": "Panchang for {date}",
      "inPlace": "in {place}",
      "fiveLimbs": "Panchang elements",
      "tithi": "Tithi",
      "nakshatra": "Nakshatra",
      "yoga": "Yoga",
      "karana": "Karana",
      "vaar": "Vaar (weekday)",
      "paksha": "Paksha",
      "until": "until {time}",
      "untilNextDay": "until {time}, next day",
      "sunMoon": "Sun and Moon",
      "sunrise": "Sunrise",
      "sunset": "Sunset",
      "moonrise": "Moonrise",
      "moonset": "Moonset",
      "inauspicious": "Inauspicious timings",
      "auspicious": "Auspicious timing",
      "rahuKaal": "Rahu Kaal",
      "gulika": "Gulika Kaal",
      "yamaganda": "Yamaganda",
      "abhijit": "Abhijit Muhurat",
      "rahuKaalDesc": "Avoid starting new work or travel.",
      "gulikaDesc": "Avoid important beginnings.",
      "yamagandaDesc": "Not favourable for auspicious work.",
      "abhijitDesc": "The most auspicious window around midday.",
      "loadError": "Could not load Panchang for this date.",
      "faqs": [
        {
          "q": "What are the five limbs of Panchang?",
          "a": "Tithi (lunar day), Vaar (weekday), Nakshatra (lunar mansion), Yoga (sun-moon combination) and Karana (half of a tithi). Together they are used to choose muhurat."
        },
        {
          "q": "What is Rahu Kaal?",
          "a": "Rahu Kaal is a period of about 90 minutes every day, ruled by Rahu, that is considered unfavourable for starting new work. Its timing depends on the weekday and local sunrise and sunset."
        },
        {
          "q": "Why does Panchang change by city?",
          "a": "Sunrise, sunset and every muhurat are calculated from local sunrise, so timings differ between cities even on the same date."
        },
        {
          "q": "What is Abhijit Muhurat?",
          "a": "Abhijit is the eighth of fifteen muhurats in the day, around local noon. It is considered powerful for beginning important work."
        }
      ]
    },
    "zodiac": {
      "metaTitle": "Zodiac Sign Finder – What Is My Zodiac Sign by Date of Birth?",
      "metaDescription": "Find your zodiac (sun) sign instantly from your date of birth. See your sign's dates, element, ruling planet and today's horoscope.",
      "title": "Zodiac Sign Finder",
      "intro": "Not sure of your zodiac sign? Enter your date of birth to instantly find your sun sign, along with its element, ruling planet and key traits. Then read today's horoscope for your sign.",
      "dobLabel": "Your date of birth",
      "submit": "Find my sign",
      "resultLabel": "Your zodiac sign is",
      "dates": "Dates",
      "element": "Element",
      "ruler": "Ruling planet",
      "readHoroscope": "Read today's {sign} horoscope",
      "moonTitle": "What about your Moon sign?",
      "moonText": "Vedic astrology gives the most importance to your Moon sign (Rashi), which can differ from your sun sign. Finding it needs your exact birth time and place.",
      "moonCta": "Find my Moon sign with free Kundli",
      "traits": {
        "aries": "Bold, energetic and a natural leader who loves a challenge.",
        "taurus": "Patient, reliable and devoted, with a love for comfort and beauty.",
        "gemini": "Curious, witty and adaptable, always ready to learn and talk.",
        "cancer": "Caring, intuitive and protective of family and home.",
        "leo": "Confident, generous and warm-hearted, born to shine.",
        "virgo": "Practical, analytical and helpful, with an eye for detail.",
        "libra": "Charming, fair-minded and diplomatic, seeking harmony.",
        "scorpio": "Intense, loyal and perceptive, with deep emotional strength.",
        "sagittarius": "Optimistic, adventurous and honest, always exploring.",
        "capricorn": "Disciplined, ambitious and responsible, built for the long run.",
        "aquarius": "Original, independent and humanitarian, ahead of their time.",
        "pisces": "Compassionate, imaginative and deeply intuitive."
      },
      "faqs": [
        {
          "q": "How is my zodiac sign decided?",
          "a": "Your sun sign is decided by the position of the Sun on the day you were born. Each sign covers roughly a month of the year."
        },
        {
          "q": "What is the difference between sun sign and moon sign?",
          "a": "The sun sign depends only on your birth date. The moon sign (Rashi) depends on where the Moon was at your birth time and is the main sign used in Vedic astrology."
        },
        {
          "q": "I was born on the cusp. Which sign am I?",
          "a": "Sign boundaries can shift by a day in some years. If you were born on a boundary date, a full birth chart with your birth time gives the exact answer."
        }
      ]
    }
  },
  "wallet": {
    "couponInvalid": "This coupon code is invalid or has expired",
    "couponMinAmount": "This coupon needs a recharge of at least {amount}",
    "failureReason": {
      "cancelled": "The payment was cancelled.",
      "declined": "Your bank declined the payment. Please try again or use a different payment method.",
      "insufficientFunds": "Insufficient funds in your bank account.",
      "timeout": "The payment timed out before it was completed."
    },
    "filter": {
      "all": "All",
      "bonus": "Bonus",
      "consultation": "Consultations",
      "recharge": "Recharges",
      "refund": "Refunds"
    },
    "invoice": {
      "line_wallet_recharge": "Wallet recharge (online consultation services)"
    },
    "recharge": "Recharge",
    "reports": {
      "catalog": {
        "career-report": {
          "title": "Career & Finance Report",
          "short": "Find the right career path, job vs business guidance and wealth periods.",
          "description": "Unsure about your next career move? This report analyses your 10th house, its lord and key career yogas to suggest the fields where you're most likely to succeed, whether a job or business suits you better, when promotions and financial gains are likely, and remedies to remove obstacles."
        },
        "kundli-report": {
          "title": "Complete Kundli Report",
          "short": "Your full Janam Kundli with planetary positions, dashas, doshas and personalised remedies.",
          "description": "A comprehensive life report based on your exact birth chart. It covers your Lagna, Moon and Sun signs, the strength of every planet, your Vimshottari dasha periods for the next 20 years, the presence of doshas such as Manglik, Kaal Sarp and Sade Sati, and what each means for your career, wealth, health and relationships — with practical remedies you can follow."
        },
        "marriage-matching-report": {
          "title": "Marriage Matching Report",
          "short": "Detailed Kundli Milan for two people: Guna Milan, Manglik check and compatibility.",
          "description": "Planning a marriage? This report compares both birth charts using the traditional Ashtakoota Guna Milan (36 points), checks Manglik dosha for both partners, and goes beyond the score to analyse emotional, mental and physical compatibility, auspicious marriage timing and remedies for any doshas found."
        },
        "yearly-prediction-2027": {
          "title": "Yearly Prediction 2027",
          "short": "Month-by-month guidance for 2027 on career, money, love and health.",
          "description": "Know what 2027 holds for you. Based on your birth chart and the major planetary transits of the year — Saturn, Jupiter, Rahu and Ketu — this report gives month-by-month predictions for career, finances, relationships and health, along with your most favourable dates for important decisions."
        }
      },
      "faq": {
        "a1": "Most reports are ready within 2–4 hours. You'll find them in My Reports, and we'll notify you as soon as yours is ready.",
        "a2": "Your exact date, time and place of birth. The more accurate your birth time, the more precise the predictions.",
        "a3": "If a report fails to generate, the amount is refunded to your wallet automatically. Reports that have been delivered are non-refundable.",
        "a4": "Yes. Your birth details and reports are visible only to you and are never shared with third parties.",
        "q1": "How long does it take to get my report?",
        "q2": "What details do I need?",
        "q3": "Can I get a refund?",
        "q4": "Is my data private?"
      },
      "item": {
        "birthChart": "Birth chart (Lagna & Navamsa)",
        "career": "Career & wealth analysis",
        "careerFinance": "Career & finance outlook",
        "careerPath": "Best-suited career fields",
        "compatibility": "Emotional & mental compatibility",
        "coupleRemedies": "Remedies for the couple",
        "dasha": "20-year Vimshottari dasha",
        "doshas": "Manglik, Kaal Sarp & Sade Sati",
        "favourablePeriods": "Favourable periods for change",
        "gunaMilan": "36-point Guna Milan",
        "health": "Health tendencies",
        "healthYear": "Health guidance",
        "jobVsBusiness": "Job vs business guidance",
        "loveFamily": "Love & family life",
        "luckyDates": "Lucky dates & colours",
        "manglik": "Manglik dosha for both",
        "marriageTiming": "Auspicious marriage timing",
        "monthByMonth": "Month-by-month predictions",
        "planetPositions": "Planetary positions & strengths",
        "remedies": "Personalised remedies",
        "transits": "Major transits of the year",
        "wealth": "Wealth & financial growth"
      },
      "itemDesc": {
        "birthChart": "North & South Indian charts with ascendant analysis.",
        "career": "Fields, timing and sources of income.",
        "careerFinance": "Opportunities, job changes and money flow.",
        "careerPath": "Fields that match your planetary strengths.",
        "compatibility": "How your temperaments and values align.",
        "coupleRemedies": "Simple remedies to strengthen the bond.",
        "dasha": "Major and sub-periods with what to expect in each.",
        "doshas": "Presence, intensity and cancellation of key doshas.",
        "favourablePeriods": "When to switch jobs, start or expand.",
        "gunaMilan": "All eight kootas scored and explained.",
        "health": "Areas to take care of based on your chart.",
        "healthYear": "Periods to be careful and stay active.",
        "jobVsBusiness": "Which path suits your chart better.",
        "loveFamily": "Relationships, marriage and family harmony.",
        "luckyDates": "Best dates for important decisions.",
        "manglik": "Mars placement and cancellation rules for both partners.",
        "marriageTiming": "Favourable years and muhurat windows.",
        "monthByMonth": "Twelve months of focused guidance.",
        "planetPositions": "Degree, sign, house and strength of all nine planets.",
        "remedies": "Mantras, gemstones, fasting and charity suggestions.",
        "transits": "Saturn, Jupiter, Rahu & Ketu and their effects on you.",
        "wealth": "Dhana yogas and periods of financial gain."
      },
      "relation": {
        "child": "Child",
        "friend": "Friend",
        "other": "Other",
        "parent": "Parent",
        "partner": "Partner",
        "self": "You",
        "sibling": "Sibling"
      }
    },
    "tag": {
      "bestValue": "Best value",
      "popular": "Popular"
    },
    "txn": {
      "bonus_coupon": "Coupon bonus",
      "bonus_pack": "Recharge bonus",
      "bonus_welcome": "Welcome bonus",
      "bonus_referral": "Referral reward",
      "bonus_adjustment": "Wallet adjustment",
      "bonus_expired": "Bonus expired"
    },
    "txnStatus": {
      "failed": "Failed",
      "pending": "Pending",
      "success": "Successful"
    }
  }
};

/** label("status.online") → "Online"; label("x.y", { name }) fills {name}. */
export function label(key, vars) {
  const value = key.split(".").reduce((acc, part) => acc?.[part], LABELS);
  if (typeof value !== "string") {
    if (process.env.NODE_ENV !== "production") console.warn(`[labels] missing: ${key}`);
    return key;
  }
  return vars ? value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`) : value;
}

/** True when `key` has text (used where data may carry either a label key or plain text). */
export function hasLabel(key) {
  return typeof key.split(".").reduce((acc, part) => acc?.[part], LABELS) === "string";
}
