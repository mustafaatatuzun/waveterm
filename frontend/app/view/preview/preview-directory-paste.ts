// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

export type TermBlockInfo = { blockId: string; connection?: string };

function connKey(conn: string): string {
    return conn == null || conn === "" ? "local" : conn;
}

/**
 * Picks the terminal that a file browser path is pasted into: among the tab's terminals (in layout
 * order), the ones on the file browser's connection if there are any, and of those the most
 * recently focused (focusHistory holds block ids, most recent first), else the first one.
 */
export function pickPasteTargetTerm(terms: TermBlockInfo[], focusHistory: string[], connection: string): string {
    const sameConn = terms.filter((t) => connKey(t.connection) === connKey(connection));
    const pool = sameConn.length > 0 ? sameConn : terms;
    const ids = new Set(pool.map((t) => t.blockId));
    return focusHistory.find((id) => ids.has(id)) ?? pool[0]?.blockId ?? null;
}
