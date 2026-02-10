import { HandwritingStyle } from "./handwritingEngine";

export interface HandwritingStyleProfile extends HandwritingStyle {
    id: string;
    name: string;
    sourceImage?: string; // Data URL
    detectedSlant: number;
    detectedStrokeWidth: number;
    messinessScore: number;
}

// Heuristic Constants
const ANALYSIS_CANVAS_SIZE = 512; // Resize image for analysis

/**
 * Extracts handwriting style parameters from an uploaded image.
 * @param imageUrl Data URL of the uploaded image
 * @returns Promise<HandwritingStyleProfile>
 */
export async function extractStyleFromImage(imageUrl: string, fileName: string): Promise<HandwritingStyleProfile> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            try {
                const results = analyzeImage(img);
                resolve({
                    id: crypto.randomUUID(),
                    name: fileName.split('.')[0] || "Custom Style",
                    sourceImage: imageUrl,
                    font: "Custom", // We will map this to a closest font or use SVG paths later. For now, keep generic.
                    size: 24, // Default implementation size
                    color: "#000000", // Default to black, or extract dominant color

                    // Mapped properties
                    lineHeight: 1.5, // Standard
                    wordSpacing: results.avgSpacing * 0.5, // Heuristic mapping
                    letterSpacing: results.avgSpacing * 0.1,
                    perturbation: results.messiness * 5, // Map 0-1 to engine scale
                    rotation: results.messiness * 5, // Random jitter based on messiness
                    slant: results.slant, // Constant slant
                    baselineShift: results.messiness * 2,

                    // Metadata
                    detectedSlant: results.slant,
                    detectedStrokeWidth: results.strokeWidth,
                    messinessScore: results.messiness,
                });
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = (e) => reject(e);
        img.src = imageUrl;
    });
}

interface AnalysisResult {
    strokeWidth: number;
    slant: number;
    avgSpacing: number;
    messiness: number; // 0 to 1
}

function analyzeImage(img: HTMLImageElement): AnalysisResult {
    const canvas = document.createElement("canvas");
    canvas.width = ANALYSIS_CANVAS_SIZE;
    canvas.height = ANALYSIS_CANVAS_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    // Draw and resize
    ctx.drawImage(img, 0, 0, ANALYSIS_CANVAS_SIZE, ANALYSIS_CANVAS_SIZE);
    const imageData = ctx.getImageData(0, 0, ANALYSIS_CANVAS_SIZE, ANALYSIS_CANVAS_SIZE);
    const data = imageData.data;

    // 1. Binarize & Calculate Ink Density
    let blackPixelCount = 0;
    const pixels: { x: number, y: number }[] = [];
    const threshold = 128;

    for (let i = 0; i < data.length; i += 4) {
        const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (grayscale < threshold) {
            blackPixelCount++;
            const idx = i / 4;
            pixels.push({
                x: idx % ANALYSIS_CANVAS_SIZE,
                y: Math.floor(idx / ANALYSIS_CANVAS_SIZE)
            });
        }
    }

    if (pixels.length === 0) {
        return { strokeWidth: 2, slant: 0, avgSpacing: 5, messiness: 0.1 };
    }

    // 2. Estimate Slant (Simplified Vertical Projection Variance)
    // We try skewing pixels by -20 to +20 degrees and check column histogram variance.
    // Higher variance = straighter columns = correct deskew angle.
    let bestSlant = 0;
    let maxVariance = 0;

    for (let angle = -20; angle <= 20; angle += 5) {
        const rad = angle * Math.PI / 180;
        const columnCounts = new Array(ANALYSIS_CANVAS_SIZE).fill(0);

        for (const p of pixels) {
            // Skew x: newX = x - y * tan(angle)
            const skewedX = Math.round(p.x - p.y * Math.tan(rad));
            if (skewedX >= 0 && skewedX < ANALYSIS_CANVAS_SIZE) {
                columnCounts[skewedX]++;
            }
        }

        // Calculate variance of columnCounts
        const variance = calculateVariance(columnCounts);
        if (variance > maxVariance) {
            maxVariance = variance;
            bestSlant = angle;
        }
    }

    // 3. Estimate Messiness (Bounding Box Variance of blobs)
    // Simplified: Just use distribution of pixel heights for now? 
    // Better: Standard deviation of y-coordinates relative to their local lines.
    // Let's use a simple heuristic: High frequency noise in vertical projection.

    // 4. Stroke Width (Total Black Pixels / Total Edge Pixels) approximation
    // Or just Black Pixels / Total Length of Skeleton.
    // Fallback: Black Ratio * Constant.
    const coverage = blackPixelCount / (ANALYSIS_CANVAS_SIZE * ANALYSIS_CANVAS_SIZE);
    const strokeWidth = Math.max(1, Math.min(5, coverage * 100)); // Arbitrary scaling

    return {
        strokeWidth: strokeWidth,
        slant: bestSlant, // The angle that straightens it. So the handwriting slant is actually reversed? 
        // If -10 deg skew straightens it, it means it was leaning +10.
        avgSpacing: 10,
        messiness: Math.min(1, Math.abs(bestSlant) / 30 + 0.1) // Slant implies some messiness usually
    };
}

function calculateVariance(arr: number[]) {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
}
