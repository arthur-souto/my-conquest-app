import { api } from "@/lib/api";
import { decode } from "base64-arraybuffer";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";


type UrlParams = {
  fileName: string,
  type: string,
  bucket: "image" | "pdf"
}

type PresignedUrlResponse = {
  uploadUrl: string;
  publicUrl: string 
}

type UploadFileParams = {
  uploadUrl: string,
  file: Blob | ArrayBuffer,
  mimeType: string
}  

type UploadImageFromDeviceParams = {
  type: string
}

const getPresignedUrl = async ({fileName, type, bucket}: UrlParams) => {
  const response = await api.get(`/storage/${bucket}/presigned-url`, {
    params: {
      fileName,
      type,
    }
  }) 
  return response.data as PresignedUrlResponse
}

export const uploadFileToR2 = async ({uploadUrl, file, mimeType}: UploadFileParams) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file instanceof ArrayBuffer ? file : file,
    headers: {
      "Content-Type": mimeType
    }
  })
  if (!response.ok) throw new Error(`Failed to upload file: ${response.statusText}`);
}

export const deleteFile = async (storagePath: string) => {
  await api.delete(`/storage/file`, { params: { storagePath } });
}

export const uploadImageFromDevice = async ({type}: UploadImageFromDeviceParams) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8
  })

  if(result.canceled) return null

  const asset = result.assets[0]
  const fileName = asset.fileName ?? `${Date.now()}.jpg`
  const mimeType = asset.mimeType ?? "image/jpeg"
  
  const base64 = await FileSystemLegacy.readAsStringAsync(asset.uri, {encoding: "base64"})
  const fileData = decode(base64)

  const { uploadUrl, publicUrl } = await getPresignedUrl({
    fileName,
    type,
    bucket: "image"
  });
  
  await uploadFileToR2({uploadUrl, file: fileData, mimeType});

  return {storagePath: publicUrl, mimeType}
}

export async function uploadDocFromDevice(type: string) {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/pdf", "application/*"],
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  const fileName = asset.name ?? `${Date.now()}.pdf`;
  const mimeType = asset.mimeType ?? "application/octet-stream";

  const blob = await fetch(asset.uri).then((r) => r.blob());

  const { uploadUrl, publicUrl } = await getPresignedUrl({
    fileName,
    type,
    bucket: "pdf"
  });
  await uploadFileToR2({uploadUrl, file: blob, mimeType});

  return { storagePath: publicUrl, mimeType };
}

export const uploadFileDirectly = async ({
  localUri,
  fileType,
  type,
}: {
  localUri: string;
  fileType: string;
  type: string;
}) => {
  const isImage = fileType.startsWith("image/");
  const ext = fileType.split("/")[1] ?? "jpg";
  const fileName = `${Date.now()}.${ext}`;

  const { uploadUrl, publicUrl } = await getPresignedUrl({
    fileName,
    type,
    bucket: isImage ? "image" : "pdf",
  });

  if (isImage) {
    const base64 = await FileSystemLegacy.readAsStringAsync(localUri, { encoding: "base64" });
    const fileData = decode(base64);
    await uploadFileToR2({ uploadUrl, file: fileData, mimeType: fileType });
  } else {
    const blob = await fetch(localUri).then((r) => r.blob());
    await uploadFileToR2({ uploadUrl, file: blob, mimeType: fileType });
  }

  return { storagePath: publicUrl, mimeType: fileType };
};