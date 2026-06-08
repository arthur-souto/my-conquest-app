import { ConquestWrappedCard } from "@/components/conquest-wrapped-card";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { deleteFile, uploadFileDirectly } from "@/lib/storage-R2";
import {
  AchievementCategory,
  AchievementResponse,
  addEvidence,
  addTag,
  createAchievement,
  deleteAchievement,
  getAchievements,
  removeEvidence,
  removeTag,
  updateAchievement,
} from "@/services/achievements";
import AsyncStorageImpl from "@/services/storage";
import { getMyTags, Tag } from "@/services/tag";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PAGE_SIZE = 20;

const CATEGORY_CONFIG: Record<AchievementCategory, { label: string; color: string }> = {
  career:   { label: "Carreira",    color: "#3b82f6" },
  personal: { label: "Pessoal",     color: "#a855f7" },
  learning: { label: "Aprendizado", color: "#22c55e" },
  fitness:  { label: "Fitness",     color: "#f97316" },
};

// DD/MM/AAAA → ISO string
function toISO(str: string): string {
  const [d, m, y] = str.split("/");
  return new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T12:00:00.000Z`).toISOString();
}

function toDisplay(iso: string): string {
  const dt = new Date(iso);
  return [
    String(dt.getUTCDate()).padStart(2, "0"),
    String(dt.getUTCMonth() + 1).padStart(2, "0"),
    dt.getUTCFullYear(),
  ].join("/");
}

const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
const todayDisplay = toDisplay(new Date().toISOString());

async function getStorageUserId(): Promise<string | null> {
  try {
    const raw = await AsyncStorageImpl.getItem(AsyncStorageImpl.TOKEN_KEY);
    if (!raw) return null;
    const jwt = JSON.parse(raw).accessToken;
    const payloadB64 = jwt.split(".")[1];
    const padded = payloadB64.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((payloadB64.length % 4) || 4);
    return JSON.parse(atob(padded)).sub ?? null;
  } catch {
    return null;
  }
}

// ─── Small shared components ──────────────────────────────────────────────────

function DifficultyDots({
  level,
  onSelect,
}: {
  level: number;
  onSelect?: (n: number) => void;
}) {
  return (
    <View className="flex-row gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onSelect?.(n)} hitSlop={6} disabled={!onSelect}>
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: n <= level ? "#ffffff" : "#2a2a2a" }}
          />
        </Pressable>
      ))}
    </View>
  );
}

function CategoryBadge({ category }: { category: AchievementCategory }) {
  const { label, color } = CATEGORY_CONFIG[category];
  return (
    <View
      className="rounded px-2 py-0.5"
      style={{ backgroundColor: color + "22", borderWidth: 1, borderColor: color + "55" }}
    >
      <Text style={{ color, fontSize: 11, fontWeight: "500" }}>{label}</Text>
    </View>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function AchievementSkeleton() {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={{ opacity: pulse }} className="mb-3">
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-md px-5 pt-5 pb-4">
        <View className="flex-row items-center mb-3">
          <View className="h-[15px] w-[50%] bg-[#333333] rounded" />
          <View className="flex-1" />
          <View className="h-[22px] w-20 bg-[#222222] rounded" />
        </View>
        <View className="h-[12px] w-[75%] bg-[#222222] rounded mb-1.5" />
        <View className="h-[12px] w-[45%] bg-[#222222] rounded mb-4" />
        <View className="border-t border-[#1f1f1f] pt-3 flex-row gap-2">
          <View className="h-[11px] w-16 bg-[#1a1a1a] rounded" />
          <View className="h-[11px] w-20 bg-[#1a1a1a] rounded" />
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Image Viewer Modal ───────────────────────────────────────────────────────

function ImageViewerModal({
  evidence,
  onClose,
  onRemove,
}: {
  evidence: { id: string; storagePath: string; fileType: string | null; caption: string | null } | null;
  onClose: () => void;
  onRemove: () => void;
}) {
  const insets = useSafeAreaInsets();

  const confirmRemove = () => {
    Alert.alert("Remover evidência", "Deseja remover esta evidência?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => { onRemove(); onClose(); } },
    ]);
  };

  return (
    <Modal visible={!!evidence} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 bg-black" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {/* Close */}
        <View className="flex-row justify-end px-4 pt-3 pb-2">
          <Pressable onPress={onClose} hitSlop={12} className="p-2 active:opacity-50">
            <Feather name="x" size={22} color="#ffffff" />
          </Pressable>
        </View>

        {/* Image */}
        <View className="flex-1">
          {evidence && (
            <Image
              source={{ uri: evidence.storagePath }}
              style={{ flex: 1, width: "100%" }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          )}
        </View>

        {/* Footer */}
        <View className="px-5 pt-4 pb-3 gap-3">
          {evidence?.caption ? (
            <Text className="text-[#999999] text-[13px] text-center">{evidence.caption}</Text>
          ) : null}
          <Pressable
            onPress={confirmRemove}
            className="flex-row items-center justify-center gap-2 border border-[#3a1a1a] bg-[#1a0a0a] rounded-md py-3 active:opacity-70"
          >
            <Feather name="trash-2" size={14} color="#ef4444" />
            <Text style={{ color: "#ef4444", fontSize: 13, fontWeight: "500" }}>Remover evidência</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Achievement Card ─────────────────────────────────────────────────────────

function AchievementCard({
  achievement,
  index,
  onView,
  onEdit,
  onDelete,
  onAddEvidence,
  onRemoveEvidence,
  onManageTags,
  onRemoveTag,
}: {
  achievement: AchievementResponse;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddEvidence: () => void;
  onRemoveEvidence: (evidenceId: string) => void;
  onManageTags: () => void;
  onRemoveTag: (tagId: string) => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const [viewingEvidence, setViewingEvidence] = useState<{
    id: string;
    storagePath: string;
    fileType: string | null;
    caption: string | null;
  } | null>(null);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      delay: Math.min(index * 40, 160),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
      }}
      className="mb-3"
    >
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-md  border-l-[#f59e0b50] border-l-4 px-5 pt-5 pb-4">
        {/* Title row */}
        <View className="flex-row items-start mb-3">
          <Text className="flex-1 text-white text-[15px] font-semibold mr-3" numberOfLines={2}>
            {achievement.title}
          </Text>
          <View className="flex-row gap-1">
            <Pressable onPress={onView} hitSlop={8} className="p-2 active:opacity-40">
              <Feather name="eye" size={13} color="#666666" />
            </Pressable>
            <Pressable onPress={onEdit} hitSlop={8} className="p-2 active:opacity-40">
              <Feather name="edit-2" size={13} color="#666666" />
            </Pressable>
            <Pressable onPress={onDelete} hitSlop={8} className="p-2 active:opacity-40">
              <Feather name="trash-2" size={13} color="#666666" />
            </Pressable>
          </View>
        </View>

        {/* Meta: category + difficulty + date */}
        <View className="flex-row items-center gap-3 mb-3 flex-wrap">
          <CategoryBadge category={achievement.achievementCategory} />
          <DifficultyDots level={achievement.difficultyLevel} />
          <Text className="text-[#666666] text-[12px]">{toDisplay(achievement.achievedAt)}</Text>
        </View>

        {/* Description */}
        {!!achievement.description && (
          <Text className="text-[#666666] text-[13px] leading-5 mb-3">
            {achievement.description}
          </Text>
        )}

        {/* Evidences */}
        {achievement.evidences.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3 -mx-1"
            contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
          >
            {achievement.evidences.map((ev) => {
              const isImage = ev.fileType?.startsWith("image/");
              return (
                <Pressable
                  key={ev.id}
                  onPress={() => {
                    if (isImage) {
                      setViewingEvidence(ev);
                    } else {
                      WebBrowser.openBrowserAsync(ev.storagePath);
                    }
                  }}
                  className="active:opacity-70"
                >
                  {isImage ? (
                  <Image
                   source={{ uri: ev.storagePath }}
                   style={{ width: 64, height: 64, borderRadius: 8 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
/>
                  ) : (
                    <View className="w-16 h-16 rounded-md bg-[#1a1a1a] border border-[#1f1f1f] items-center justify-center gap-1">
                      <Feather name="file-text" size={22} color="#666666" />
                      <Text className="text-[#555555] text-[9px] font-medium">
                        {ev.fileType?.split("/")[1]?.toUpperCase() ?? "FILE"}
                      </Text>
                    </View>
                  )}
                  {ev.caption ? (
                    <Text className="text-[#666666] text-[10px] mt-0.5 w-16" numberOfLines={1}>
                      {ev.caption}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <ImageViewerModal
          evidence={viewingEvidence}
          onClose={() => setViewingEvidence(null)}
          onRemove={() => {
            if(viewingEvidence?.id) {
              onRemoveEvidence(viewingEvidence.id)
            }
          } }
        />

        {/* Footer: tags + add evidence */}
        <View className="border-t border-[#1f1f1f] pt-3 gap-2">
          <View className="flex-row flex-wrap gap-2 items-center">
            {achievement.tags.map((tag) => (
              <Pressable
                key={tag.id}
                onPress={() => onRemoveTag(tag.id)}
                hitSlop={4}
                className="flex-row items-center gap-1 bg-[#1a1a1a] border border-[#1f1f1f] rounded px-2 py-0.5 active:opacity-50"
              >
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.colorHex }} />
                <Text className="text-[#666666] text-[11px]">{tag.name}</Text>
                <Feather name="x" size={9} color="#555555" />
              </Pressable>
            ))}
            <Pressable
              onPress={onManageTags}
              hitSlop={4}
              className="flex-row items-center gap-1 border border-dashed border-[#2a2a2a] rounded px-2 py-0.5 active:opacity-50"
            >
              <Feather name="tag" size={10} color="#555555" />
              <Feather name="plus" size={9} color="#555555" />
            </Pressable>
          </View>

          <Pressable
            onPress={onAddEvidence}
            className="flex-row items-center gap-1 self-start active:opacity-50"
          >
            <Feather name="paperclip" size={12} color="#666666" />
            <Text className="text-[#666666] text-[12px]">
              {achievement.evidences.length > 0
                ? `${achievement.evidences.length} evidência${achievement.evidences.length !== 1 ? "s" : ""}`
                : "Adicionar evidência"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Achievement Sheet (create / edit) ───────────────────────────────────────

function AchievementSheet({
  visible,
  isEdit,
  initial,
  saving,
  onClose,
  onSave,
}: {
  visible: boolean;
  isEdit: boolean;
  initial: Partial<AchievementResponse>;
  saving: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    category: AchievementCategory;
    difficultyLevel: number;
    achievedAt: string;
  }) => void;
}) {
  const slide = useRef(new Animated.Value(700)).current;
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AchievementCategory>("personal");
  const [difficulty, setDifficulty] = useState(3);
  const [date, setDate] = useState(todayDisplay);

  useEffect(() => {
    if (visible) {
      setTitle(initial.title ?? "");
      setDescription(initial.description ?? "");
      setCategory(initial.achievementCategory ?? "personal");
      setDifficulty(initial.difficultyLevel ?? 3);
      setDate(initial.achievedAt ? toDisplay(initial.achievedAt) : todayDisplay);
      setModalVisible(true);
      Animated.spring(slide, { toValue: 0, damping: 25, stiffness: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slide, { toValue: 700, duration: 240, useNativeDriver: true }).start(
        () => setModalVisible(false)
      );
    }
  }, [visible]);

  const dateValid = DATE_REGEX.test(date);
  const canSave = title.trim().length > 0 && dateValid && !saving;

  const formatDateInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  return (
    <Modal transparent visible={modalVisible} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable className="flex-1 " onPress={onClose} />

        <Animated.View
          style={{ transform: [{ translateY: slide }] }}
          className="bg-[#111111] border-t border-[#1f1f1f] px-6 pt-6 pb-10"
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View className="flex-row items-center mb-6">
              <Text className="flex-1 text-white text-base font-semibold">
                {isEdit ? "Editar conquista" : "Nova conquista"}
              </Text>
              <Pressable onPress={onClose} hitSlop={10} className="active:opacity-50">
                <Feather name="x" size={18} color="#666666" />
              </Pressable>
            </View>

            {/* Title */}
            <Text className="text-[#666666] text-[11px] tracking-widest mb-2">TÍTULO</Text>
            <View className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-md mb-4">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Nome da conquista"
                placeholderTextColor="#666666"
                className="text-white text-[15px] px-4 py-[14px]"
              />
            </View>

            {/* Description */}
            <Text className="text-[#666666] text-[11px] tracking-widest mb-2">
              DESCRIÇÃO{" "}
              <Text className="normal-case tracking-normal text-[10px]">(opcional)</Text>
            </Text>
            <View className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-md mb-4">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva sua conquista..."
                placeholderTextColor="#666666"
                className="text-white text-[15px] px-4 py-[14px]"
                multiline
                style={{ minHeight: 72, textAlignVertical: "top" }}
                autoCapitalize="sentences"
              />
            </View>

            {/* Category */}
            <Text className="text-[#666666] text-[11px] tracking-widest mb-2">CATEGORIA</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {(Object.keys(CATEGORY_CONFIG) as AchievementCategory[]).map((cat) => {
                const { label, color } = CATEGORY_CONFIG[cat];
                const active = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className="rounded-md px-3 py-2 active:opacity-70"
                    style={{
                      backgroundColor: active ? color + "33" : "#0a0a0a",
                      borderWidth: 1,
                      borderColor: active ? color : "#1f1f1f",
                    }}
                  >
                    <Text style={{ color: active ? color : "#666666", fontSize: 13, fontWeight: "500" }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Difficulty */}
            <Text className="text-[#666666] text-[11px] tracking-widest mb-3">DIFICULDADE</Text>
            <View className="flex-row items-center gap-4 mb-4">
              <DifficultyDots level={difficulty} onSelect={setDifficulty} />
              <Text className="text-[#666666] text-[12px]">{difficulty}/5</Text>
            </View>

            {/* Date */}
            <Text className="text-[#666666] text-[11px] tracking-widest mb-2">DATA</Text>
            <View
              className="bg-[#0a0a0a] rounded-md mb-7"
              style={{ borderWidth: 1, borderColor: dateValid || !date ? "#1f1f1f" : "#ef4444" }}
            >
              <TextInput
                value={date}
                onChangeText={(v) => setDate(formatDateInput(v))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#666666"
                className="text-white text-[15px] px-4 py-[14px]"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {/* Save */}
            <Pressable
              onPress={() =>
                canSave &&
                onSave({ title: title.trim(), description: description.trim(), category, difficultyLevel: difficulty, achievedAt: toISO(date) })
              }
              disabled={!canSave}
              className={`rounded-md py-[15px] items-center active:opacity-75 ${canSave ? "bg-white" : "bg-[#1a1a1a]"}`}
            >
              {saving ? (
                <ActivityIndicator color="#0a0a0a" size="small" />
              ) : (
                <Text className={`text-[15px] font-semibold ${canSave ? "text-[#0a0a0a]" : "text-[#666666]"}`}>
                  {isEdit ? "Salvar" : "Criar"}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Tag Picker Sheet ─────────────────────────────────────────────────────────

function TagPickerSheet({
  visible,
  currentTagIds,
  onClose,
  onToggle,
}: {
  visible: boolean;
  currentTagIds: string[];
  onClose: () => void;
  onToggle: (tag: Tag, isAdded: boolean) => void;
}) {
  const slide = useRef(new Animated.Value(500)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setLoadingTags(true);
      getMyTags({ page: 0, size: 50 })
        .then((res) => setTags(res.content))
        .finally(() => setLoadingTags(false));
      Animated.spring(slide, { toValue: 0, damping: 25, stiffness: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slide, { toValue: 500, duration: 240, useNativeDriver: true }).start(
        () => setModalVisible(false)
      );
    }
  }, [visible]);

  return (
    <Modal transparent visible={modalVisible} onRequestClose={onClose} statusBarTranslucent>
      <Pressable className="flex-1 " onPress={onClose} />
      <Animated.View
        style={{ transform: [{ translateY: slide }] }}
        className="bg-[#111111] border-t border-[#1f1f1f] px-6 pt-6 pb-10"
      >
        <View className="flex-row items-center mb-5">
          <Text className="flex-1 text-white text-base font-semibold">Gerenciar tags</Text>
          <Pressable onPress={onClose} hitSlop={10} className="active:opacity-50">
            <Feather name="x" size={18} color="#666666" />
          </Pressable>
        </View>

        {loadingTags ? (
          <ActivityIndicator color="#666666" style={{ paddingVertical: 24 }} />
        ) : tags.length === 0 ? (
          <Text className="text-[#666666] text-[13px] text-center py-6">Nenhuma tag criada ainda</Text>
        ) : (
          <View className="flex-row flex-wrap gap-2 pb-2">
            {tags.map((tag) => {
              const isAdded = currentTagIds.includes(tag.id);
              return (
                <Pressable
                  key={tag.id}
                  onPress={() => onToggle(tag, isAdded)}
                  className="flex-row items-center gap-1.5 rounded px-3 py-2 active:opacity-60"
                  style={{
                    backgroundColor: isAdded ? tag.colorHex + "22" : "#1a1a1a",
                    borderWidth: 1,
                    borderColor: isAdded ? tag.colorHex + "88" : "#1f1f1f",
                  }}
                >
                  <View className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.colorHex }} />
                  <Text style={{ color: isAdded ? "#ffffff" : "#666666", fontSize: 13 }}>{tag.name}</Text>
                  {isAdded && <Feather name="check" size={11} color={tag.colorHex} />}
                </Pressable>
              );
            })}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

// ─── Evidence Sheet ───────────────────────────────────────────────────────────

function EvidenceSheet({
  visible,
  saving,
  onClose,
  onSave,
}: {
  visible: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (data: { localUri: string; fileType: string; caption: string }) => void;
}) {
  const slide = useRef(new Animated.Value(500)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [file, setFile] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (visible) {
      setFile(null);
      setCaption("");
      setModalVisible(true);
      Animated.spring(slide, { toValue: 0, damping: 25, stiffness: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slide, { toValue: 500, duration: 240, useNativeDriver: true }).start(
        () => setModalVisible(false)
      );
    }
  }, [visible]);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Permita acesso à galeria nas configurações.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFile({ uri: asset.uri, type: asset.mimeType ?? "image/jpeg", name: asset.fileName ?? `${Date.now()}.jpg` });
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Permita acesso à câmera nas configurações.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.85 });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFile({ uri: asset.uri, type: asset.mimeType ?? "image/jpeg", name: asset.fileName ?? `${Date.now()}.jpg` });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFile({ uri: asset.uri, type: asset.mimeType ?? "application/octet-stream", name: asset.name });
    }
  };

  const canSave = !!file && !saving;
  const isImage = file?.type.startsWith("image/");

  return (
    <Modal transparent visible={modalVisible} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable className="flex-1 " onPress={onClose} />

        <Animated.View
          style={{ transform: [{ translateY: slide }] }}
          className="bg-[#111111] border-t border-[#1f1f1f] px-6 pt-6 pb-10"
        >
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Text className="flex-1 text-white text-base font-semibold">Adicionar evidência</Text>
            <Pressable onPress={onClose} hitSlop={10} className="active:opacity-50">
              <Feather name="x" size={18} color="#666666" />
            </Pressable>
          </View>

          {/* Picker / Preview */}
          {file ? (
            <View className="mb-5">
              {isImage ? (
                <Image
                  source={{ uri: file.uri }}
                  style={{ width: "100%", height: 192, borderRadius: 8 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-full h-24 rounded-md bg-[#1a1a1a] border border-[#1f1f1f] flex-row items-center px-5 gap-4">
                  <Feather name="file-text" size={28} color="#666666" />
                  <Text className="flex-1 text-white text-[13px]" numberOfLines={2}>{file.name}</Text>
                </View>
              )}
              <Pressable onPress={() => setFile(null)} className="mt-2 self-center active:opacity-50">
                <Text className="text-[#666666] text-[12px]">Trocar arquivo</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row gap-2 mb-5">
              <Pressable
                onPress={pickFromCamera}
                className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded-md py-5 items-center gap-2 active:opacity-70"
              >
                <Feather name="camera" size={20} color="#666666" />
                <Text className="text-[#666666] text-[12px]">Câmera</Text>
              </Pressable>
              <Pressable
                onPress={pickFromGallery}
                className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded-md py-5 items-center gap-2 active:opacity-70"
              >
                <Feather name="image" size={20} color="#666666" />
                <Text className="text-[#666666] text-[12px]">Galeria</Text>
              </Pressable>
              <Pressable
                onPress={pickDocument}
                className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded-md py-5 items-center gap-2 active:opacity-70"
              >
                <Feather name="file-text" size={20} color="#666666" />
                <Text className="text-[#666666] text-[12px]">Arquivo</Text>
              </Pressable>
            </View>
          )}

          {/* Caption */}
          <Text className="text-[#666666] text-[11px] tracking-widest mb-2">
            LEGENDA <Text className="normal-case tracking-normal text-[10px]">(opcional)</Text>
          </Text>
          <View className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-md mb-7">
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Descreva a evidência..."
              placeholderTextColor="#666666"
              className="text-white text-[15px] px-4 py-[14px]"
              autoCapitalize="sentences"
            />
          </View>

          {/* Save */}
          <Pressable
            onPress={() => canSave && onSave({ localUri: file!.uri, fileType: file!.type, caption: caption.trim() })}
            disabled={!canSave}
            className={`rounded-md py-[15px] items-center active:opacity-75 ${canSave ? "bg-white" : "bg-[#1a1a1a]"}`}
          >
            {saving ? (
              <ActivityIndicator color="#0a0a0a" size="small" />
            ) : (
              <Text className={`text-[15px] font-semibold ${canSave ? "text-[#0a0a0a]" : "text-[#666666]"}`}>
                Salvar
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function ConquistasTab({ groupId }: { groupId: string }) {
  const toast = useToast();

  const [achievements, setAchievements] = useState<AchievementResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const [evidenceSheetVisible, setEvidenceSheetVisible] = useState(false);
  const [evidenceTargetId, setEvidenceTargetId] = useState<string | null>(null);
  const [savingEvidence, setSavingEvidence] = useState(false);

  const [tagPickerVisible, setTagPickerVisible] = useState(false);
  const [tagPickerTargetId, setTagPickerTargetId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [wrappedAchievement, setWrappedAchievement] = useState<AchievementResponse | null>(null);
  const fetchIdRef = useRef(0);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);


  const showError = (msg: string) =>
    toast.show({
      render: () => (
        <Toast action="error">
          <ToastTitle>Erro</ToastTitle>
          <ToastDescription>{msg}</ToastDescription>
        </Toast>
      ),
    });

  const fetchAchievements = useCallback(async (pageNum: number, append: boolean, target: string) => {
    const id = ++fetchIdRef.current;
    try {
      const result = await getAchievements(groupId, { page: pageNum, size: PAGE_SIZE, target: target || undefined });
      if (id !== fetchIdRef.current) return;
      setAchievements((prev) => (append ? [...prev, ...result.content] : result.content));
      setHasMore(pageNum < result.totalPages - 1);
      setPage(pageNum);
    } catch {
      if (id !== fetchIdRef.current) return;
      showError("Falha ao carregar conquistas");
    } finally {
      if (id !== fetchIdRef.current) return;
      setLoading(false);
      setLoadingMore(false);
      setSearching(false);
    }
  }, [groupId]);

  useEffect(() => {
    const isInitial = isInitialLoad.current;
    isInitialLoad.current = false;
    if (isInitial) {
      setLoading(true);
    } else {
      setSearching(true);
    }
    setAchievements([]);
    setPage(0);
    setHasMore(true);
    fetchAchievements(0, false, debouncedSearch);
  }, [debouncedSearch, fetchAchievements]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchAchievements(page + 1, true, debouncedSearch);
  };

  // ── CRUD ──

  const handleSave = async (data: {
    title: string;
    description: string;
    category: AchievementCategory;
    difficultyLevel: number;
    achievedAt: string;
  }) => {
    setSaving(true);

    if (editingAchievement) {
      const snapshot = achievements;
      setAchievements((cur) =>
        cur.map((a) => a.id === editingAchievement.id ? { ...a, ...data, achievementCategory: data.category } : a)
      );
      setSheetVisible(false);
      try {
        await updateAchievement(groupId, editingAchievement.id, {
          title: data.title,
          description: data.description || undefined,
          category: data.category,
          difficultyLevel: data.difficultyLevel,
          achievedAt: data.achievedAt,
        });
      } catch {
        setAchievements(snapshot);
        showError("Falha ao atualizar conquista");
      } finally {
        setSaving(false);
      }
    } else {
      const tempId = `temp_${Date.now()}`;
      const tempItem: AchievementResponse = {
        id: tempId,
        groupId,
        title: data.title,
        description: data.description || null,
        achievementCategory: data.category,
        difficultyLevel: data.difficultyLevel,
        achievedAt: data.achievedAt,
        createdAt: new Date().toISOString(),
        tags: [],
        evidences: [],
      };
      setAchievements((cur) => [tempItem, ...cur]);
      setSheetVisible(false);
      try {
        const { id } = await createAchievement(groupId, {
          title: data.title,
          description: data.description || undefined,
          category: data.category,
          difficultyLevel: data.difficultyLevel,
          achievedAt: data.achievedAt,
        });
        setAchievements((cur) => cur.map((a) => a.id === tempId ? { ...a, id } : a));
      } catch {
        setAchievements((cur) => cur.filter((a) => a.id !== tempId));
        showError("Falha ao criar conquista");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = (achievement: AchievementResponse) => {
    Alert.alert("Deletar conquista", `Deseja deletar "${achievement.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: async () => {
          const snapshot = achievements;
          setAchievements((cur) => cur.filter((a) => a.id !== achievement.id));
          try {
            await deleteAchievement(groupId, achievement.id);
          } catch {
            setAchievements(snapshot);
            showError("Falha ao deletar conquista");
          }
        },
      },
    ]);
  };

  // ── Evidence ──

