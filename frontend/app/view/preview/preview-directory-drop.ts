// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

export type DroppedLocalFiles = { paths: string[]; skippedDirs: string[] };

/**
 * Local paths of files dropped from the OS file manager. Folders are skipped because copying
 * between connections only supports single files (RemoteFileCopyCommand). Must be called
 * synchronously in the drop event: the browser clears the DataTransfer items once it returns.
 */
export function getDroppedLocalFiles(
    items: ArrayLike<DataTransferItem>,
    files: ArrayLike<File>,
    getPathForFile: (file: File) => string
): DroppedLocalFiles {
    const result: DroppedLocalFiles = { paths: [], skippedDirs: [] };
    const addFile = (file: File) => {
        const path = file != null ? getPathForFile(file) : null;
        if (path) {
            result.paths.push(path);
        }
    };
    const fileItems = Array.from(items ?? []).filter((item) => item.kind === "file");
    if (fileItems.length === 0) {
        Array.from(files ?? []).forEach(addFile);
        return result;
    }
    for (const item of fileItems) {
        const entry = item.webkitGetAsEntry?.();
        if (entry?.isDirectory) {
            result.skippedDirs.push(entry.name);
            continue;
        }
        addFile(item.getAsFile());
    }
    return result;
}

function folderKey(path: string): string {
    const p = path.replace(/\\/g, "/").replace(/\/+$/, "");
    return /^[a-zA-Z]:/.test(p) ? p.toLowerCase() : p;
}

/** Whether filePath is directly inside folder. Windows paths compare case-insensitively. */
export function isInFolder(filePath: string, folder: string): boolean {
    if (folder == null) {
        return false;
    }
    const p = filePath.replace(/\\/g, "/");
    const idx = p.lastIndexOf("/");
    return idx >= 0 && folderKey(p.slice(0, idx)) === folderKey(folder);
}
