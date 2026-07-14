import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type DhikrId = "subhanAllah" | "alhamdulillah" | "allahuAkbar" | "astaghfirullah";

export interface DhikrPreset {
  id: DhikrId;
  translationKey: string;
  defaultTarget: number;
}

export const DHIKR_PRESETS: DhikrPreset[] = [
  { id: "subhanAllah", translationKey: "subhanAllah", defaultTarget: 33 },
  { id: "alhamdulillah", translationKey: "alhamdulillah", defaultTarget: 33 },
  { id: "allahuAkbar", translationKey: "allahuAkbar", defaultTarget: 33 },
  { id: "astaghfirullah", translationKey: "astaghfirullah", defaultTarget: 100 },
];

export const TARGET_OPTIONS = [33, 99, 100];

const COUNTS_KEY = "@sakinah_tasbih_counts";
const TARGETS_KEY = "@sakinah_tasbih_targets";
const SELECTED_KEY = "@sakinah_tasbih_selected";

type CountsMap = Partial<Record<DhikrId, number>>;
type TargetsMap = Partial<Record<DhikrId, number>>;

export function useTasbih() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<CountsMap>({});
  const [targets, setTargets] = useState<TargetsMap>({});
  const [selected, setSelectedState] = useState<DhikrId>("subhanAllah");

  useEffect(() => {
    (async () => {
      try {
        const [storedCounts, storedTargets, storedSelected] = await Promise.all([
          AsyncStorage.getItem(COUNTS_KEY),
          AsyncStorage.getItem(TARGETS_KEY),
          AsyncStorage.getItem(SELECTED_KEY),
        ]);
        if (storedCounts) setCounts(JSON.parse(storedCounts));
        if (storedTargets) setTargets(JSON.parse(storedTargets));
        if (storedSelected && DHIKR_PRESETS.some((d) => d.id === storedSelected)) {
          setSelectedState(storedSelected as DhikrId);
        }
      } catch (error) {
        console.error("Error loading tasbih data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setSelected = useCallback((id: DhikrId) => {
    setSelectedState(id);
    AsyncStorage.setItem(SELECTED_KEY, id).catch((error) =>
      console.error("Error saving selected dhikr:", error)
    );
  }, []);

  const preset = DHIKR_PRESETS.find((d) => d.id === selected) || DHIKR_PRESETS[0];
  const count = counts[selected] || 0;
  const target = targets[selected] || preset.defaultTarget;

  const increment = useCallback(() => {
    setCounts((prev) => {
      const updated = { ...prev, [selected]: (prev[selected] || 0) + 1 };
      AsyncStorage.setItem(COUNTS_KEY, JSON.stringify(updated)).catch((error) =>
        console.error("Error saving tasbih count:", error)
      );
      return updated;
    });
  }, [selected]);

  const reset = useCallback(() => {
    setCounts((prev) => {
      const updated = { ...prev, [selected]: 0 };
      AsyncStorage.setItem(COUNTS_KEY, JSON.stringify(updated)).catch((error) =>
        console.error("Error saving tasbih count:", error)
      );
      return updated;
    });
  }, [selected]);

  const setTarget = useCallback(
    (value: number) => {
      setTargets((prev) => {
        const updated = { ...prev, [selected]: value };
        AsyncStorage.setItem(TARGETS_KEY, JSON.stringify(updated)).catch((error) =>
          console.error("Error saving tasbih target:", error)
        );
        return updated;
      });
    },
    [selected]
  );

  return {
    loading,
    dhikrList: DHIKR_PRESETS,
    counts,
    selected,
    setSelected,
    count,
    target,
    setTarget,
    increment,
    reset,
  };
}
