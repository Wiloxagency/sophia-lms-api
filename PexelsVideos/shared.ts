import { createClient } from "pexels";
import { translateQuery } from "../shared/translator";

const pexelsClient = createClient(
  "mtCEdnRigTAFPj5nELvf5XSfjwfslcwz1qGfCf0gj1EZ57XCh3KraNns"
);

export async function returnPexelsVideos(query: string) {
  let translatedQuery = await translateQuery(query);
  query = translatedQuery;
  console.info(query)
  let responseVideos = await pexelsClient.videos.search({
    query,
    per_page: 80,
    // orientation: "landscape",
  });
  return responseVideos;
}
