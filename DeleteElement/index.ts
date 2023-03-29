import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { BlobServiceClient } from '@azure/storage-blob'

const AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=sophieassets;AccountKey=7Phn8lu1cvWdRN8A/S+rQTYgJIGL0bTr9bJeC1Cy4tPtQ/jAAN7qzL6E3dnuCyNhp2Xc3Px841GdQJWUo9vIXg==;EndpointSuffix=core.windows.net"

interface BlobInfo {
  container: string;
  file: string;
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

  const blobInfoList: BlobInfo[] = req.body;

  try {
    for (const blobInfo of blobInfoList) {
      const containerClient = blobServiceClient.getContainerClient(blobInfo.container);
      const blockBlobClient = containerClient.getBlockBlobClient(blobInfo.file);
      await blockBlobClient.delete();
    }
    context.res = {
      status: 200,
      body: { message: "Successfully Deleted Files" }
    };
  } catch (err) {
    console.error(`Something went wrong: ${err}`);
    context.res = {
      status: 500,
      body: { message: "An error occurred while deleting the files" }
    };
  }
};

export default httpTrigger;
