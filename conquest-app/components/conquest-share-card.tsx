
import { AchievementResponse, EvidenceSummary } from "@/services/achievements";
import { Feather } from "@expo/vector-icons";
import { Dimensions, Image, Text, View } from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");


export type Template = "casual" | "professional";

export function toDisplay(iso: string): string {
  const dt = new Date(iso);
  return [
    String(dt.getUTCDate()).padStart(2, "0"),
    String(dt.getUTCMonth() + 1).padStart(2, "0"),
    dt.getUTCFullYear(),
  ].join("/");
}

function difficultyPhrase(level: number): string {
  if (level <= 2) return "Missão cumprida 🎯";
  if (level === 3) return "Mais um nível superado 🔥";
  return "Dificuldade máxima. Superada. 💪";
}

// ── ShareCard ──────────────────────────────────────────────────────────────────
// Card de dimensões fixas capturado pelo ViewShot. Não usa ScrollView.

export function ShareCard({
  achievement,
  categoryColor,
  categoryLabel,
  selectedEvidence,
  template,
  lesson,
}: {
  achievement: AchievementResponse;
  categoryColor: string;
  categoryLabel: string;
  selectedEvidence: EvidenceSummary | undefined;
  template: Template;
  lesson?: string;
}) {
  const isImage = selectedEvidence?.fileType?.startsWith("image/") ?? false;

  // Evidência compartilhada pelos dois templates
  const evidenceNode = selectedEvidence && isImage ? (
    <Image
      source={{ uri: selectedEvidence.storagePath }}
      style={{ width: "100%", height: 170, borderRadius: 14, marginBottom: 20 }}
      resizeMode="cover"
    />
  ) : selectedEvidence && !isImage ? (
    <View
      style={{
        height: 90,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        gap: 14,
        marginBottom: 20,
        backgroundColor: template === "casual" ? "#111111" : "#1F2937",
        borderWidth: 1,
        borderColor: template === "casual" ? "#1f1f1f" : "#374151",
      }}
    >
      <Feather name="file-text" size={26} color={categoryColor} />
      <Text
        numberOfLines={2}
        style={{
          flex: 1,
          fontSize: 13,
          lineHeight: 18,
          color: template === "casual" ? "#cccccc" : "#F9FAFB",
        }}
      >
        {selectedEvidence.caption || "Documento PDF"}
      </Text>
    </View>
  ) : null;

  // ── Template: Professional ─────────────────────────────────────────────────
  if (template === "professional") {
    return (
      <View
        style={{
          width: SCREEN_W,
          backgroundColor: "#111827",
          paddingHorizontal: 28,
          paddingTop: 52,
          paddingBottom: 48,
          overflow: "hidden",
        }}
      >
        {/* Barra de cor no topo */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: categoryColor,
          }}
        />

        {/* Bloom superior */}
        <View
          style={{
            position: "absolute",
            top: -60,
            left: -60,
            width: SCREEN_W + 120,
            height: 300,
            backgroundColor: categoryColor,
            opacity: 0.06,
            borderBottomLeftRadius: 999,
            borderBottomRightRadius: 999,
          }}
        />
        {/* Orb secundário */}
        <View
          style={{
            position: "absolute",
            top: -110,
            right: -80,
            width: 260,
            height: 260,
            backgroundColor: categoryColor,
            opacity: 0.04,
            borderRadius: 999,
          }}
        />

        {/* Badge + Data */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <View
            style={{
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: categoryColor,
            }}
          >
            <Text style={{ color: categoryColor, fontSize: 10, fontWeight: "700", letterSpacing: 1.5 }}>
              {categoryLabel.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
            {toDisplay(achievement.achievedAt)}
          </Text>
        </View>

        {/* Subtítulo */}
        <Text style={{ color: "#9CA3AF", fontSize: 11, letterSpacing: 1.5, marginBottom: 6 }}>
          NOVA CONQUISTA DESBLOQUEADA
        </Text>

        {/* Título */}
        <Text
          numberOfLines={3}
          style={{
            color: "#F9FAFB",
            fontSize: 36,
            fontWeight: "800",
            lineHeight: 42,
            letterSpacing: -0.5,
            marginBottom: 8,
          }}
        >
          {achievement.title}
        </Text>

        {/* Frase de dificuldade */}
        <Text
          style={{
            color: categoryColor,
            fontSize: 13,
            fontWeight: "600",
            marginBottom: lesson ? 16 : 24,
          }}
        >
          {difficultyPhrase(achievement.difficultyLevel)}
        </Text>

        {/* Bloco "O que aprendi" */}
        {lesson ? (
          <View
            style={{
              backgroundColor: categoryColor + "12",
              borderLeftWidth: 3,
              borderLeftColor: categoryColor,
              borderRadius: 8,
              padding: 14,
              marginBottom: 24,
            }}
          >
            <Text style={{ color: categoryColor, fontSize: 28, lineHeight: 28, marginBottom: 4 }}>
              "
            </Text>
            <Text style={{ color: "#F9FAFB", fontSize: 14, fontStyle: "italic", lineHeight: 21 }}>
              {lesson}
            </Text>
          </View>
        ) : null}

        {/* Divisor */}
        <View style={{ height: 1, backgroundColor: "#374151", marginBottom: 20 }} />

        {/* Evidência */}
        {evidenceNode}

        {/* Descrição */}
        {achievement.description ? (
          <View
            style={{
              backgroundColor: "#1F2937",
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: "#374151",
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#9CA3AF", fontSize: 10, letterSpacing: 1.5, marginBottom: 6 }}>
              DESCRIÇÃO
            </Text>
            <Text numberOfLines={4} style={{ color: "#F9FAFB", fontSize: 13, lineHeight: 20 }}>
              {achievement.description}
            </Text>
          </View>
        ) : null}

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: achievement.tags.length > 0 ? 20 : 28,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#1F2937",
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: "#374151",
            }}
          >
            <Text style={{ color: "#9CA3AF", fontSize: 10, letterSpacing: 1.5, marginBottom: 2 }}>
              TAGS
            </Text>
            <Text style={{ color: "#F9FAFB", fontSize: 26, fontWeight: "800" }}>
              {achievement.tags.length}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#1F2937",
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: "#374151",
            }}
          >
            <Text style={{ color: "#9CA3AF", fontSize: 10, letterSpacing: 1.5, marginBottom: 2 }}>
              EVIDÊNCIAS
            </Text>
            <Text style={{ color: "#F9FAFB", fontSize: 26, fontWeight: "800" }}>
              {achievement.evidences.length}
            </Text>
          </View>
        </View>

        {/* Tags (máx. 6) */}
        {achievement.tags.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            {achievement.tags.slice(0, 6).map((tag) => (
              <View
                key={tag.id}
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: tag.colorHex + "18",
                  borderWidth: 1,
                  borderColor: tag.colorHex + "40",
                }}
              >
                <Text style={{ color: tag.colorHex, fontSize: 12, fontWeight: "600" }}>
                  {tag.name}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Rodapé do card */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#374151",
            paddingTop: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", gap: 5 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <View
                key={n}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  backgroundColor:
                    n <= achievement.difficultyLevel ? categoryColor : "#374151",
                }}
              />
            ))}
          </View>
          <Text style={{ color: "#9CA3AF", fontSize: 11, letterSpacing: 0.5 }}>
            @conquestapp
          </Text>
        </View>
      </View>
    );
  }

  // ── Template: Casual (padrão) ──────────────────────────────────────────────
  return (
    <View
      style={{
        width: SCREEN_W,
        backgroundColor: "#0a0a0a",
        paddingHorizontal: 28,
        paddingTop: 44,
        paddingBottom: 48,
      }}
    >
      {/* Bloom superior */}
      <View
        style={{
          position: "absolute",
          top: -60,
          left: -60,
          width: SCREEN_W + 120,
          height: 300,
          backgroundColor: categoryColor,
          opacity: 0.12,
          borderBottomLeftRadius: 999,
          borderBottomRightRadius: 999,
        }}
      />
      {/* Orb secundário */}
      <View
        style={{
          position: "absolute",
          top: -110,
          right: -80,
          width: 260,
          height: 260,
          backgroundColor: categoryColor,
          opacity: 0.07,
          borderRadius: 999,
        }}
      />

      {/* Badge de categoria */}
      <View
        style={{
          alignSelf: "flex-start",
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 5,
          backgroundColor: categoryColor + "28",
          borderWidth: 1,
          borderColor: categoryColor + "60",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: categoryColor, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 }}>
          {categoryLabel.toUpperCase()}
        </Text>
      </View>

      {/* Título */}
      <Text
        numberOfLines={3}
        style={{
          color: "#ffffff",
          fontSize: 34,
          fontWeight: "800",
          lineHeight: 40,
          letterSpacing: -0.8,
          marginBottom: 16,
        }}
      >
        {achievement.title}
      </Text>

      {/* Dificuldade */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <Text style={{ color: "#666666", fontSize: 11, letterSpacing: 1.5 }}>DIFICULDADE</Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <View
              key={n}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: n <= achievement.difficultyLevel ? categoryColor : "#2a2a2a",
              }}
            />
          ))}
        </View>
      </View>

      {/* Descrição */}
      {achievement.description ? (
        <View
          style={{
            backgroundColor: categoryColor + "0e",
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: categoryColor + "30",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "#666666", fontSize: 10, letterSpacing: 1.5, marginBottom: 6 }}>
            DESCRIÇÃO
          </Text>
          <Text numberOfLines={4} style={{ color: "#e0e0e0", fontSize: 13, lineHeight: 20 }}>
            {achievement.description}
          </Text>
        </View>
      ) : null}

      {/* Evidência */}
      {evidenceNode}

      {/* Data */}
      <View
        style={{
          backgroundColor: "#111111",
          borderRadius: 16,
          padding: 18,
          borderWidth: 1,
          borderColor: "#1f1f1f",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#666666", fontSize: 10, letterSpacing: 1.5, marginBottom: 4 }}>
          CONQUISTADO EM
        </Text>
        <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: "800", letterSpacing: -0.5 }}>
          {toDisplay(achievement.achievedAt)}
        </Text>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginBottom: achievement.tags.length > 0 ? 20 : 0,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#111111",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#1f1f1f",
          }}
        >
          <Text style={{ color: "#666666", fontSize: 10, letterSpacing: 1.5, marginBottom: 2 }}>
            TAGS
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: "800" }}>
            {achievement.tags.length}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: "#111111",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#1f1f1f",
          }}
        >
          <Text style={{ color: "#666666", fontSize: 10, letterSpacing: 1.5, marginBottom: 2 }}>
            EVIDÊNCIAS
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: "800" }}>
            {achievement.evidences.length}
          </Text>
        </View>
      </View>

      {/* Tags (máx. 6) */}
      {achievement.tags.length > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {achievement.tags.slice(0, 6).map((tag) => (
            <View
              key={tag.id}
              style={{
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: tag.colorHex + "22",
                borderWidth: 1,
                borderColor: tag.colorHex + "55",
              }}
            >
              <Text style={{ color: tag.colorHex, fontSize: 12, fontWeight: "600" }}>
                {tag.name}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
