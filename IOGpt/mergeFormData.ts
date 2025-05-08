import { GptFormData } from ".";

export function mergeFormData(
  existing: GptFormData,
  incoming: Partial<GptFormData>
): GptFormData {
  const validTasks = Object.entries(incoming.tasks || {}).reduce(
    (acc, [taskKey, taskData]) => {
      if (taskKey !== "undefined" && taskData && typeof taskData === "object") {
        acc[taskKey] = {
          ...(existing.tasks?.[taskKey] || {}),
          ...taskData,
        };
      }
      return acc;
    },
    {} as GptFormData["tasks"]
  );

  console.log("incoming formDataUpdate:", incoming);

  return {
    name: incoming.name !== undefined ? incoming.name : existing.name,
    position:
      incoming.position !== undefined ? incoming.position : existing.position,
    tasks: {
      ...existing.tasks,
      ...validTasks,
    },
  };
}
