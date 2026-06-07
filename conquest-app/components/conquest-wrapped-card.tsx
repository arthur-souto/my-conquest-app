import { AchievementCategory, AchievementResponse } from "@/services/achievements";
import { Feather } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot, { ViewShotRef } from "react-native-view-shot";
import { resolveImageUri, ShareCard, Template, toDisplay } from "./conquest-share-card";

const { width: SCREEN_W } = Dimensions.get("window");

const CATEGORY_CONFIG: Record<AchievementCategory, { label: string; color: string }> = {
  career:   { label: "Carreira",    color: "#3b82f6" },
  personal: { label: "Pessoal",     color: "#a855f7" },
  learning: { label: "Aprendizado", color: "#22c55e" },
  fitness:  { label: "Fitness",     color: "#f97316" },
};

type ActiveTab = "conquista" | "compartilhar";

// ── ConquestWrappedCard ────────────────────────────────────────────────────────

interface Props {
  achievement: AchievementResponse | null;
  visible: boolean;
  onClose: () => void;
}

export function ConquestWrappedCard({ achievement, visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const shotRef = useRef<ViewShotRef>(null);
  const [sharing, setSharing] = useState(false);
  const [selectedEvidenceIdx, setSelectedEvidenceIdx] = useState<number | null>(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [template, setTemplate] = useState<Template>("casual");
  const [lesson, setLesson] = useState("");
  const [lessonOpen, setLessonOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("conquista");

  useEffect(() => {
    setSelectedEvidenceIdx(achievement && achievement.evidences.length > 0 ? 0 : null);
    setPickerOpen(false);
    setTemplatePickerOpen(false);
    setTemplate("casual");
    setLesson("");
    setLessonOpen(false);
    setActiveTab("conquista");
  }, [achievement?.id]);

  if (!achievement) return null;

  const { label: categoryLabel, color: categoryColor } =
    CATEGORY_CONFIG[achievement.achievementCategory];

  const imageEvidences = achievement.evidences.filter((e) =>
    e.fileType?.startsWith("image/")
  );

  async function handleShare() {
    if (!shotRef.current) return;
    setSharing(true);
    try {
      const uri = await shotRef.current.capture();
      await Sharing.shareAsync(uri, { mimeType: "image/png" });
    } catch {
      // cancelado pelo usuário ou erro de share
    } finally {
      setSharing(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#0a0a0a]">

        {/* ── Alvo oculto do ViewShot (fora da tela) ────────────── */}
        <ViewShot
          ref={shotRef}
          options={{ format: "png", quality: 1.0 }}
          style={{ position: "absolute", top: -10000, left: 0 }}
        >
          <ShareCard
            achievement={achievement}
            categoryColor={categoryColor}
            categoryLabel={categoryLabel}
            selectedEvidence={selectedEvidenceIdx !== null ? achievement.evidences[selectedEvidenceIdx] : undefined}
            template={template}
            lesson={lesson}
          />
        </ViewShot>

        {/* ── Bloom (só na aba Conquista) ────────────────────────── */}
        {activeTab === "conquista" ? (
          <>
            <View
              style={{
                position: "absolute",
                top: -100,
                left: -80,
                width: SCREEN_W + 160,
                height: 520,
                backgroundColor: categoryColor,
                opacity: 0.1,
                borderBottomLeftRadius: 999,
                borderBottomRightRadius: 999,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: -160,
                right: -100,
                width: 360,
                height: 360,
                backgroundColor: categoryColor,
                opacity: 0.06,
                borderRadius: 999,
              }}
            />
          </>
        ) : null}

        {/* ── Barra de topo: tabs + fechar ──────────────────────── */}
        <View style={{ paddingTop: insets.top }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              height: 52,
            }}
          >
            {/* Tabs */}
            <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
              {(["conquista", "compartilhar"] as ActiveTab[]).map((tab) => {
                const active = activeTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, position: "relative" }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: active ? "700" : "500",
                        color: active ? "#ffffff" : "#555555",
                      }}
                    >
                      {tab === "conquista" ? "Conquista" : "Compartilhar"}
                    </Text>
                    {active && (
                      <View
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 14,
                          right: 14,
                          height: 2,
                          borderRadius: 999,
                          backgroundColor: categoryColor,
                        }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Fechar */}
            <Pressable onPress={onClose} hitSlop={12} className="active:opacity-50">
              <View
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: "#ffffff18" }}
              >
                <Feather name="x" size={18} color="#ffffff" />
              </View>
            </Pressable>
          </View>

          {/* Divisor */}
          <View style={{ height: 1, backgroundColor: "#1f1f1f" }} />
        </View>

        {/* ════════════════════════════════════════════════════════
            ABA — CONQUISTA
            ════════════════════════════════════════════════════════ */}
        {activeTab === "conquista" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 32, paddingBottom: insets.bottom + 40 }}
          >
            {/* Hero */}
            <View style={{ paddingHorizontal: 28 }}>
              <Animated.View entering={FadeInDown.delay(80).springify()}>
                <View
                  className="self-start rounded-full px-4 py-1 mb-5"
                  style={{
                    backgroundColor: categoryColor + "28",
                    borderWidth: 1,
                    borderColor: categoryColor + "60",
                  }}
                >
                  <Text
                    style={{ color: categoryColor, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 }}
                  >
                    {categoryLabel.toUpperCase()}
                  </Text>
                </View>
              </Animated.View>

              <Animated.Text
                entering={FadeInDown.delay(160).springify()}
                style={{
                  color: "#ffffff",
                  fontSize: 40,
                  fontWeight: "800",
                  lineHeight: 46,
                  letterSpacing: -0.8,
                  marginBottom: 24,
                }}
              >
                {achievement.title}
              </Animated.Text>

              <Animated.View
                entering={FadeInDown.delay(240).springify()}
                className="flex-row items-center gap-3"
              >
                <Text style={{ color: "#666666", fontSize: 11, letterSpacing: 1.5 }}>
                  DIFICULDADE
                </Text>
                <View className="flex-row gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <View
                      key={n}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        backgroundColor:
                          n <= achievement.difficultyLevel ? categoryColor : "#2a2a2a",
                      }}
                    />
                  ))}
                </View>
              </Animated.View>
            </View>

            {/* Data */}
            <Animated.View
              entering={FadeInDown.delay(320).springify()}
              style={{ marginHorizontal: 28, marginTop: 40 }}
            >
              <View
                className="rounded-2xl px-6 py-6"
                style={{ backgroundColor: "#111111", borderWidth: 1, borderColor: "#1f1f1f" }}
              >
                <Text style={{ color: "#666666", fontSize: 11, letterSpacing: 1.5, marginBottom: 6 }}>
                  CONQUISTADO EM
                </Text>
                <Text
                  style={{ color: "#ffffff", fontSize: 32, fontWeight: "800", letterSpacing: -0.5 }}
                >
                  {toDisplay(achievement.achievedAt)}
                </Text>
              </View>
            </Animated.View>

            {/* Stats */}
            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              style={{ flexDirection: "row", gap: 12, marginHorizontal: 28, marginTop: 12 }}
            >
              <View
                className="flex-1 rounded-2xl px-5 py-5"
                style={{ backgroundColor: "#111111", borderWidth: 1, borderColor: "#1f1f1f" }}
              >
                <Text style={{ color: "#666666", fontSize: 11, letterSpacing: 1.5, marginBottom: 4 }}>
                  TAGS
                </Text>
                <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: "800" }}>
                  {achievement.tags.length}
                </Text>
              </View>
              <View
                className="flex-1 rounded-2xl px-5 py-5"
                style={{ backgroundColor: "#111111", borderWidth: 1, borderColor: "#1f1f1f" }}
              >
                <Text style={{ color: "#666666", fontSize: 11, letterSpacing: 1.5, marginBottom: 4 }}>
                  EVIDÊNCIAS
                </Text>
                <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: "800" }}>
                  {achievement.evidences.length}
                </Text>
              </View>
            </Animated.View>

            {/* Descrição */}
            {achievement.description ? (
              <Animated.View
                entering={FadeInDown.delay(480).springify()}
                style={{ marginHorizontal: 28, marginTop: 12 }}
              >
                <View
                  className="rounded-2xl px-6 py-6"
                  style={{
                    backgroundColor: categoryColor + "0e",
                    borderWidth: 1,
                    borderColor: categoryColor + "30",
                  }}
                >
                  <Text
                    style={{ color: "#666666", fontSize: 11, letterSpacing: 1.5, marginBottom: 10 }}
                  >
                    DESCRIÇÃO
                  </Text>
                  <Text style={{ color: "#e0e0e0", fontSize: 16, lineHeight: 24 }}>
                    {achievement.description}
                  </Text>
                </View>
              </Animated.View>
            ) : null}

            {/* Tags */}
            {achievement.tags.length > 0 ? (
              <Animated.View
                entering={FadeInDown.delay(560).springify()}
                style={{ marginHorizontal: 28, marginTop: 24 }}
              >
                <Text
                  style={{ color: "#666666", fontSize: 11, letterSpacing: 1.5, marginBottom: 12 }}
                >
                  TAGS
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {achievement.tags.map((tag) => (
                    <View
                      key={tag.id}
                      className="rounded-full px-4 py-2"
                      style={{
                        backgroundColor: tag.colorHex + "22",
                        borderWidth: 1,
                        borderColor: tag.colorHex + "55",
                      }}
                    >
                      <Text style={{ color: tag.colorHex, fontSize: 13, fontWeight: "600" }}>
                        {tag.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            {/* Galeria de fotos */}
            {imageEvidences.length > 0 ? (
              <Animated.View
                entering={FadeInDown.delay(640).springify()}
                style={{ marginTop: 28 }}
              >
                <Text
                  style={{
                    color: "#666666",
                    fontSize: 11,
                    letterSpacing: 1.5,
                    marginBottom: 12,
                    marginHorizontal: 28,
                  }}
                >
                  FOTOS
                </Text>
                <FlatList
                  data={imageEvidences}
                  keyExtractor={(e) => e.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 28, gap: 12 }}
                  scrollEnabled={imageEvidences.length > 1}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        width: SCREEN_W * 0.72,
                        height: SCREEN_W * 0.72,
                        borderRadius: 20,
                        overflow: "hidden",
                        backgroundColor: "#111111",
                      }}
                    >
                      <Image
                        source={{ uri: resolveImageUri(item.storagePath) }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                      {item.caption ? (
                        <View
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "#000000aa",
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                          }}
                        >
                          <Text
                            style={{ color: "#ffffff", fontSize: 13, lineHeight: 18 }}
                            numberOfLines={2}
                          >
                            {item.caption}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  )}
                />
              </Animated.View>
            ) : null}
          </ScrollView>
        ) : null}

        {/* ════════════════════════════════════════════════════════
            ABA — COMPARTILHAR
            ════════════════════════════════════════════════════════ */}
        {activeTab === "compartilhar" ? (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 24, paddingBottom: insets.bottom + 160 }}
            >
              <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#1f1f1f" }}>
                <ShareCard
                  achievement={achievement}
                  categoryColor={categoryColor}
                  categoryLabel={categoryLabel}
                  selectedEvidence={
                    selectedEvidenceIdx !== null
                      ? achievement.evidences[selectedEvidenceIdx]
                      : undefined
                  }
                  template={template}
                  lesson={lesson}
                />
              </View>
            </ScrollView>

            {/* ── Rodapé fixo ─────────────────────────────────────── */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                paddingTop: 12,
                paddingBottom: insets.bottom + 16,
                backgroundColor: "#0a0a0a",
                borderTopWidth: 1,
                borderTopColor: "#1f1f1f",
              }}
            >
              {/* Picker de evidência */}
              {pickerOpen && achievement.evidences.length > 0 ? (
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      color: "#666666",
                      fontSize: 11,
                      letterSpacing: 1.5,
                      marginBottom: 8,
                      marginHorizontal: 24,
                    }}
                  >
                    EVIDÊNCIA DO CARD
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
                  >
                    <Pressable
                      onPress={() => setSelectedEvidenceIdx(null)}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 10,
                        backgroundColor: "#111111",
                        borderWidth: selectedEvidenceIdx === null ? 2 : 1,
                        borderColor: selectedEvidenceIdx === null ? categoryColor : "#2a2a2a",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name="slash" size={20} color="#666666" />
                    </Pressable>

                    {achievement.evidences.map((ev, idx) => {
                      const evIsImage = ev.fileType?.startsWith("image/") ?? false;
                      const selected = selectedEvidenceIdx === idx;
                      return (
                        <Pressable
                          key={ev.id}
                          onPress={() => setSelectedEvidenceIdx(idx)}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 10,
                            overflow: "hidden",
                            borderWidth: 2,
                            borderColor: selected ? categoryColor : "transparent",
                            backgroundColor: "#111111",
                          }}
                        >
                          {evIsImage ? (
                            <Image
                              source={{ uri: resolveImageUri(ev.storagePath) }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                              <Feather
                                name="file-text"
                                size={20}
                                color={selected ? categoryColor : "#666666"}
                              />
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              {/* Campo "O que aprendi" */}
              {lessonOpen ? (
                <View style={{ marginHorizontal: 24, marginBottom: 10 }}>
                  <TextInput
                    value={lesson}
                    onChangeText={(t) => setLesson(t.slice(0, 120))}
                    placeholder="O que aprendi com essa conquista..."
                    placeholderTextColor="#444444"
                    multiline
                    maxLength={120}
                    style={{
                      backgroundColor: "#111111",
                      borderWidth: 1,
                      borderColor: lesson.length > 0 ? categoryColor + "60" : "#2a2a2a",
                      borderRadius: 12,
                      padding: 14,
                      maxHeight: 90,
                      color: "#ffffff",
                      fontSize: 14,
                      lineHeight: 20,
                      textAlignVertical: "top",
                    }}
                  />
                  <Text
                    style={{
                      color: "#666666",
                      fontSize: 11,
                      textAlign: "right",
                      marginTop: 4,
                    }}
                  >
                    {lesson.length}/120
                  </Text>
                </View>
              ) : null}

              {/* Seletor de template */}
              {templatePickerOpen ? (
                <View style={{ flexDirection: "row", gap: 8, marginHorizontal: 24, marginBottom: 10 }}>
                  {(["casual", "professional"] as Template[]).map((t) => {
                    const active = template === t;
                    return (
                      <Pressable
                        key={t}
                        onPress={() => setTemplate(t)}
                        style={{
                          flex: 1,
                          height: 40,
                          borderRadius: 10,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: active ? categoryColor + "22" : "#111111",
                          borderWidth: 1,
                          borderColor: active ? categoryColor : "#2a2a2a",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: active ? "700" : "400",
                            color: active ? categoryColor : "#666666",
                          }}
                        >
                          {t === "casual" ? "Casual" : "Profissional"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {/* Linha de botões */}
              <View style={{ flexDirection: "row", gap: 10, marginHorizontal: 24 }}>
                {/* Botão "O que aprendi" */}
                <Pressable
                  disabled={template !== "professional"}
                  onPress={() => {
                    setLessonOpen((v) => !v);
                    setPickerOpen(false);
                    setTemplatePickerOpen(false);
                  }}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: lessonOpen ? categoryColor + "22" : "#111111",
                    borderWidth: 1,
                    borderColor: lessonOpen ? categoryColor : lesson.length > 0 ? categoryColor + "60" : "#2a2a2a",
                    opacity: template !== "professional" ? 0.35 : 1,
                  }}
                >
                  <Feather
                    name="edit-2"
                    size={20}
                    color={lessonOpen && template === "professional" ? categoryColor : lesson.length > 0 ? categoryColor : "#666666"}
                  />
                </Pressable>

                {/* Botão template */}
                <Pressable
                  onPress={() => {
                    setTemplatePickerOpen((v) => !v);
                    setPickerOpen(false);
                    setLessonOpen(false);
                  }}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: templatePickerOpen ? categoryColor + "22" : "#111111",
                    borderWidth: 1,
                    borderColor: templatePickerOpen ? categoryColor : "#2a2a2a",
                  }}
                >
                  <Feather
                    name="layers"
                    size={20}
                    color={templatePickerOpen ? categoryColor : "#666666"}
                  />
                </Pressable>

                {/* Botão escolher capa — só se houver evidências */}
                {achievement.evidences.length > 0 ? (
                  <Pressable
                    onPress={() => {
                      setPickerOpen((v) => !v);
                      setTemplatePickerOpen(false);
                      setLessonOpen(false);
                    }}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: pickerOpen ? categoryColor + "22" : "#111111",
                      borderWidth: 1,
                      borderColor: pickerOpen ? categoryColor : "#2a2a2a",
                    }}
                  >
                    <Feather
                      name="image"
                      size={20}
                      color={pickerOpen ? categoryColor : "#666666"}
                    />
                  </Pressable>
                ) : null}

                {/* Botão compartilhar */}
                <Pressable
                  onPress={handleShare}
                  disabled={sharing}
                  style={{
                    flex: 1,
                    height: 52,
                    backgroundColor: categoryColor,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: sharing ? 0.7 : 1,
                  }}
                >
                  {sharing ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Feather name="share-2" size={20} color="#ffffff" />
                  )}
                </Pressable>
              </View>
            </View>
          </>
        ) : null}

      </View>
    </Modal>
  );
}
