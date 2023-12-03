import { BlobServiceClient } from '@azure/storage-blob'
import {BlobInfo} from '../DeleteElement/types'

// Deleta arquivos de containers

export interface DeleteResult {
    success: boolean;
    count: number;
  }

export async function deleteAssets(blobInfoList: BlobInfo[]): Promise<DeleteResult> {

  const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

  let count = 0;

  try {
    for (const blobInfo of blobInfoList) {
      const containerClient = blobServiceClient.getContainerClient(blobInfo.container);
      const blockBlobClient = containerClient.getBlockBlobClient(blobInfo.file);
      const response = await blockBlobClient.delete();
      if (response._response.status === 202) {
        count++;    
      }
    }
    return { success: true, count };
  } catch (err) {
    return { success: false, count };
  }
};
