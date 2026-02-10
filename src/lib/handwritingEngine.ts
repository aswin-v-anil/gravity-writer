
import html2canvas from "html2canvas";

// ========================
// STABLE-RANDOM PRNG (For deterministic messiness)
// ========================
class StableRandom {
    private pool: Float32Array;
    private index: number;

    constructor(size: number = 8000) {
        this.pool = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            this.pool[i] = Math.random();
        }
        this.index = 0;
    }

    next(): number {
        if (this.index >= this.pool.length) this.index = 0;
        return this.pool[this.index++];
    }

    reset() {
        this.index = 0;
    }
}

// Global PRNG instance for consistency
const stableRandom = new StableRandom();

// ========================
// ADVANCED HANDWRITING SETTINGS (Per Reference Site)
// ========================
export interface HWSettings {
    enabled: boolean;

    // Line Level
    lineSlopeEnabled: boolean;
    lineSlopeMax: number; // degrees

    lineSpacingNoiseEnabled: boolean;
    lineSpacingNoiseMax: number; // px

    lineFontNoiseEnabled: boolean;
    lineFontNoiseMax: number; // %

    // Word Level
    wordBaselineEnabled: boolean;
    wordBaselineMax: number; // px

    wordRotationEnabled: boolean;
    wordRotationMax: number; // degrees

    wordSpacingNoiseEnabled: boolean;
    wordSpacingNoiseMax: number; // px

    letterSpacingNoiseEnabled: boolean;
    letterSpacingNoiseMax: number; // px

    // Ink & Paper Effects
    inkBlurEnabled: boolean;
    inkBlurAmount: number; // px

    inkFlowEnabled: boolean;
    inkFlowAmount: number; // 0-1

    inkShadowEnabled: boolean;
    inkShadowAmount: number; // px

    paperTextureEnabled: boolean;
    paperTextureStrength: number; // 0-1

    paperShadowEnabled: boolean;
    paperShadowStrength: number; // 0-1
}

// Default HW Settings (Matching Reference Site)
export const defaultHWSettings: HWSettings = {
    enabled: true,

    lineSlopeEnabled: true,
    lineSlopeMax: 2,

    lineSpacingNoiseEnabled: true,
    lineSpacingNoiseMax: 3,

    lineFontNoiseEnabled: true,
    lineFontNoiseMax: 2,

    wordBaselineEnabled: true,
    wordBaselineMax: 2,

    wordRotationEnabled: true,
    wordRotationMax: 3,

    wordSpacingNoiseEnabled: true,
    wordSpacingNoiseMax: 3,

    letterSpacingNoiseEnabled: true,
    letterSpacingNoiseMax: 0.6,

    inkBlurEnabled: true,
    inkBlurAmount: 0.3,

    inkFlowEnabled: true,
    inkFlowAmount: 0.9,

    inkShadowEnabled: true,
    inkShadowAmount: 1,

    paperTextureEnabled: true,
    paperTextureStrength: 0.18,

    paperShadowEnabled: true,
    paperShadowStrength: 0.35
};

export interface HandwritingStyle {
    font: string;
    size: number;
    color: string;

    // Spacing
    lineHeight: number;
    wordSpacing: number;
    letterSpacing: number;

    // Effects
    perturbation: number; // Messiness
    rotation: number;     // Random rotation range
    slant: number;        // Constant slant angle (new)
    baselineShift: number; // Random vertical shift
}


export interface PageConfig {
    paperType: "plain" | "ruled" | "grid" | "vintage";
    width: number;
    height: number;
    marginLeft: number;
    marginTop: number;
    paperColor?: string;
    marginColor?: string;
}

export class HandwritingEngine {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private tempContainer: HTMLElement; // For LaTeX rendering

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;

        // Remove existing temp container if any
        const existing = document.getElementById('latex-temp-container');
        if (existing) existing.remove();

