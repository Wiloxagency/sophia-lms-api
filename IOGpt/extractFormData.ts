export function extractFormData(raw: string | object) {
  let parsed: any;

  if (typeof raw === "string") {
    parsed = JSON.parse(raw);
  } else {
    parsed = raw;
  }

  const { name, position, taskName, ...taskFields } = parsed;

  const identityUpdate: Record<string, string> | null =
    name || position
      ? {
          ...(name ? { name } : {}),
          ...(position ? { position } : {}),
        }
      : null;

  const hasTaskFields = Object.keys(taskFields).some((k) =>
    [
      "frequencyAndTime",
      "difficulty",
      "addedValue",
      "implicitPriority",
    ].includes(k)
  );

  const formDataUpdate =
    taskName && hasTaskFields ? { [taskName]: taskFields } : null;

  return { identityUpdate, formDataUpdate };
}
