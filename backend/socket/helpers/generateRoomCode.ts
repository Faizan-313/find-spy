import { randomInt } from "node:crypto";

/** Uppercase alphanumerics, excluding ambiguous I, O, 0, 1 — 6 chars fits VARCHAR(32) with low collision rate. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

const generateRoomCode = (): string => {
    let out = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
        out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    }
    return out;
};

export default generateRoomCode;
