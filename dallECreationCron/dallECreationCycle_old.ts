import { createConnection } from "../shared/mongo";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { BlobServiceClient } from "@azure/storage-blob";
import OpenAI from "openai";
import sharp = require("sharp");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = "dalle";

// Crear un cliente MongoDB
const database = createConnection()

export async function aiImageCreation() {
  try {
    const db = await database
    const collection = db.collection("dallePrompt");
    const counterCollection = db.collection("api_limits");

    // Obtener documentos con el estado "started"
    const documents = await collection.find({ status: "started" }).toArray();

    for (const doc of documents) {
      // Sincronizar contador global para evitar superar límite de 200 imágenes por minuto
      const limitReached = await checkApiLimit(counterCollection);
      if (limitReached) {
        console.log("Límite de imágenes alcanzado. Esperando el próximo minuto...");
        await waitForNextMinute(counterCollection);
      }

      const prompt = doc.prompt;
      console.info(prompt)
      // Actualizar estado a "processing"
      await collection.updateOne({ _id: doc._id }, { $set: { status: "processing" } });

      // Crear la imagen con DALL·E 3
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        // prompt: "a white siamese cat",
        n: 1,
        size: "1792x1024",
        response_format: "b64_json",
      });

      console.info(imageResponse)
      
      const input = Buffer.from(imageResponse.data[0].b64_json, "base64");

      const output = await sharp(input).jpeg().toBuffer();

      const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );

      const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
      const blobName = uuidv4() + ".jpeg";
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(output, output.length);

      // Actualizar documento en MongoDB con la URL de la imagen y estado "completed"
      await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            url: blockBlobClient.url,
            status: "completed"
          }
        }
      );

      // Incrementar el contador global de imágenes generadas
      await incrementApiUsage(counterCollection);
    }

    console.log("Proceso completado.");
  } catch (error) {
    console.error("Error durante la generación y almacenamiento de imágenes:", error);
  } 
}

// Función para verificar si el límite de 200 imágenes por minuto ha sido alcanzado
async function checkApiLimit(counterCollection: any): Promise<boolean> {
  const counter = await counterCollection.findOne({ name: "dalle_image_limit" });
  const currentTime = Date.now();

  if (!counter) {
    // Si no existe un contador, inicializarlo
    await counterCollection.insertOne({
      name: "dalle_image_limit",
      count: 0,
      timestamp: currentTime
    });
    return false;
  }

  const elapsedTime = currentTime - counter.timestamp;

  // Si ha pasado más de un minuto, resetear el contador
  if (elapsedTime > 60000) {
    await counterCollection.updateOne(
      { name: "dalle_image_limit" },
      { $set: { count: 0, timestamp: currentTime } }
    );
    return false;
  }

  // Si se ha alcanzado el límite de 200 imágenes en el último minuto
  if (counter.count >= 200) {
    return true;
  }

  return false;
}

// Función para esperar hasta que pase un minuto para poder continuar generando imágenes
async function waitForNextMinute(counterCollection: any): Promise<void> {
  const counter = await counterCollection.findOne({ name: "dalle_image_limit" });
  const currentTime = Date.now();
  const elapsedTime = currentTime - counter.timestamp;
  const remainingTime = 60000 - elapsedTime;

  if (remainingTime > 0) {
    await new Promise(resolve => setTimeout(resolve, remainingTime));
  }

  // Después de esperar, reiniciar el contador
  await counterCollection.updateOne(
    { name: "dalle_image_limit" },
    { $set: { count: 0, timestamp: Date.now() } }
  );
}

// Función para incrementar el contador global de imágenes generadas
async function incrementApiUsage(counterCollection: any): Promise<void> {
  await counterCollection.updateOne(
    { name: "dalle_image_limit" },
    { $inc: { count: 1 } }
  );
}