        // Create container for KaTeX rendering
        this.tempContainer = document.createElement('div');
        this.tempContainer.id = 'latex-temp-container';
        this.tempContainer.style.position = 'absolute';
        this.tempContainer.style.left = '-9999px';
        this.tempContainer.style.top = '-9999px';
        document.body.appendChild(this.tempContainer);
    }

    // Draw paper with different types
    drawPaper(config: PageConfig) {
        const { paperType, marginLeft, paperColor, marginColor } = config;

        // Background Color
        if (paperColor) {
            this.ctx.fillStyle = paperColor;
        } else if (paperType === "vintage") {
            this.ctx.fillStyle = "#f0e6d2"; // Parchment color
        } else {
            this.ctx.fillStyle = "#FFFEF5"; // Off-white
        }

        this.ctx.fillRect(0, 0, this.width, this.height);

        // Add paper texture (subtle noise)
        this.addPaperTexture();

        if (paperType === "ruled") {
            this.drawRuledLines();
        } else if (paperType === "grid") {
            this.drawGridLines();
        }

        // Hand-drawn margin line (slightly imperfect)
        this.drawMarginLine(marginLeft, marginColor);
    }

    private addPaperTexture() {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 8;
            data[i] += noise;     // R
            data[i + 1] += noise; // G
            data[i + 2] += noise; // B
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    private drawRuledLines() {
        this.ctx.strokeStyle = "#d4e5f7";
        this.ctx.lineWidth = 1;
        const startY = 100;
        const lineHeight = 30;

        for (let y = startY; y < this.height; y += lineHeight) {
            this.ctx.beginPath();
            // Slightly wobbly line
            for (let x = 0; x < this.width; x += 20) {
                const wobble = (Math.random() - 0.5) * 0.5;
                if (x === 0) {
                    this.ctx.moveTo(x, y + wobble);
                } else {
                    this.ctx.lineTo(x, y + wobble);
                }
            }
            this.ctx.stroke();
        }
    }

    private drawGridLines() {
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.lineWidth = 0.5;
        const gridSize = 20;

        // Horizontal lines
        for (let y = 0; y < this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Vertical lines
        for (let x = 0; x < this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
    }

    private drawMarginLine(marginLeft: number, color?: string) {
        this.ctx.strokeStyle = color || "#f87171";
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();

        // Hand-drawn effect - slightly wobbly
        for (let y = 0; y < this.height; y += 10) {
            const wobble = (Math.random() - 0.5) * 2;
            if (y === 0) {
                this.ctx.moveTo(marginLeft + wobble, y);
            } else {
                this.ctx.lineTo(marginLeft + wobble, y);
            }
        }
        this.ctx.stroke();
    }

    async renderLatex(latex: string, x: number, y: number, style: HandwritingStyle, isDisplay: boolean = false): Promise<{ width: number, height: number }> {
        return new Promise((resolve) => {
            // Ensure KaTeX is loaded globally
            if (!(window as any).katex) {
                console.warn("KaTeX not loaded. Cannot render LaTeX.");
                resolve({ width: 0, height: 0 });
                return;
            }

            try {
                // Clear previous content in the temporary container
                this.tempContainer.innerHTML = "";
                const el = document.createElement('div');
                // Set font size and color to match the current style
                // Slightly larger for better readability if display
                el.style.fontSize = `${style.size * (isDisplay ? 1.2 : 1)}px`;
                el.style.color = style.color;

                // Render LaTeX to the temporary element using KaTeX
                (window as any).katex.render(latex, el, {
                    throwOnError: false,
                    displayMode: isDisplay
                });
                this.tempContainer.appendChild(el);

                // Use html2canvas to convert the rendered LaTeX element to a canvas
                html2canvas(el, { backgroundColor: null, scale: 2 }).then(canvas => {
                    const width = canvas.width / 2;
                    const height = canvas.height / 2;

                    // Draw the rendered LaTeX image onto the main canvas
                    // If inline, align vertically to baseline (y). If block, center?
                    // Assuming y is baseline for text. Math usually sits on baseline.
                    // Adjust: html2canvas captures bounding box.
                    // For inline, we want to align bottom?
                    // Let's center vertically around y - height/2 for now.
                    this.ctx.drawImage(canvas, x, y - height * 0.8, width, height);

                    // Clean up the temporary container
                    this.tempContainer.innerHTML = "";
                    resolve({ width, height }); // Resolve with dimensions
                }).catch(e => {
                    console.error("html2canvas failed for LaTeX:", e);
                    this.tempContainer.innerHTML = "";
                    resolve({ width: 0, height: 0 });
                });
            } catch (e) {
                console.error("Error during KaTeX rendering or conversion:", e);
                this.tempContainer.innerHTML = "";
                resolve({ width: 0, height: 0 });
            }
        });
    }

    // Async Render text with human imperfections
    async renderText(text: string, style: HandwritingStyle, startX: number, startY: number) {
        this.ctx.font = `${style.size}px "${style.font}", cursive`;
        this.ctx.fillStyle = style.color;
        this.ctx.textBaseline = "alphabetic";

        const lineHeight = style.size * style.lineHeight;
        const maxWidth = this.width - startX - 40;

        let cursorX = startX;
        let cursorY = startY;

        // LaTeX Detection
        const latexRegex = /\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g;

        const paragraphs = text.split("\n");

        for (const paragraph of paragraphs) {
            if (paragraph.trim() === "") {
                cursorY += lineHeight * 0.5;
                continue;
            }

            // Check for LaTeX block in paragraph
            if (paragraph.match(latexRegex)) {
                // Heuristic: Split by potential latex delimiters
                const parts = paragraph.split(latexRegex).filter(p => p !== undefined && p !== "");

                for (const part of parts) {
                    if (part.includes("\\") || part.includes("^") || part.includes("_") || part.includes("{")) {
                        // Default to inline unless explicitly block? Or treat as block if splitting by newlines?
                        // renderText assumes parts are mixed. Let's assume inline for snippets.
                        // But regex split includes delimiters? Yes.
                        // If checks pass, strip delimiters?
                        let content = part;
                        let display = false;
                        if (content.startsWith('$$')) { content = content.slice(2, -2); display = true; }
                        else if (content.startsWith('$')) { content = content.slice(1, -1); }

                        const { height } = await this.renderLatex(content, cursorX, cursorY, style, display);
                        cursorY += height + 10;
                        cursorX = startX;
                    } else {
                        // Render plain text part
                        const res = this.renderWords(part, style, startX, maxWidth, lineHeight, cursorX, cursorY);
                        cursorX = res.x;
                        cursorY = res.y;
                    }
                }
            } else {
                // Standard text rendering
                const res = this.renderWords(paragraph, style, startX, maxWidth, lineHeight, cursorX, cursorY);
                cursorX = res.x;
                cursorY = res.y;
            }

            // New line after paragraph
            cursorX = startX;
            cursorY += lineHeight;
        }

        return cursorY;
    }


    // NEW: Async Rich Text Rendering
    async renderRichText(text: string, style: HandwritingStyle, startX: number, startY: number) {
        this.ctx.textBaseline = "alphabetic";
        const lineHeight = style.size * style.lineHeight;
        const maxWidth = this.width - startX - 40;

        let cursorX = startX;
        let cursorY = startY;

        const lines = text.split("\n");

        for (const line of lines) {
            // List detection
            let cleanLine = line;
            let isList = false;

            if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                isList = true;
                cleanLine = line.trim().substring(2);

                // Draw bullet
                this.ctx.beginPath();
                this.ctx.fillStyle = style.color;
                this.ctx.arc(startX + 10, cursorY - style.size / 3, style.size / 5, 0, Math.PI * 2);
                this.ctx.fill();
                cursorX = startX + 30; // Indent
            } else if (/^\d+\.\s/.test(line.trim())) {
                isList = true;
                const match = line.trim().match(/^(\d+)\.\s/);
                if (match) {
                    cleanLine = line.trim().substring(match[0].length);
                    // Use sync helper or async text? renderText is now async.
                    await this.renderText(match[1] + ".", style, startX, cursorY);
                    cursorX = startX + 30; // Indent
                }
            } else {
                cursorX = startX;
            }

            // Tokenize for Bold/Italic/Latex
            const tokens = this.parseRichText(cleanLine);

            for (const token of tokens) {
                if (token.type === 'latex') {
                    // Check if fit on line (for inline) or force newline (block)
                    if (token.display) {
                        // Block Latex: New line before and after
                        cursorX = startX;
                        cursorY += lineHeight;
                        const { height } = await this.renderLatex(token.content, cursorX, cursorY, style, true);
                        cursorY += height + 10;
                    } else {
                        // Inline Latex
                        // We don't know width yet, so render offscreen first? Or just render and hope?
                        // renderLatex renders directly.
                        // But if it wraps? Math shouldn't wrap mid-equation usually.
                        // If too long, maybe wrap before starting?
                        // For now, render at current cursor.
                        const { width } = await this.renderLatex(token.content, cursorX, cursorY, style, false);
                        cursorX += width + 10;
                        if (cursorX > startX + maxWidth) {
                            // Wrap? Too late, already drew.
                            // Ideal: measure first. But kaTeX measurements available?
                            // MVP: Ignore wrapping for inline math or let it overflow.
                        }
                    }
                    continue;
                }

                // Set font style
                let currentFont = `${style.size}px "${style.font}", cursive`;
                let isBold = token.type === 'bold';

                this.ctx.font = currentFont;
                this.ctx.fillStyle = style.color;

                if (isBold || token.type === 'bold') {
                    this.ctx.lineWidth = 1; // thinner stroke for faux bold
                    this.ctx.strokeStyle = style.color;
                } else {
                    this.ctx.strokeStyle = "transparent";
                }

                // Italic transform is handled inside loop via ctx.transform

                // Render words
                const words = token.content.split(" ");
                for (const word of words) {
                    const wordWidth = this.ctx.measureText(word).width + (word.length * style.letterSpacing);

                    if (cursorX + wordWidth > startX + maxWidth) {
                        cursorX = isList ? startX + 30 : startX;
                        cursorY += lineHeight;
                    }

                    for (let i = 0; i < word.length; i++) {
                        const char = word[i];
                        const jitterX = (Math.random() - 0.5) * style.perturbation * 2;
                        const jitterY = (Math.random() - 0.5) * style.perturbation * 2;
                        const rotation = (Math.random() - 0.5) * (style.rotation * Math.PI / 180);
                        const baselineNoise = (Math.random() - 0.5) * style.baselineShift;
                        const waveDrift = Math.sin(cursorX / 100) * style.perturbation;

                        this.ctx.save();
                        this.ctx.translate(cursorX + jitterX, cursorY + jitterY + baselineNoise + waveDrift);
                        this.ctx.rotate(rotation);

                        if (token.type === 'italic') {
                            this.ctx.transform(1, 0, -0.2, 1, 0, 0);
                        }

                        this.ctx.fillText(char, 0, 0);
                        if (isBold) this.ctx.strokeText(char, 0, 0);

                        this.ctx.restore();
                        const charWidth = this.ctx.measureText(char).width;
                        cursorX += charWidth + style.letterSpacing + (Math.random() * style.perturbation);
                    }
                    cursorX += style.wordSpacing + (Math.random() * style.perturbation * 2);
                }
            }

            cursorX = startX;
            cursorY += lineHeight;
        }

        return cursorY;
    }

    // Helper method called by renderText
    private renderWords(text: string, style: HandwritingStyle, startX: number, maxWidth: number, lineHeight: number, currentX: number, currentY: number) {
        let cursorX = currentX;
        let cursorY = currentY;
        const words = text.split(" ");

        words.forEach((word) => {
            const wordWidth = this.ctx.measureText(word).width + (word.length * style.letterSpacing);

            if (cursorX + wordWidth > startX + maxWidth) {
                cursorX = startX;
                cursorY += lineHeight;
            }

            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const jitterX = (Math.random() - 0.5) * style.perturbation * 2;
                const jitterY = (Math.random() - 0.5) * style.perturbation * 2;
                const rotation = (style.slant * Math.PI / 180) + (Math.random() - 0.5) * (style.rotation * Math.PI / 180);
                const baselineNoise = (Math.random() - 0.5) * style.baselineShift;
                const waveDrift = Math.sin(cursorX / 100) * style.perturbation;

                this.ctx.save();
                this.ctx.translate(cursorX + jitterX, cursorY + jitterY + baselineNoise + waveDrift);
                this.ctx.rotate(rotation);
                this.ctx.fillText(char, 0, 0);
                this.ctx.restore();

                const charWidth = this.ctx.measureText(char).width;
                cursorX += charWidth + style.letterSpacing + (Math.random() * style.perturbation);
            }
            cursorX += style.wordSpacing + (Math.random() * style.perturbation * 2);
        });

        return { x: cursorX, y: cursorY };
    }

    private parseRichText(text: string): { type: 'text' | 'bold' | 'italic' | 'latex', content: string, display?: boolean }[] {
        const tokens: { type: 'text' | 'bold' | 'italic' | 'latex', content: string, display?: boolean }[] = [];
        // Combined regex for Latex ($$ or \[ or \( or $), Bold (**), Italic (*)
        const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\])|(\\\([\s\S]+?\\\)|\\\$[\s\S]+?\\\$|\$[^$]+?\$)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;

        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Text before match
            if (match.index > lastIndex) {
                tokens.push({ type: 'text', content: text.substring(lastIndex, match.index) });
            }

            if (match[1]) {
                // Block Latex (strip delimiters)
                let content = match[1];
                if (content.startsWith('$$')) content = content.slice(2, -2);
                else if (content.startsWith('\\[')) content = content.slice(2, -2);
                tokens.push({ type: 'latex', content, display: true });
            } else if (match[2]) {
                // Inline Latex
                let content = match[2];
                if (content.startsWith('\\(')) content = content.slice(2, -2);
                else if (content.startsWith('$')) content = content.slice(1, -1);
                tokens.push({ type: 'latex', content, display: false });
            } else if (match[3]) {
                // Bold
                tokens.push({ type: 'bold', content: match[3].slice(2, -2) });
            } else if (match[4]) {
                // Italic
                tokens.push({ type: 'italic', content: match[4].slice(1, -1) });
            }

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            tokens.push({ type: 'text', content: text.substring(lastIndex) });
        }
        return tokens;
    }

    // Render exam-style answer with strict margin logic
    // Returns next generic Y position
    async renderExamQuestion(
        qNum: string,
        questionText: string,
        answerText: string,
        style: HandwritingStyle,
        pageConfig: PageConfig,
        startY: number
    ) {
        let currentY = startY;
        const marginX = pageConfig.marginLeft;
        const contentX = marginX + 20;

        // Draw Q# to LEFT of margin
        await this.renderText(qNum, { ...style, size: style.size * 1.1, color: "#ef4444" }, marginX - 45, currentY);

        // Draw "Ans:" + Question Text to RIGHT of margin
        // Using darker slate for better visibility
        currentY = await this.renderRichText(`Ans: ${questionText}`, { ...style, color: "#334155" }, contentX, currentY);
        currentY += style.size * 0.5; // Gap

        // Draw Answer Step-by-Step
        const steps = answerText.split("\n");

        for (const step of steps) {
            // Correction Simulation: Randomly strike through words (1% chance)
            if (Math.random() > 0.99) {
                await this.simulateCorrection(contentX, currentY, style);
                currentY += style.size * 1.2;
            }

            // Render formatted steps
            if (step.startsWith("Step") || step.startsWith("Given") || step.startsWith("Therefore")) {
                currentY = await this.renderRichText(step, { ...style, color: "#000" }, contentX, currentY);
            } else if (step.startsWith("Final Answer")) {
                // Underline final answer
                const finalY = await this.renderRichText(step, style, contentX, currentY);
                this.drawUnderline(contentX, finalY - 5, 200); // Approximate width
                currentY = finalY;
            } else {
                currentY = await this.renderRichText(step, style, contentX, currentY);
            }
        }

        return currentY + 40; // Gap between questions
    }

    private async simulateCorrection(x: number, y: number, style: HandwritingStyle) {
        // Write "mistake"
        const mistakeText = "wronng value";
        const width = this.ctx.measureText(mistakeText).width;
        await this.renderText(mistakeText, style, x, y);

        // Scratch it out
        this.ctx.beginPath();
        this.ctx.strokeStyle = style.color;
        this.ctx.lineWidth = 1.5;

        for (let i = 0; i < width; i += 5) {
            const wobble = (Math.random() - 0.5) * 10;
            if (i === 0) this.ctx.moveTo(x + i, y - 10 + wobble);
            else this.ctx.lineTo(x + i, y - 10 + wobble);
        }
        this.ctx.stroke();
    }

    private drawUnderline(x: number, y: number, width: number) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#1a1a1a"; // Pencil/Pen color
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(x, y);

        // Slightly arched underline
        const cpX = x + width / 2;
        const cpY = y + 2;
        this.ctx.quadraticCurveTo(cpX, cpY, x + width, y);

        this.ctx.stroke();
    }

    // Draw pencil-style diagram (basic shapes)
    drawPencilLine(x1: number, y1: number, x2: number, y2: number) {
        this.ctx.strokeStyle = "#666666";
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([]);

        this.ctx.beginPath();

        // Hand-drawn effect with multiple strokes
        for (let i = 0; i < 2; i++) {
            const offsetX = (Math.random() - 0.5) * 2;
            const offsetY = (Math.random() - 0.5) * 2;
            this.ctx.moveTo(x1 + offsetX, y1 + offsetY);

            // Wobbly line through control points
            const steps = 10;
            for (let j = 1; j <= steps; j++) {
                const t = j / steps;
                const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 2;
                const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 2;
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
    }

    drawPencilCircle(cx: number, cy: number, radius: number) {
        this.ctx.strokeStyle = "#666666";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        // Imperfect circle
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
            const wobble = (Math.random() - 0.5) * 3;
            const x = cx + (radius + wobble) * Math.cos(angle);
            const y = cy + (radius + wobble) * Math.sin(angle);

            if (angle === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.closePath();
        this.ctx.stroke();
    }
}
