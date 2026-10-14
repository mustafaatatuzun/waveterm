// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { pickPasteTargetTerm } from "./preview-directory-paste";

describe("pickPasteTargetTerm", () => {
    const terms = [
        { blockId: "local1", connection: "" },
        { blockId: "remote1", connection: "user@host" },
        { blockId: "remote2", connection: "user@host" },
    ];

    it("prefers the most recently focused terminal on the file browser's connection", () => {
        expect(pickPasteTargetTerm(terms, ["browser", "remote2", "local1", "remote1"], "user@host")).toBe("remote2");
        expect(pickPasteTargetTerm(terms, ["browser", "local1", "remote1"], "user@host")).toBe("remote1");
    });

    it("uses layout order when no terminal on that connection was focused yet", () => {
        expect(pickPasteTargetTerm(terms, ["browser"], "user@host")).toBe("remote1");
    });

    it("treats no connection and 'local' as the same machine", () => {
        expect(pickPasteTargetTerm(terms, [], "local")).toBe("local1");
        expect(pickPasteTargetTerm(terms, [], undefined)).toBe("local1");
    });

    it("falls back to any terminal when none is on the file browser's connection", () => {
        expect(pickPasteTargetTerm(terms, ["remote1", "local1"], "other@host")).toBe("remote1");
        expect(pickPasteTargetTerm([], ["x"], "local")).toBeNull();
    });
});
