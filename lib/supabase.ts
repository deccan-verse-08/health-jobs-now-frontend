import { applicationsApi } from "./api";

export async function uploadResume(file: File): Promise<string> {
  const response = await applicationsApi.uploadResume(file);
  return response.url;
}