const handleAddEvidence = async (data: {
  localUri: string;
  fileType: string;
  caption: string;
}) => {
  if (!evidenceTargetId) return;
  setSavingEvidence(true);

  const userId = await getStorageUserId();
  if (!userId) {
    showError("Usuário não autenticado");
    setSavingEvidence(false);
    return;
  }

  const tempEvidenceId = `temp_ev_${Date.now()}`;
  const tempEvidence = {
    id: tempEvidenceId,
    storagePath: data.localUri,
    fileType: data.fileType,
    caption: data.caption || null,
    uploadedAt: new Date().toISOString(),
  };

  setAchievements((cur) =>
    cur.map((a) =>
      a.id === evidenceTargetId ? { ...a, evidences: [...a.evidences, tempEvidence] } : a
    )
  );
  setEvidenceSheetVisible(false);

  try {
    const { storagePath } = await uploadFileDirectly({
      localUri: data.localUri,
      fileType: data.fileType,
      type: evidenceTargetId,
    });

    const { id } = await addEvidence(groupId, evidenceTargetId, {
      storagePath,
      fileType: data.fileType,
      caption: data.caption || undefined,
    });

    setAchievements((cur) =>
      cur.map((a) =>
        a.id === evidenceTargetId
          ? {
              ...a,
              evidences: a.evidences.map((ev) =>
                ev.id === tempEvidenceId ? { ...ev, id, storagePath } : ev
              ),
            }
          : a
      )
    );
  } catch {
    setAchievements((cur) =>
      cur.map((a) =>
        a.id === evidenceTargetId
          ? { ...a, evidences: a.evidences.filter((ev) => ev.id !== tempEvidenceId) }
          : a
      )
    );
    showError("Falha ao adicionar evidência");
  } finally {
    setSavingEvidence(false);
  }
};
  const handleRemoveEvidence = async (achievementId: string, evidenceId: string) => {
    const achievement = achievements.find((a) => a.id === achievementId);
    const evidence = achievement?.evidences.find((ev) => ev.id === evidenceId);

    const snapshot = achievements;
    setAchievements((cur) =>
      cur.map((a) =>
        a.id === achievementId
          ? { ...a, evidences: a.evidences.filter((ev) => ev.id !== evidenceId) }
          : a
      )
    );
    try {
      await removeEvidence(groupId, achievementId, evidenceId);
      if (
        evidence?.storagePath &&
        !evidence.storagePath.startsWith("file://") &&
        !evidence.storagePath.startsWith("ph://")
      ) {
        await deleteFile(evidence.storagePath);
      }
    } catch {
      setAchievements(snapshot);
      showError("Falha ao remover evidência");
    }
  };

  // ── Tags ──

  const handleToggleTag = async (tag: Tag, isAdded: boolean) => {
    const targetId = tagPickerTargetId;
    if (!targetId) return;

    setAchievements((cur) =>
      cur.map((a) => {
        if (a.id !== targetId) return a;
        return isAdded
          ? { ...a, tags: a.tags.filter((t) => t.id !== tag.id) }
          : { ...a, tags: [...a.tags, { id: tag.id, name: tag.name, colorHex: tag.colorHex }] };
      })
    );

    try {
      if (isAdded) {
        await removeTag(groupId, targetId, tag.id);
      } else {
        await addTag(groupId, targetId, tag.id);
      }
    } catch {
      setAchievements((cur) =>
        cur.map((a) => {
          if (a.id !== targetId) return a;
          return isAdded
            ? { ...a, tags: [...a.tags, { id: tag.id, name: tag.name, colorHex: tag.colorHex }] }
            : { ...a, tags: a.tags.filter((t) => t.id !== tag.id) };
        })
      );
      showError(isAdded ? "Falha ao remover tag" : "Falha ao adicionar tag");
    }
  };

  // ── Render ──

  return (
    <View className="flex-1">
      {/* Header row */}
      <View className="flex-row items-center px-5 py-3 border-b border-[#1f1f1f]">
        <Text className="flex-1 text-[#666666] text-[13px]">
          {loading ? "" : `${achievements.length} conquista${achievements.length !== 1 ? "s" : ""}`}
        </Text>
        <Pressable
          onPress={() => { setLoading(true); fetchAchievements(0, false, debouncedSearch); }}
          disabled={loading}
          hitSlop={8}
          className="p-1.5 mr-2 active:opacity-50"
        >
          <Feather name="refresh-cw" size={14} color={loading ? "#333333" : "#666666"} />
        </Pressable>
        <Pressable
          onPress={() => { setEditingAchievement(null); setSheetVisible(true); }}
          className="bg-white rounded-md px-3 py-1.5 active:opacity-75"
        >
          <Text className="text-[#0a0a0a] text-[12px] font-semibold">+ Nova</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-[#111111] border border-[#1f1f1f] rounded-lg mx-5 my-3 px-4">
        {searching
          ? <ActivityIndicator size="small" color="#444444" />
          : <Feather name="search" size={14} color="#444444" />
        }
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar conquistas..."
          placeholderTextColor="#333333"
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-white text-[14px] py-[11px] ml-2"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} hitSlop={8}>
            <Feather name="x" size={14} color="#444444" />
          </Pressable>
        )}
      </View>

      {loading || searching ? (
        <View className="px-5 pt-3">
          {Array.from({ length: 4 }).map((_, i) => <AchievementSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AchievementCard
              achievement={item}
              index={index}
              onView={() => setWrappedAchievement(item)}
              onEdit={() => { setEditingAchievement(item); setSheetVisible(true); }}
              onDelete={() => handleDelete(item)}
              onAddEvidence={() => { setEvidenceTargetId(item.id); setEvidenceSheetVisible(true); }}
              onRemoveEvidence={(evId) => handleRemoveEvidence(item.id, evId)}
              onManageTags={() => { setTagPickerTargetId(item.id); setTagPickerVisible(true); }}
              onRemoveTag={(tagId) => {
                const tag = item.tags.find((t) => t.id === tagId);
                if (tag) { setTagPickerTargetId(item.id); handleToggleTag(tag, true); }
              }}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View className="items-center pt-16 gap-3">
              <Feather name="award" size={32} color="#333333" />
              <Text className="text-[#666666] text-[13px]">Nenhuma conquista ainda</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="py-5 items-center">
                <ActivityIndicator color="#666666" size="small" />
              </View>
            ) : null
          }
        />
      )}

      <AchievementSheet
        visible={sheetVisible}
        isEdit={editingAchievement !== null}
        initial={editingAchievement ?? {}}
        saving={saving}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
      />

      <TagPickerSheet
        visible={tagPickerVisible}
        currentTagIds={
          achievements.find((a) => a.id === tagPickerTargetId)?.tags.map((t) => t.id) ?? []
        }
        onClose={() => setTagPickerVisible(false)}
        onToggle={handleToggleTag}
      />

      <EvidenceSheet
        visible={evidenceSheetVisible}
        saving={savingEvidence}
        onClose={() => setEvidenceSheetVisible(false)}
        onSave={handleAddEvidence}
      />

      <ConquestWrappedCard
        achievement={wrappedAchievement}
        visible={wrappedAchievement !== null}
        onClose={() => setWrappedAchievement(null)}
      />
    </View>
  );
}
