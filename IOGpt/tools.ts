export const extractFormDataTool = {
  type: "function",
  function: {
    name: "extract_form_data",
    description: "Extrae información estructurada de la entrevista",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre del usuario" },
        position: { type: "string", description: "Cargo del usuario" },
        taskName: { type: "string", description: "Nombre de la tarea" },
        frequencyAndTime: { type: "string" },
        difficulty: { type: "string" },
        addedValue: { type: "string" },
        implicitPriority: { type: "string" },
      },
      required: ["taskName"],
    },
  },
} as const;
