/**
 * 後台「使用者分析」：從 KV recent 活動紀錄聚合裝置層級洞察（JOB-081）。
 */

export interface ActivityLogEntry {
  deviceId: string;
  timestamp: string;
  action: string;
  details?: Record<string, unknown>;
  clientIp?: string;
}

export interface DayHourSegment {
  /** 0–23，來自紀錄 ISO 時間之 UTC 小時（與前端 toISOString 一致） */
  hourUtc: number;
  firstAt: string;
  lastAt: string;
  eventCount: number;
}

export interface UserAnalysisDevice {
  deviceId: string;
  activeDays: number;
  firstSeen: string;
  lastSeen: string;
  clientIps: string[];
  topGrade: number | null;
  topSubject: string | null;
  /** 與前台路由一致：…/stats/wrong（錯題／學習成果）；無完整脈絡時為 null */
  statsWrongPath: string | null;
  /** 來自 answer_question 且 details.correct 為布林的筆數 */
  answerQuestionTotal: number;
  answerQuestionWrong: number;
  /** 錯誤比例 wrong/total；無答題或無法辨識時為 null */
  answerWrongRatio: number | null;
  byDay: Array<{ date: string; hours: DayHourSegment[] }>;
}

const SUBJECT_URL: Record<string, string> = {
  國語: 'chi',
  數學: 'mat',
  英語: 'eng',
  自然: 'sci',
  社會: 'soc',
  生活: 'life',
};

const PUB_URL: Record<string, string> = {
  康軒: 'knsh',
  南一: 'nani',
  翰林: 'hlm',
};

function buildStatsWrongPath(
  grade: number,
  subject: string,
  semester: number,
  publisher: string
): string | null {
  const sc = SUBJECT_URL[subject];
  const pc = PUB_URL[publisher];
  if (!sc || !pc || grade < 1 || grade > 6) return null;
  const sem = semester === 1 || semester === 2 ? semester : 1;
  return `/g${grade}/${sc}/s${sem}/${pc}/stats/wrong`;
}

function asRecord(d: unknown): Record<string, unknown> | null {
  return d && typeof d === 'object' && !Array.isArray(d) ? (d as Record<string, unknown>) : null;
}

function topByCountWithRecency<T extends string | number>(
  entries: ActivityLogEntry[],
  pick: (e: ActivityLogEntry) => T | null | undefined,
  filter?: (e: ActivityLogEntry) => boolean
): T | null {
  const counts = new Map<T, { c: number; lastTs: string }>();
  for (const e of entries) {
    if (filter && !filter(e)) continue;
    const v = pick(e);
    if (v === null || v === undefined) continue;
    const cur = counts.get(v) ?? { c: 0, lastTs: '' };
    cur.c++;
    if (e.timestamp >= cur.lastTs) cur.lastTs = e.timestamp;
    counts.set(v, cur);
  }
  let best: T | null = null;
  let bestScore = -1;
  let bestTs = '';
  for (const [k, v] of counts) {
    if (v.c > bestScore || (v.c === bestScore && v.lastTs > bestTs)) {
      best = k;
      bestScore = v.c;
      bestTs = v.lastTs;
    }
  }
  return best;
}

function countAnswerQuestionStats(entries: ActivityLogEntry[]): {
  total: number;
  wrong: number;
  correct: number;
} {
  let total = 0;
  let wrong = 0;
  let correct = 0;
  for (const e of entries) {
    if (e.action !== 'answer_question') continue;
    const det = asRecord(e.details);
    const c = det?.correct;
    if (typeof c !== 'boolean') continue;
    total++;
    if (c) correct++;
    else wrong++;
  }
  return { total, wrong, correct };
}

function inferStatsPath(entries: ActivityLogEntry[]): string | null {
  for (let i = entries.length - 1; i >= 0; i--) {
    const det = asRecord(entries[i].details);
    if (!det) continue;
    const g = det.grade;
    const sub = det.subject;
    const sem = det.semester;
    const pub = det.publisher;
    if (typeof g !== 'number' || typeof sub !== 'string' || typeof pub !== 'string') continue;
    const semester = typeof sem === 'number' ? sem : 1;
    const p = buildStatsWrongPath(g, sub, semester, pub);
    if (p) return p;
  }
  return null;
}

function parseLogs(raw: unknown): ActivityLogEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: ActivityLogEntry[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const deviceId = typeof r.deviceId === 'string' ? r.deviceId : '';
    const timestamp = typeof r.timestamp === 'string' ? r.timestamp : '';
    const action = typeof r.action === 'string' ? r.action : '';
    if (!deviceId || !timestamp || !action) continue;
    const details = asRecord(r.details) ?? undefined;
    const clientIp = typeof r.clientIp === 'string' && r.clientIp.trim() ? r.clientIp.trim() : undefined;
    out.push({ deviceId, timestamp, action, details, clientIp });
  }
  return out;
}

