import { UserBar } from "@/components/user-bar";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { createTag, deleteTag, getMyTags, Tag, updateTag } from "@/services/tag";
import { Ionicons } from "@expo/vector-icons";
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
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const PAGE_SIZE = 20;

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#ec4899", "#f43f5e", "#94a3b8",
  "#ffffff", "#666666", "#334155", "#0f172a",
];

function TagSkeleton() {
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
    <Animated.View style={{ opacity: pulse }} className="mb-2">
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-[10px] px-4 py-[14px] flex-row items-center">
        <View className="w-3 h-3 rounded-full bg-[#333333] mr-3" />
        <View className="h-[13px] w-[45%] bg-[#333333] rounded" />
        <View className="flex-1" />
        <View className="h-[13px] w-12 bg-[#333333] rounded" />
      </View>
    </Animated.View>
  );
}

function TagItem({
  tag,
  index,
  onEdit,
  onDelete,
}: {
  tag: Tag;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;

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
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }}
      className="mb-2"
    >
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-[10px] px-4 py-[14px] flex-row items-center">
        <View
          className="w-8 h-8 rounded-md  flex justify-center items-center mr-3"
          style={{ backgroundColor: HEX_REGEX.test(tag.colorHex) ? tag.colorHex : "#666666" }}
        >
         <Ionicons name="pricetag-sharp" size={15} color="#FFFF"  /> 
        </View>
        <Text  className="flex-1 text-white text-[15px] font-medium">
          {tag.name}
        </Text>
        <Pressable onPress={onEdit} hitSlop={8} className="p-2 mr-0.5 active:opacity-50">
          <Text className="text-[#666666] text-[15px]">✎</Text>
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8} className="p-2 active:opacity-50">
          <Text className="text-[#666666] text-[15px]">✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function TagSheet({
  visible,
  isEdit,
  initialName,
  initialColor,
  saving,
  onClose,
  onSave,
}: {
  visible: boolean;
  isEdit: boolean;
  initialName: string;
  initialColor: string;
  saving: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
}) {
  const slide = useRef(new Animated.Value(600)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setColor(initialColor);
      setModalVisible(true);
      Animated.spring(slide, {
        toValue: 0,
        damping: 25,
        stiffness: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slide, {
        toValue: 600,
        duration: 240,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible]);

  const hexValid = HEX_REGEX.test(color);
  const canSave = name.trim().length > 0 && hexValid && !saving;

  return (
    <Modal transparent visible={modalVisible} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable className="flex-1 " onPress={onClose} />

        <Animated.View
          style={{ transform: [{ translateY: slide }] }}
          className="bg-[#111111] border-t  border-[#1f1f1f] px-6 pt-6 pb-10"
        >
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Text className="flex-1 text-white text-base font-semibold">
              {isEdit ? "Editar tag" : "Nova tag"}
            </Text>
            <Pressable onPress={onClose} hitSlop={10} className="active:opacity-50">
              <Text className="text-[#666666] text-lg">✕</Text>
            </Pressable>
          </View>

          {/* Name */}
          <Text className="text-[#666666] text-[11px] tracking-widest mb-2">NOME</Text>
          <View className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg mb-5">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome da tag"
              placeholderTextColor="#666666"
              className="text-white text-[15px] px-[14px] py-[14px]"
              autoCapitalize="none"
            />
          </View>

          {/* Color */}
          <Text className="text-[#666666] text-[11px] tracking-widest mb-2">COR</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {PRESET_COLORS.map((preset) => {
              const selected = color.toLowerCase() === preset.toLowerCase();
              return (
                <Pressable
                  key={preset}
                  onPress={() => setColor(preset)}
                  className="w-8 h-8 rounded-lg active:opacity-70"
                  style={{
                    backgroundColor: preset,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? "#ffffff" : "#1f1f1f",
                  }}
                />
              );
            })}
          </View>
          <View
            className="flex-row items-center bg-[#0a0a0a] rounded-lg mb-7"
            style={{ borderWidth: 1, borderColor: hexValid ? color : "#1f1f1f" }}
          >
            <TextInput
              value={color}
              onChangeText={setColor}
              placeholder="#000000"
              placeholderTextColor="#666666"
              className="flex-1 text-white text-[15px] px-[14px] py-[14px]"
              style={{ fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}
              autoCapitalize="characters"
              maxLength={7}
            />
            <View
              className="w-[22px] h-[22px] rounded-full mr-[14px] border border-[#1f1f1f]"
              style={{ backgroundColor: hexValid ? color : "#333333" }}
            />
          </View>

          {/* Save */}
          <Pressable
            onPress={() => canSave && onSave(name.trim(), color)}
            disabled={!canSave}
            className={`rounded-lg py-[15px] items-center active:opacity-75 ${canSave ? "bg-white" : "bg-[#1a1a1a]"}`}
          >
            {saving ? (
              <ActivityIndicator color="#0a0a0a" size="small" />
            ) : (
              <Text className={`text-[15px] font-semibold ${canSave ? "text-[#0a0a0a]" : "text-[#666666]"}`}>
                {isEdit ? "Salvar" : "Criar"}
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function TagsScreen() {
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [tags, setTags] = useState<Tag[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const fetchIdRef = useRef(0);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const showError = (msg: string) => {
    toast.show({
      render: () => (
        <Toast action="error">
          <ToastTitle>Erro</ToastTitle>
          <ToastDescription>{msg}</ToastDescription>
        </Toast>
      ),
    });
  };

  const fetchTags = useCallback(async (pageNum: number, append: boolean, target: string) => {
    const id = ++fetchIdRef.current;
    try {
      const result = await getMyTags({ page: pageNum, size: PAGE_SIZE, target: target || undefined });
      if (id !== fetchIdRef.current) return;
      setTags(prev => append ? [...prev, ...result.content] : result.content);
      setHasMore(pageNum < result.totalPages - 1);
      setPage(pageNum);
    } catch {
      if (id !== fetchIdRef.current) return;
      showError("Falha ao carregar tags");
    } finally {
      if (id !== fetchIdRef.current) return;
      setLoading(false);
      setLoadingMore(false);
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const isInitial = isInitialLoad.current;
    isInitialLoad.current = false;
    if (isInitial) {
      setLoading(true);
    } else {
      setSearching(true);
    }
    setTags([]);
    setPage(0);
    setHasMore(true);
    fetchTags(0, false, debouncedSearch);
  }, [debouncedSearch, fetchTags]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchTags(page + 1, true, debouncedSearch);
  };

  const handleSave = async (name: string, color: string) => {
    setSaving(true);

    if (editingTag) {
      const snapshot = tags;
      setTags(cur => cur.map(t => t.id === editingTag.id ? { ...t, name, colorHex: color } : t));
      setSheetVisible(false);
      try {
        await updateTag(editingTag.id, { name, colorHex: color });
      } catch {
        setTags(snapshot);
        showError("Falha ao atualizar tag");
      } finally {
        setSaving(false);
      }
    } else {
      const tempId = `temp_${Date.now()}`;
      const tempTag: Tag = { id: tempId, name, colorHex: color };
      setTags(cur => [tempTag, ...cur]);
      setSheetVisible(false);
      try {
        const { id } = await createTag({ name, colorHex: color });
        setTags(cur => cur.map(t => t.id === tempId ? { ...t, id } : t));
      } catch {
        setTags(cur => cur.filter(t => t.id !== tempId));
        showError("Falha ao criar tag");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = (tag: Tag) => {
    Alert.alert(
      "Deletar tag",
      `Deseja deletar "${tag.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            const snapshot = tags;
            setTags(cur => cur.filter(t => t.id !== tag.id));
            try {
              await deleteTag(tag.id);
            } catch {
              setTags(snapshot);
              showError("Falha ao deletar tag");
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#0a0a0a]" style={{ paddingTop: insets.top }}>
      <UserBar />
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <Text className="flex-1 text-white text-[22px] font-bold">Tags</Text>
        <Pressable
          onPress={() => { setLoading(true); fetchTags(0, false, debouncedSearch); }}
          disabled={loading}
          hitSlop={8}
          className="p-2 mr-2 active:opacity-50"
        >
          <Ionicons name="refresh" size={18} color={loading ? "#333333" : "#666666"} />
        </Pressable>
        <Pressable
          onPress={() => { setEditingTag(null); setSheetVisible(true); }}
          className="bg-white rounded-lg px-[14px] py-2 active:opacity-75"
        >
          <Text className="text-[#0a0a0a] text-[13px] font-semibold">+ Nova</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-[#111111] border border-[#1f1f1f] rounded-lg mx-5 mb-3 px-4">
        {searching
          ? <ActivityIndicator size="small" color="#444444" />
          : <Ionicons name="search" size={14} color="#444444" />
        }
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar tags..."
          placeholderTextColor="#333333"
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-white text-[14px] py-[11px] ml-2"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} hitSlop={8}>
            <Ionicons name="close" size={16} color="#444444" />
          </Pressable>
        )}
      </View>

      {/* List */}
      {loading || searching ? (
        <View className="px-5 pt-1">
          {Array.from({ length: 7 }).map((_, i) => <TagSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={tags}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <TagItem
              tag={item}
              index={index}
              onEdit={() => { setEditingTag(item); setSheetVisible(true); }}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View className="items-center pt-20">
              <Text className="text-[#666666] text-[13px]">Nenhuma tag ainda</Text>
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

      <TagSheet
        visible={sheetVisible}
        isEdit={editingTag !== null}
        initialName={editingTag?.name ?? ""}
        initialColor={editingTag?.colorHex ?? "#"}
        saving={saving}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}
