import { GptFormData } from ".";
import { createConnection } from "../shared/mongo";
const database = createConnection();

export async function saveInterview(
  userEmail: string,
  incomingFormData: GptFormData,
  sessionId: string
): Promise<void> {
  const db = await database;
  const Interviews = db.collection("ioInterviews");

  const existing = await Interviews.findOne({ userEmail, sessionId });

  const mergedFormData: GptFormData = {
    name: incomingFormData.name ?? existing?.formData.name ?? null,
    position: incomingFormData.position ?? existing?.formData.position ?? null,
    tasks: {
      ...(existing?.formData.tasks || {}),
      ...(incomingFormData.tasks || {}),
    },
  };

  await Interviews.updateOne(
    { userEmail, sessionId },
    {
      $set: {
        userEmail,
        sessionId,
        formData: mergedFormData,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