/**
 * 篩選活躍天數 >= minActiveDays 的裝置，並回傳聚合結果（依 lastSeen 新到舊排序）。
 */
export function aggregateUserAnalysis(rawLogs: unknown[], minActiveDays: number): UserAnalysisDevice[] {
  let min = 5;
  if (typeof minActiveDays === 'number' && Number.isFinite(minActiveDays)) {
    min = Math.min(365, Math.max(1, Math.floor(minActiveDays)));
  }
  const logs = parseLogs(rawLogs);
  const byDevice = new Map<string, ActivityLogEntry[]>();
  for (const e of logs) {
    const arr = byDevice.get(e.deviceId) ?? [];
    arr.push(e);
    byDevice.set(e.deviceId, arr);
  }

  const result: UserAnalysisDevice[] = [];

  for (const [deviceId, entries] of byDevice) {
    const days = new Set<string>();
    for (const e of entries) {
      if (e.timestamp.length >= 10) days.add(e.timestamp.slice(0, 10));
    }
    if (days.size < min) continue;

    entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const firstSeen = entries[0].timestamp;
    const lastSeen = entries[entries.length - 1].timestamp;

    const ipSet = new Set<string>();
    for (const e of entries) {
      if (e.clientIp) ipSet.add(e.clientIp);
    }
    const clientIps = [...ipSet].sort();

    const topGrade = topByCountWithRecency(entries, (e) => {
      const g = asRecord(e.details)?.grade;
      return typeof g === 'number' && g >= 1 && g <= 6 ? g : null;
    });

    const topSubject = topByCountWithRecency(
      entries,
      (e) => {
        const s = asRecord(e.details)?.subject;
        return typeof s === 'string' && s ? s : null;
      },
      (e) => e.action === 'start_quiz' || e.action === 'view_lesson'
    );

    const statsWrongPath = inferStatsPath(entries);
    const aq = countAnswerQuestionStats(entries);
    const answerWrongRatio = aq.total > 0 ? aq.wrong / aq.total : null;

    // 依日期聚合：每日內再依 UTC 小時分桶（一小時內多筆事件合併為一段「時段 session」）
    const sortedDays = [...days].sort();
    const byDay: UserAnalysisDevice['byDay'] = [];
    for (const date of sortedDays) {
      const dayEntries = entries.filter((e) => e.timestamp.startsWith(date));
      const hourMap = new Map<number, { firstAt: string; lastAt: string; eventCount: number }>();
      for (const e of dayEntries) {
        let hour = 0;
        try {
          hour = new Date(e.timestamp).getUTCHours();
        } catch {
          hour = 0;
        }
        const cur = hourMap.get(hour);
        if (!cur) {
          hourMap.set(hour, { firstAt: e.timestamp, lastAt: e.timestamp, eventCount: 1 });
        } else {
          cur.eventCount++;
          if (e.timestamp < cur.firstAt) cur.firstAt = e.timestamp;
          if (e.timestamp > cur.lastAt) cur.lastAt = e.timestamp;
        }
      }
      const hours: DayHourSegment[] = [...hourMap.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([hourUtc, v]) => ({
          hourUtc,
          firstAt: v.firstAt,
          lastAt: v.lastAt,
          eventCount: v.eventCount,
        }));
      byDay.push({ date, hours });
    }

    result.push({
      deviceId,
      activeDays: days.size,
      firstSeen,
      lastSeen,
      clientIps,
      topGrade,
      topSubject,
      statsWrongPath,
      answerQuestionTotal: aq.total,
      answerQuestionWrong: aq.wrong,
      answerWrongRatio,
      byDay,
    });
  }

  result.sort((a, b) => {
    if (b.activeDays !== a.activeDays) return b.activeDays - a.activeDays;
    return b.lastSeen.localeCompare(a.lastSeen);
  });
  return result;
}

/** 後台「使用者統計」：依時間窗的裝置數 + 年級分佈（以裝置為單位） */
export interface UserStatsSnapshot {
  uniqueDevices1d: number;
  uniqueDevices7d: number;
  uniqueDevices30d: number;
  /** 近 30 日至少有一筆紀錄的裝置，依其日誌中出現最多次的年級（1–6）分組 */
  gradeDistribution: Array<{ grade: number; deviceCount: number }>;
  /** 近 30 日 answer_question 事件總數（需前端寫入） */
  totalAnswerEvents30d: number;
  /** 近 30 日曾有答題紀錄的裝置數 */
  devicesWithAnswers30d: number;
  /** 近 30 日平均每裝置答題事件數；無答題紀錄時為 null */
  avgAnswerEventsPerDevice30d: number | null;
}

