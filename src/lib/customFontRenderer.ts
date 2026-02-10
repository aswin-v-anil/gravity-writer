// Custom font renderer using character samples from user profiles
// This renders text by replacing each character with the user's handwritten sample images

import { HandwritingProfile, getRandomSample, CharacterSample } from './characterProfiles';

export interface CustomRenderOptions {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    wordSpacing: number;
    messiness: number;
    rotation: number;
    inkColor?: string;
}

/**
 * Render text using custom handwriting samples
 * Returns a canvas with the rendered text
 */
export async function renderWithCustomFont(
    text: string,
    profile: HandwritingProfile,
    options: CustomRenderOptions,
    canvasWidth: number,
    canvasHeight: number
): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d')!;

    // Clear with paper color
    ctx.fillStyle = '#FFFEF5';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const scale = options.fontSize / 80; // Our samples are 80x80
    let cursorX = 50; // Left margin
    let cursorY = 50 + options.fontSize; // Top margin + first line

    const maxWidth = canvasWidth - 100; // Margins
    const lineHeight = options.fontSize * options.lineHeight;

    // Preload all needed character images
    const imageCache = new Map<string, HTMLImageElement>();

    for (const char of text) {
        if (!imageCache.has(char) && char !== ' ' && char !== '\n') {
            const sample = getRandomSample(profile, char);
            if (sample) {
                const img = await loadImage(sample.imageData);
                imageCache.set(char, img);
            }
        }
    }

    // Render each character
    for (const char of text) {
        // Handle newlines
        if (char === '\n') {
            cursorX = 50;
            cursorY += lineHeight;
            continue;
        }

        // Handle spaces
        if (char === ' ') {
            cursorX += options.fontSize * 0.5 + options.wordSpacing;
            continue;
        }

        // Get character image
        const img = imageCache.get(char);

        if (img) {
            // Calculate position with randomness
            const jitterX = (Math.random() - 0.5) * options.messiness * 0.5;
            const jitterY = (Math.random() - 0.5) * options.messiness * 0.5;
            const rotation = (Math.random() - 0.5) * options.rotation * (Math.PI / 180);

            // Check for line wrap
            const charWidth = options.fontSize;
            if (cursorX + charWidth > 50 + maxWidth) {
                cursorX = 50;
                cursorY += lineHeight;
            }

            ctx.save();
            ctx.translate(cursorX + jitterX, cursorY + jitterY);
            ctx.rotate(rotation);

            // Draw the character sample scaled to fontSize
            ctx.drawImage(
                img,
                -options.fontSize / 2,
                -options.fontSize / 2,
                options.fontSize,
                options.fontSize
            );

            ctx.restore();

            // Move cursor
            cursorX += options.fontSize * 0.7 + options.letterSpacing;
        } else {
            // Fallback: render with system font if no sample
            ctx.font = `${options.fontSize}px "Caveat", cursive`;
            ctx.fillStyle = options.inkColor || '#1a365d';
            ctx.fillText(char, cursorX, cursorY);
            cursorX += ctx.measureText(char).width + options.letterSpacing;
        }
    }

    return canvas;
}

/**
 * Load an image from base64 data
 */
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Check if a profile has enough samples to render text
 */
export function canRenderText(text: string, profile: HandwritingProfile): { can: boolean; missing: string[] } {
    const missing: Set<string> = new Set();

    for (const char of text) {
        if (char === ' ' || char === '\n') continue;

        const samples = profile.characters[char];
        if (!samples || samples.length === 0) {
            missing.add(char);
        }
    }

    return {
        can: missing.size === 0,
        missing: Array.from(missing),
    };
}
