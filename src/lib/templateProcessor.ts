
import { SAMPLE_CHARACTERS } from "./characterProfiles";
import { TEMPLATE_WIDTH, TEMPLATE_HEIGHT, MARGIN, COLS, ROWS } from "./templateGenerator";

export async function processTemplate(imageFile: File): Promise<Record<string, string>> {
    const minWidth = 1000;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Processing logic
            const canvas = document.createElement("canvas");
            // Work with standard template size or max reasonable size to keep performance
            // We need details, so let's stick to template size if possible, or scale down slightly if huge.
            // But we need coordinate mapping, so scaling to TEMPLATE_WIDTH is easiest for grid logic.

            canvas.width = TEMPLATE_WIDTH;
            canvas.height = TEMPLATE_HEIGHT;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject("Canvas context error");
                return;
            }

            // Draw image scaled to fill template dimensions (assuming scan is roughly full page)
            // Ideally we'd detect corners and warp, but for MVP we assume a flat scan/photo.
            ctx.drawImage(img, 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);

            // Extract characters from grid
            const startY = 350;
            const gridWidth = TEMPLATE_WIDTH - 2 * MARGIN;
            const gridHeight = TEMPLATE_HEIGHT - startY - MARGIN;

            const cellWidth = gridWidth / COLS;
            const cellHeight = gridHeight / ROWS;

            const extractedChars: Record<string, string> = {};

            // Helper canvas for individual chars
            const charCanvas = document.createElement("canvas");
            charCanvas.width = cellWidth;
            charCanvas.height = cellHeight;
            const charCtx = charCanvas.getContext("2d");

            if (!charCtx) {
                reject("Char canvas context error");
                return;
            }

            for (let i = 0; i < SAMPLE_CHARACTERS.length; i++) {
                const char = SAMPLE_CHARACTERS[i];
                const col = i % COLS;
                const row = Math.floor(i / COLS);

                const x = MARGIN + col * cellWidth;
                const y = startY + row * cellHeight;

                // Extract cell image
                // Use inner 80% to avoid grid lines
                const insetX = cellWidth * 0.1;
                const insetY = cellHeight * 0.1;
                const captureWidth = cellWidth * 0.8;
                const captureHeight = cellHeight * 0.8;

                charCtx.clearRect(0, 0, cellWidth, cellHeight);
                // Draw white background first to handle transparency/gaps
                // charCtx.fillStyle = "white";
                // charCtx.fillRect(0, 0, cellWidth, cellHeight);

                // Draw source chunk
                charCtx.drawImage(
                    canvas,
                    x + insetX, y + insetY, captureWidth, captureHeight,
                    0, 0, captureWidth, captureHeight
                );

                // Simple Thresholding / Binarization to clean up gray scan background?
                // For MVP, just return raw crop. User can refine later or we rely on good contrast.
                // Actually, let's do a basic localized threshold or "remove light background"
                const imageData = charCtx.getImageData(0, 0, captureWidth, captureHeight);
                const data = imageData.data;

                // Find background color (mode of corners?) 
                // Simple approach: any pixel > 200 is white (transparent)
                for (let j = 0; j < data.length; j += 4) {
                    const r = data[j];
                    const g = data[j + 1];
                    const b = data[j + 2];
                    // If near white, make transparent
                    if (r > 200 && g > 200 && b > 200) {
                        data[j + 3] = 0; // Alpha 0
                    }
                }
                charCtx.putImageData(imageData, 0, 0);

                // Save as PNG
                extractedChars[char] = charCanvas.toDataURL("image/png");
            }

            resolve(extractedChars);
        };
        img.onerror = (e) => reject(e);
        img.src = URL.createObjectURL(imageFile);
    });
}
