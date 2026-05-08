/** Shared rules with frontend/src/utils/validation.ts */

const ROOM_NAME_RE = /^[a-zA-Z0-9 _-]{3,40}$/;
const AGENT_NAME_RE = /^[a-zA-Z0-9 _-]{2,24}$/;
/** Must match generateRoomCode length and charset (A-Z except I,O, 2-9) */
const ROOM_CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/;

/** Legacy invite codes before short codes: uppercase A–Z and digits, VARCHAR(32). */
const LEGACY_ROOM_CODE_RE = /^[A-Z0-9]{4,32}$/;

export function validateRoomName(raw: string): string | null {
    const name = raw?.trim() ?? "";
    if (name.length < 3) return "Room name must be at least 3 characters";
    if (name.length > 40) return "Room name must be at most 40 characters";
    if (!ROOM_NAME_RE.test(name)) {
        return "Room name may only use letters, numbers, spaces, hyphens, and underscores";
    }
    return null;
}

export function validateAgentName(raw: string): string | null {
    const name = raw?.trim() ?? "";
    if (name.length < 2) return "Agent name must be at least 2 characters";
    if (name.length > 24) return "Agent name must be at most 24 characters";
    if (!AGENT_NAME_RE.test(name)) {
        return "Agent name may only use letters, numbers, spaces, hyphens, and underscores";
    }
    return null;
}

export function normalizeRoomCode(raw: string): string {
    return (raw ?? "").trim().replace(/\s+/g, "").toUpperCase();
}

export function validateRoomCodeFormat(code: string): string | null {
    if (!code) return "Room code is required";
    if (code.length > 32) return "Room code is invalid";
    if (ROOM_CODE_RE.test(code)) return null;
    if (LEGACY_ROOM_CODE_RE.test(code)) return null;
    return "Room code is invalid";
}
