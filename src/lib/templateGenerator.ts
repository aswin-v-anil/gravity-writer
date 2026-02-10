
import { SAMPLE_CHARACTERS } from "./characterProfiles";

export const TEMPLATE_WIDTH = 2480; // A4 @ 300dpi
export const TEMPLATE_HEIGHT = 3508;
export const MARGIN = 100;
export const COLS = 10;
export const ROWS = 13; // 130 chars capacity

export function generateTemplate(): string {
    if (typeof window === "undefined") return "";

    const canvas = document.createElement("canvas");
    canvas.width = TEMPLATE_WIDTH;
    canvas.height = TEMPLATE_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // White Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);

    // Title & Instructions
    ctx.fillStyle = "#000000";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Handwriting Calibration Template", TEMPLATE_WIDTH / 2, 120);

    ctx.font = "40px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText("Print this page. Write each character clearly inside its box.", TEMPLATE_WIDTH / 2, 190);
    ctx.fillText("Upload a photo or scan of the filled template.", TEMPLATE_WIDTH / 2, 240);

    // Alignment Markers (Corners) - Crucial for detection
    const markerSize = 80;
    const markerInset = 50;
    ctx.fillStyle = "#000000";

    // Top-Left
    ctx.fillRect(markerInset, markerInset, markerSize, markerSize);
    // Top-Right
    ctx.fillRect(TEMPLATE_WIDTH - markerInset - markerSize, markerInset, markerSize, markerSize);
    // Bottom-Left
    ctx.fillRect(markerInset, TEMPLATE_HEIGHT - markerInset - markerSize, markerSize, markerSize);
    // Bottom-Right
    ctx.fillRect(TEMPLATE_WIDTH - markerInset - markerSize, TEMPLATE_HEIGHT - markerInset - markerSize, markerSize, markerSize);

    // Grid Layout
    const startY = 350;
    const gridWidth = TEMPLATE_WIDTH - 2 * MARGIN;
    const gridHeight = TEMPLATE_HEIGHT - startY - MARGIN;

    const cellWidth = gridWidth / COLS;
    const cellHeight = gridHeight / ROWS;

    ctx.lineWidth = 2;
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < SAMPLE_CHARACTERS.length; i++) {
        const char = SAMPLE_CHARACTERS[i];
        const col = i % COLS;
        const row = Math.floor(i / COLS);

        const x = MARGIN + col * cellWidth;
        const y = startY + row * cellHeight;

        // Draw Cell Border
        ctx.strokeStyle = "#dddddd";
        ctx.strokeRect(x, y, cellWidth, cellHeight);

        // Draw Reference Character (Light Gray)
        ctx.fillStyle = "#e5e5e5";
        ctx.font = "100px serif";
        ctx.fillText(char, x + cellWidth / 2, y + cellHeight / 2);

        // Draw Label (Small, Top-Left)
        ctx.fillStyle = "#999999";
        ctx.font = "24px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(char, x + 10, y + 10);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    }

    return canvas.toDataURL("image/png");
}
