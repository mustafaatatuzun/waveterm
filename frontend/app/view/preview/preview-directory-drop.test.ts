// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { getDroppedLocalFiles, isInFolder } from "./preview-directory-drop";

function fakeItem(name: string, isDir: boolean, kind = "file") {
    const file = { name } as File;
    return {
        kind,
        getAsFile: () => (kind === "file" ? file : null),
        webkitGetAsEntry: () => ({ name, isDirectory: isDir }),
    } as unknown as DataTransferItem;
}

const pathOf = (file: File) => `C:\\Users\\me\\Downloads\\${file.name}`;

describe("getDroppedLocalFiles", () => {
    it("returns the local path of each dropped file and skips folders", () => {
        const items = [fakeItem("photo.jpg", false), fakeItem("Folder", true), fakeItem("a b.txt", false)];
        expect(getDroppedLocalFiles(items, null, pathOf)).toEqual({
            paths: ["C:\\Users\\me\\Downloads\\photo.jpg", "C:\\Users\\me\\Downloads\\a b.txt"],
            skippedDirs: ["Folder"],
        });
    });

    it("ignores non-file items such as text dragged along", () => {
        const items = [fakeItem("text/plain", false, "string"), fakeItem("photo.jpg", false)];
        expect(getDroppedLocalFiles(items, null, pathOf).paths).toEqual(["C:\\Users\\me\\Downloads\\photo.jpg"]);
    });

    it("falls back to the file list when there are no items", () => {
        const files = [{ name: "photo.jpg" } as File];
        expect(getDroppedLocalFiles(null, files, pathOf).paths).toEqual(["C:\\Users\\me\\Downloads\\photo.jpg"]);
    });

    it("drops files that cannot be mapped to a local path", () => {
        expect(getDroppedLocalFiles([fakeItem("x", false)], null, () => "").paths).toEqual([]);
    });
});

describe("isInFolder", () => {
    it("matches Windows paths regardless of slashes, case and a trailing slash", () => {
        expect(isInFolder("C:\\Users\\me\\Downloads\\photo.jpg", "c:/users/me/downloads/")).toBe(true);
        expect(isInFolder("C:\\Users\\me\\Downloads\\photo.jpg", "C:\\Users\\me")).toBe(false);
        expect(isInFolder("C:\\photo.jpg", "C:\\")).toBe(true);
    });

    it("is case-sensitive for POSIX paths", () => {
        expect(isInFolder("/opt/uploads/a.jpg", "/opt/uploads")).toBe(true);
        expect(isInFolder("/opt/uploads/a.jpg", "/opt/Uploads")).toBe(false);
        expect(isInFolder("/a.jpg", "/")).toBe(true);
    });
});
