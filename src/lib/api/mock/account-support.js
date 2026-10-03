/** Mock support tickets. */
import { daysAgo } from "./account";

export const MOCK_TICKETS = () => [
  {
    id: "TCK-20431",
    category: "refund",
    subject: "Chat disconnected after 2 minutes",
    sessionId: "ses_1004",
    status: "resolved",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
    messages: [
      {
        id: "tm_1",
        from: "user",
        text: "My chat with the astrologer got disconnected after 2 minutes but I was charged for 7 minutes.",
        at: daysAgo(5),
        attachments: [],
      },
      {
        id: "tm_2",
        from: "agent",
        agentName: "Support",
        text: "Sorry about that! We checked the session logs and refunded ₹245 to your wallet.",
        at: daysAgo(4),
        attachments: [],
      },
    ],
  },
  {
    id: "TCK-20577",
    category: "payment",
    subject: "Recharge amount not reflecting",
    sessionId: null,
    status: "in_progress",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0, 6),
    messages: [
      {
        id: "tm_3",
        from: "user",
        text: "I paid ₹200 via UPI but my wallet still shows the old balance.",
        at: daysAgo(1),
        attachments: [{ name: "upi-receipt.png", size: 182000 }],
      },
      {
        id: "tm_4",
        from: "agent",
        agentName: "Support",
        text: "Thanks for the screenshot. We're checking with the payment gateway and will update you within 24 hours.",
        at: daysAgo(0, 6),
        attachments: [],
      },
    ],
  },
];
