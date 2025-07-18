import { Storage } from "@google-cloud/storage";

export const storage = new Storage({
  credentials: {
    private_key_id: process.env.GCLOUD_BUCKET_PRIVATE_KEY_ID,
    private_key: process.env.GCLOUD_BUCKET_PRIVATE_KEY,
    client_email: process.env.GCLOUD_BUCKET_CLIENT_EMAIL,
  },
  projectId: process.env.GCLOUD_PROJECT_ID,
});

export const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME!);
