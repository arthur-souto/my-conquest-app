import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import {
  createGroup,
  deleteGroup,
  getGroups,
  Group,
  updateGroup,
} from "@/services/group";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

const PAGE_SIZE = 20;

function GroupSkeleton() {
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
          <View className="h-[15px] w-[45%] bg-[#333333] rounded" />
          <View className="flex-1" />
          <View className="h-[14px] w-16 bg-[#222222] rounded" />
        </View>
        <View className="h-[12px] w-[80%] bg-[#222222] rounded mb-1.5" />
        <View className="h-[12px] w-[55%] bg-[#222222] rounded mb-4" />
        <View className="border-t border-[#1f1f1f] pt-3">
          <View className="h-[11px] w-24 bg-[#1a1a1a] rounded" />
        </View>
      </View>
    </Animated.View>
  );
}

function GroupItem({
  group,
  index,
  onPress,
  onEdit,
  onDelete,
}: {
  group: Group;
  index: number;
  onPress: () => void;
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
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
      }}
      className="mb-3"
    >
      <Pressable
        onPress={onPress}
        className="bg-[#111111] border border-[#1f1f1f] rounded-md px-5 pt-5 pb-4 active:opacity-80"
      >
        {/* Nome + ações */}
        <View className="flex-row items-start mb-3">
          <Text className="flex-1 text-white text-[16px] font-semibold mr-3">
            {group.name}
          </Text>
          <View className="flex-row items-center gap-1">
            <Pressable onPress={onEdit} hitSlop={8} className="p-2 active:opacity-40">
              <Feather name="edit-2" size={14} color="#666666" />
            </Pressable>
            <Pressable onPress={onDelete} hitSlop={8} className="p-2 active:opacity-40">
              <Feather name="trash-2" size={14} color="#666666" />
            </Pressable>
          </View>
        </View>

        {/* Descrição */}
        {group.description ? (
          <Text className="text-[#666666] text-[13px] leading-5 mb-4">
            {group.description}
          </Text>
        ) : (
          <Text className="text-[#333333] text-[13px] mb-4">Sem descrição</Text>
        )}

        {/* Footer */}
        <View className="flex-row items-center border-t border-[#1f1f1f] pt-3">
          <Feather name="layers" size={12} color="#333333" />
          {!!group.achievementsCount ? (
            <Text className="text-[#666666] text-[12px] ml-1.5">
              {group.achievementsCount} conquista{group.achievementsCount !== 1 ? "s" : ""}
            </Text>
          ) : (
            <Text className="text-[#333333] text-[12px] ml-1.5">Sem conquistas</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function GroupSheet({
  visible,
  isEdit,
  initialName,
  initialDescription,
  saving,
  onClose,
  onSave,
}: {
  visible: boolean;
  isEdit: boolean;
  initialName: string;
  initialDescription: string;
  saving: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}) {
  const slide = useRef(new Animated.Value(600)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setDescription(initialDescription);
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

  const canSave = name.trim().length > 0 && !saving;

  return (
    <Modal transparent visible={modalVisible} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable className="flex-1 " onPress={onClose} />

        <Animated.View
          style={{ transform: [{ translateY: slide }] }}
          className="bg-[#111111] border-t border-[#1f1f1f] px-6 pt-6 pb-10"
        >
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Text className="flex-1 text-white text-base font-semibold">
              {isEdit ? "Editar grupo" : "Novo grupo"}
            </Text>
            <Pressable onPress={onClose} hitSlop={10} className="active:opacity-50">
              <Feather name="x" size={18} color="#666666" />
            </Pressable>
          </View>

          {/* Name */}
          <Text className="text-[#666666] text-[11px] tracking-widest mb-2">NOME</Text>
          <View className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-md mb-4">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome do grupo"
              placeholderTextColor="#666666"
              className="text-white text-[15px] px-4 py-[14px]"
              autoCapitalize="words"
            />
          </View>

          {/* Description */}
          <Text className="text-[#666666] text-[11px] tracking-widest mb-2">
            DESCRIÇÃO <Text className="normal-case tracking-normal text-[10px]">(opcional)</Text>
          </Text>
          <View className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-md mb-7">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o grupo..."
              placeholderTextColor="#666666"
              className="text-white text-[15px] px-4 py-[14px]"
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: "top" }}
              autoCapitalize="sentences"
            />
          </View>

          {/* Save */}
          <Pressable
            onPress={() => canSave && onSave(name.trim(), description.trim())}
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
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function GroupsScreen() {
  const toast = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState<Group[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
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

  const fetchGroups = useCallback(async (pageNum: number, append: boolean, target: string) => {
    const id = ++fetchIdRef.current;
    try {
      const result = await getGroups({ page: pageNum, size: PAGE_SIZE, target: target || undefined });
      if (id !== fetchIdRef.current) return;
      setGroups(prev => append ? [...prev, ...result.content] : result.content);
      setHasMore(pageNum < result.totalPages - 1);
      setPage(pageNum);
    } catch {
      if (id !== fetchIdRef.current) return;
      showError("Falha ao carregar grupos");
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
    setGroups([]);
    setPage(0);
    setHasMore(true);
    fetchGroups(0, false, debouncedSearch);
  }, [debouncedSearch, fetchGroups]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchGroups(page + 1, true, debouncedSearch);
  };

  const handleSave = async (name: string, description: string) => {
    setSaving(true);

    if (editingGroup) {
      const snapshot = groups;
      setGroups(cur =>
        cur.map(g => g.id === editingGroup.id ? { ...g, name, description } : g)
      );
      setSheetVisible(false);
      try {
        await updateGroup(editingGroup.id, { name, description: description || undefined });
      } catch {
        setGroups(snapshot);
        showError("Falha ao atualizar grupo");
      } finally {
        setSaving(false);
      }
    } else {
      const tempId = `temp_${Date.now()}`;
      const tempGroup: Group = {
        id: tempId,
        name,
        description: description || undefined,
        createdAt: new Date().toISOString(),
      };
      setGroups(cur => [tempGroup, ...cur]);
      setSheetVisible(false);
      try {
        const { id } = await createGroup({ name, description: description || undefined });
        setGroups(cur => cur.map(g => g.id === tempId ? { ...g, id } : g));
      } catch {
        setGroups(cur => cur.filter(g => g.id !== tempId));
        showError("Falha ao criar grupo");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = (group: Group) => {
    Alert.alert(
      "Deletar grupo",
      `Deseja deletar "${group.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            const snapshot = groups;
            setGroups(cur => cur.filter(g => g.id !== group.id));
            try {
              await deleteGroup(group.id);
            } catch {
              setGroups(snapshot);
              showError("Falha ao deletar grupo");
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#0a0a0a]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <Text className="flex-1 text-white text-[22px] font-bold">Grupos</Text>
        <Pressable
          onPress={() => { setLoading(true); fetchGroups(0, false, debouncedSearch); }}
          disabled={loading}
          hitSlop={8}
          className="p-2 mr-2 active:opacity-50"
        >
          <Feather name="refresh-cw" size={17} color={loading ? "#333333" : "#666666"} />
        </Pressable>
        <Pressable
          onPress={() => { setEditingGroup(null); setSheetVisible(true); }}
          className="bg-white rounded-md px-[14px] py-2 active:opacity-75"
        >
          <Text className="text-[#0a0a0a] text-[13px] font-semibold">+ Novo</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-[#111111] border border-[#1f1f1f] rounded-lg mx-5 mb-3 px-4">
        {searching
          ? <ActivityIndicator size="small" color="#444444" />
          : <Feather name="search" size={14} color="#444444" />
        }
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar grupos..."
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
        <View className="px-5 pt-1">
          {Array.from({ length: 6 }).map((_, i) => <GroupSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <GroupItem
              group={item}
              index={index}
              onPress={() => router.push({ pathname: "/group/[id]", params: { id: item.id, name: item.name, description: item.description ?? "" } })}
              onEdit={() => { setEditingGroup(item); setSheetVisible(true); }}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-3">
              <Feather name="layers" size={32} color="#333333" />
              <Text className="text-[#666666] text-[13px]">Nenhum grupo ainda</Text>
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

      <GroupSheet
        visible={sheetVisible}
        isEdit={editingGroup !== null}
        initialName={editingGroup?.name ?? ""}
        initialDescription={editingGroup?.description ?? ""}
        saving={saving}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}
