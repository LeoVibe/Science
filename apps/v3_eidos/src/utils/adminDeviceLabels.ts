import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'eidos_admin_device_labels';

export type AdminDeviceLabelMap = Record<string, string>;

/** 裝置 UUID 第一節（8 碼）；無 `-` 時取前 8 字元 */
export function deviceIdFirstSegment(deviceId: string): string {
  const i = deviceId.indexOf('-');
  return i > 0 ? deviceId.slice(0, i) : deviceId.slice(0, 8);
}

/**
 * 後台各頁列表顯示用：有本機註記則顯示註記，否則顯示裝置 ID 第一節。
 */
export function getDeviceDisplayPrimary(
  deviceId: string,
  getLabel: (id: string) => string | undefined
): string {
  const note = getLabel(deviceId)?.trim();
  if (note) return note;
  return deviceIdFirstSegment(deviceId);
}

function readMap(): AdminDeviceLabelMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: AdminDeviceLabelMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof k === 'string' && k && typeof v === 'string' && v.trim()) {
        out[k] = v.trim();
      }
    }
    return out;
  } catch {
    return {};
  }
}

function writeMap(map: AdminDeviceLabelMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

export function getAdminDeviceLabels(): AdminDeviceLabelMap {
  if (typeof window === 'undefined') return {};
  return readMap();
}

export function setAdminDeviceLabel(deviceId: string, label: string): AdminDeviceLabelMap {
  const id = deviceId.trim();
  if (!id) return readMap();
  const next = { ...readMap() };
  const t = label.trim();
  if (!t) delete next[id];
  else next[id] = t;
  writeMap(next);
  return next;
}

export function removeAdminDeviceLabel(deviceId: string): AdminDeviceLabelMap {
  const id = deviceId.trim();
  if (!id) return readMap();
  const next = { ...readMap() };
  delete next[id];
  writeMap(next);
  return next;
}

/** 後台「使用者統計／使用者分析」共用：裝置顯示名稱（僅本機） */
export function useAdminDeviceLabels() {
  const [labels, setLabels] = useState<AdminDeviceLabelMap>(() =>
    typeof window !== 'undefined' ? readMap() : {}
  );

  useEffect(() => {
    setLabels(readMap());
  }, []);

  const setLabel = useCallback((deviceId: string, label: string) => {
    setLabels(setAdminDeviceLabel(deviceId, label));
  }, []);

  const removeLabel = useCallback((deviceId: string) => {
    setLabels(removeAdminDeviceLabel(deviceId));
  }, []);

  const getLabel = useCallback((deviceId: string) => labels[deviceId], [labels]);

  return { labels, setLabel, removeLabel, getLabel };
}