/** 後台「使用者分析」頁頂部摘要（與 minDays 篩選後清單搭配） */
export interface ActivitySummary {
  /** 近 30 日事件中最常出現的科目（依 details.subject） */
  topSubject30d: string | null;
  /** 近 30 日 (年級, 科目) 事件數最高者 */
  topGradeSubject30d: { grade: number; subject: string; events: number } | null;
  /** 活躍天數排名（僅含 >= minActiveDays 的裝置，由高到低） */
  activeDaysRank: Array<{ rank: number; deviceId: string; activeDays: number; lastSeen: string }>;
}

function tsMs(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export function aggregateUserStats(rawLogs: unknown[], nowIso: string): UserStatsSnapshot {
  const logs = parseLogs(rawLogs);
  const now = tsMs(nowIso);
  const d1 = now - 86400000;
  const d7 = now - 7 * 86400000;
  const d30 = now - 30 * 86400000;

  const uniq = (cut: number) => {
    const s = new Set<string>();
    for (const e of logs) {
      if (tsMs(e.timestamp) >= cut) s.add(e.deviceId);
    }
    return s.size;
  };

  const logs30 = logs.filter((e) => tsMs(e.timestamp) >= d30);
  const byDevice30 = new Map<string, ActivityLogEntry[]>();
  for (const e of logs30) {
    const arr = byDevice30.get(e.deviceId) ?? [];
    arr.push(e);
    byDevice30.set(e.deviceId, arr);
  }

  const gradeDeviceCount = new Map<number, number>();
  for (const [, entries] of byDevice30) {
    const g = topByCountWithRecency(entries, (e) => {
      const gr = asRecord(e.details)?.grade;
      return typeof gr === 'number' && gr >= 1 && gr <= 6 ? gr : null;
    });
    if (g != null) gradeDeviceCount.set(g, (gradeDeviceCount.get(g) ?? 0) + 1);
  }

  const gradeDistribution = [...gradeDeviceCount.entries()]
    .map(([grade, deviceCount]) => ({ grade, deviceCount }))
    .sort((a, b) => a.grade - b.grade);

  let totalAnswerEvents30d = 0;
  const ansDev = new Set<string>();
  for (const e of logs30) {
    if (e.action === 'answer_question') {
      totalAnswerEvents30d++;
      ansDev.add(e.deviceId);
    }
  }
  const devicesWithAnswers30d = ansDev.size;
  const avgAnswerEventsPerDevice30d =
    devicesWithAnswers30d > 0 ? totalAnswerEvents30d / devicesWithAnswers30d : null;

  return {
    uniqueDevices1d: uniq(d1),
    uniqueDevices7d: uniq(d7),
    uniqueDevices30d: uniq(d30),
    gradeDistribution,
    totalAnswerEvents30d,
    devicesWithAnswers30d,
    avgAnswerEventsPerDevice30d,
  };
}

export function aggregateActivitySummary(rawLogs: unknown[], minActiveDays: number): ActivitySummary {
  let min = 5;
  if (typeof minActiveDays === 'number' && Number.isFinite(minActiveDays)) {
    min = Math.min(365, Math.max(1, Math.floor(minActiveDays)));
  }
  const logs = parseLogs(rawLogs);
  const cut30 = Date.now() - 30 * 86400000;

  const logs30 = logs.filter((e) => tsMs(e.timestamp) >= cut30);
  const subjectCount = new Map<string, number>();
  const pairCount = new Map<string, number>();

  for (const e of logs30) {
    const det = asRecord(e.details);
    const g = det?.grade;
    const sub = det?.subject;
    if (typeof g === 'number' && g >= 1 && g <= 6 && typeof sub === 'string' && sub) {
      const key = `${g}|${sub}`;
      pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
    }
    if (typeof sub === 'string' && sub) {
      subjectCount.set(sub, (subjectCount.get(sub) ?? 0) + 1);
    }
  }

  let topSubject30d: string | null = null;
  let bestSub = -1;
  for (const [s, c] of subjectCount) {
    if (c > bestSub) {
      bestSub = c;
      topSubject30d = s;
    }
  }

  let topGradeSubject30d: ActivitySummary['topGradeSubject30d'] = null;
  let bestPair = -1;
  for (const [key, c] of pairCount) {
    if (c > bestPair) {
      bestPair = c;
      const pipe = key.indexOf('|');
      if (pipe > 0) {
        const grade = parseInt(key.slice(0, pipe), 10);
        const subject = key.slice(pipe + 1);
        if (Number.isFinite(grade) && subject) {
          topGradeSubject30d = { grade, subject, events: c };
        }
      }
    }
  }

  const devices = aggregateUserAnalysis(rawLogs, min);
  const activeDaysRank = devices.map((d, i) => ({
    rank: i + 1,
    deviceId: d.deviceId,
    activeDays: d.activeDays,
    lastSeen: d.lastSeen,
  }));

  return {
    topSubject30d,
    topGradeSubject30d,
    activeDaysRank,
  };
}
