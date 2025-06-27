import { Db } from "mongodb";

export async function getTasksForOccupation(db: Db, occupationName: string) {
  const doc = await db
    .collection("occupations")
    .findOne({ name: occupationName });

  if (!doc || !doc.categories?.tasks?.length) {
    return {
      found: false,
      reason: "No se encontraron tareas para ese nombre de trabajo.",
    };
  }

  const tasks = doc.categories.tasks
    .sort((a: any, b: any) => b.importance - a.importance)
    .slice(0, 5)
    .map((t: any) => t.task);

  return {
    found: true,
    tasks,
  };
}
