import { decode } from "base64-arraybuffer";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";

export async function uploadFile(
  bucket: string,
  path: string,
  file: Blob | ArrayBuffer,
  mimeType: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: mimeType, upsert: false });

  if (error) throw new Error(error.message);
  return data.path;
}

export async function deleteFiles(bucket: string, paths: string[]) {
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw new Error(error.message);
}

export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function listFiles(bucket: string, folder = "") {
  const { data, error } = await supabase.storage.from(bucket).list(folder);
  if (error) throw new Error(error.message);
  return data;
}

export async function moveFile(
  bucket: string,
  from: string,
  to: string
) {
  const { error } = await supabase.storage.from(bucket).move(from, to);
  if (error) throw new Error(error.message);
}

export async function uploadImageFromDevice(bucket: string, pathPrefix: string) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  const fileName = asset.fileName ?? `${Date.now()}.jpg`;
  const mimeType = asset.mimeType ?? "image/jpeg";
  const base64 = await FileSystemLegacy.readAsStringAsync(asset.uri, { encoding: "base64" });
  const path = `${pathPrefix}/${fileName}`;

  await uploadFile(bucket, path, decode(base64), mimeType);
  return { path, mimeType };
}

export async function uploadDocFromDevice(bucket: string, pathPrefix: string) {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/pdf", "application/*"],
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  const fileName = asset.name ?? `${Date.now()}.pdf`;
  const mimeType = asset.mimeType ?? "application/octet-stream";
  const blob = await fetch(asset.uri).then((r) => r.blob());
  const path = `${pathPrefix}/${fileName}`;

  await uploadFile(bucket, path, blob, mimeType);
  return { path, mimeType };
}
