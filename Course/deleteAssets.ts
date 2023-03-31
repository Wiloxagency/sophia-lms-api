import { BlobServiceClient } from '@azure/storage-blob'
import {BlobInfo} from '../DeleteElement/types'

// Deleta arquivos de containers

export async function deleteAssets(blobInfoList: BlobInfo[]): Promise<boolean> {

    const AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=sophieassets;AccountKey=7Phn8lu1cvWdRN8A/S+rQTYgJIGL0bTr9bJeC1Cy4tPtQ/jAAN7qzL6E3dnuCyNhp2Xc3Px841GdQJWUo9vIXg==;EndpointSuffix=core.windows.net"

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    try {
        for (const blobInfo of blobInfoList) {
          const containerClient = blobServiceClient.getContainerClient(blobInfo.container);
          const blockBlobClient = containerClient.getBlockBlobClient(blobInfo.file);
          await blockBlobClient.delete();
        }
        return true;
      } catch (err) {
        return false;
      };
    
    }; 
