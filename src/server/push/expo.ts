import { Expo, type ExpoPushMessage, type ExpoPushTicket } from "expo-server-sdk";

export interface ExpoPushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string | null;
  projectId?: string | null;
}

export interface ExpoSendResult {
  tokens: string[];
  tickets: ExpoPushTicket[];
  invalidTokens: string[];
}

const expo = new Expo(
  process.env.EXPO_ACCESS_TOKEN
    ? { accessToken: process.env.EXPO_ACCESS_TOKEN }
    : undefined,
);

export async function sendExpoPushNotifications(
  tokens: string[],
  payload: ExpoPushPayload,
): Promise<ExpoSendResult> {
  const projectId =
    payload.projectId ??
    (process.env.EXPO_PROJECT_ID ? process.env.EXPO_PROJECT_ID : null);
  const validTokens: string[] = [];
  const invalidTokens: string[] = [];

  for (const token of tokens) {
    if (Expo.isExpoPushToken(token)) {
      validTokens.push(token);
    } else {
      invalidTokens.push(token);
    }
  }

  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    title: payload.title,
    body: payload.body,
    sound: "default",
    data: payload.data,
    ...(payload.imageUrl ? { image: payload.imageUrl } : {}),
    ...(projectId ? { projectId } : {}),
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...chunkTickets);
  }

  return { tokens: validTokens, tickets, invalidTokens };
}
