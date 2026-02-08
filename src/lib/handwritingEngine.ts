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
    rotation: number;
    baselineShift: number; // Random vertical shift
}

export interface PageConfig {
    paperType: "plain" | "ruled" | "grid" | "vintage";
    width: number;
    height: number;
    marginLeft: number;
    marginTop: number;
}

export class HandwritingEngine {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    // Draw paper with different types
    drawPaper(config: PageConfig) {
        const { paperType, marginLeft } = config;

        // Background Color
        if (paperType === "vintage") {
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
        this.drawMarginLine(marginLeft);
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

    private drawMarginLine(marginLeft: number) {
        this.ctx.strokeStyle = "#f87171";
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

    // Render text with human imperfections
    renderText(text: string, style: HandwritingStyle, startX: number, startY: number) {
        this.ctx.font = `${style.size}px "${style.font}", cursive`;
        this.ctx.fillStyle = style.color;
        this.ctx.textBaseline = "alphabetic"; // Better for baseline shift

        const lineHeight = style.size * style.lineHeight;
        const maxWidth = this.width - startX - 40;

        let cursorX = startX;
        let cursorY = startY;

        // Split by newlines first for exam-style formatting
        const paragraphs = text.split("\n");

        paragraphs.forEach((paragraph) => {
            if (paragraph.trim() === "") {
                cursorY += lineHeight * 0.5;
                return;
            }

            const words = paragraph.split(" ");

            words.forEach((word) => {
                const wordWidth = this.ctx.measureText(word).width + (word.length * style.letterSpacing);

                // Word wrap
                if (cursorX + wordWidth > startX + maxWidth) {
                    cursorX = startX;
                    cursorY += lineHeight;
                }

                // Draw character by character with imperfections
                for (let i = 0; i < word.length; i++) {
                    const char = word[i];

                    // Random perturbations based on messiness
                    const jitterX = (Math.random() - 0.5) * style.perturbation * 2;
                    const jitterY = (Math.random() - 0.5) * style.perturbation * 2;
                    const rotation = (Math.random() - 0.5) * (style.rotation * Math.PI / 180);

                    // Baseline drift (cumulative slight movement) + explicit shift
                    const baselineNoise = (Math.random() - 0.5) * style.baselineShift;
                    const waveDrift = Math.sin(cursorX / 100) * style.perturbation;

                    this.ctx.save();
                    this.ctx.translate(cursorX + jitterX, cursorY + jitterY + baselineNoise + waveDrift);
                    this.ctx.rotate(rotation);
                    this.ctx.fillText(char, 0, 0);
                    this.ctx.restore();

                    // Variable character spacing
                    const charWidth = this.ctx.measureText(char).width;
                    cursorX += charWidth + style.letterSpacing + (Math.random() * style.perturbation);
                }

                // Word spacing with variation
                cursorX += style.wordSpacing + (Math.random() * style.perturbation * 2);
            });

            // New line after paragraph
            cursorX = startX;
            cursorY += lineHeight;
        });

        return cursorY; // Return final Y position for multi-page support
    }


    // NEW: Rich Text Rendering
    renderRichText(text: string, style: HandwritingStyle, startX: number, startY: number) {
        this.ctx.textBaseline = "alphabetic";
        const lineHeight = style.size * style.lineHeight;
        const maxWidth = this.width - startX - 40;

        let cursorX = startX;
        let cursorY = startY;

        const lines = text.split("\n");

        lines.forEach((line) => {
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
                    this.renderText(match[1] + ".", style, startX, cursorY); // Render number
                    cursorX = startX + 30; // Indent
                }
            } else {
                cursorX = startX;
            }

            // Tokenize for Bold/Italic: **bold** *italic*
            const tokens = this.parseMarkdown(cleanLine);

            tokens.forEach((token) => {
                // Set font style
                let currentFont = `${style.size}px "${style.font}", cursive`;
                let isBold = token.type === 'bold';

                // Emulate bold/italic
                // Note: Canvas doesn't support "bold cursive" well for all google fonts, 
                // so we use stroke for bold and skew for italic if needed.

                this.ctx.font = currentFont;
                this.ctx.fillStyle = style.color;

                if (isBold) {
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeStyle = style.color;
                } else {
                    this.ctx.strokeStyle = "transparent";
                }

                const words = token.text.split(" ");

                words.forEach((word) => {
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

                        // Italic simulation
                        if (token.type === 'italic') {
                            this.ctx.transform(1, 0, -0.2, 1, 0, 0);
                        }

                        this.ctx.fillText(char, 0, 0);
                        if (isBold) this.ctx.strokeText(char, 0, 0); // Bold effect

                        this.ctx.restore();

                        const charWidth = this.ctx.measureText(char).width;
                        cursorX += charWidth + style.letterSpacing + (Math.random() * style.perturbation);
                    }

                    cursorX += style.wordSpacing + (Math.random() * style.perturbation * 2);
                });
            });

            cursorX = startX;
            cursorY += lineHeight;
        });

        return cursorY;
    }

    private parseMarkdown(text: string): { type: 'normal' | 'bold' | 'italic', text: string }[] {
        const tokens: { type: 'normal' | 'bold' | 'italic', text: string }[] = [];
        let buffer = "";
        let i = 0;

        while (i < text.length) {
            if (text.startsWith("**", i)) {
                if (buffer) tokens.push({ type: 'normal', text: buffer });
                buffer = "";
                i += 2;
                let end = text.indexOf("**", i);
                if (end === -1) end = text.length;
                tokens.push({ type: 'bold', text: text.substring(i, end) });
                i = end + 2;
            } else if (text.startsWith("*", i)) {
                if (buffer) tokens.push({ type: 'normal', text: buffer });
                buffer = "";
                i += 1;
                let end = text.indexOf("*", i);
                if (end === -1) end = text.length;
                tokens.push({ type: 'italic', text: text.substring(i, end) });
                i = end + 1;
            } else {
                buffer += text[i];
                i++;
            }
        }
        if (buffer) tokens.push({ type: 'normal', text: buffer });
        return tokens;
    }

    // Render exam-style answer with strict margin logic
    // Returns next generic Y position
    renderExamQuestion(
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
        this.renderText(qNum, { ...style, size: style.size * 1.1, color: "#ef4444" }, marginX - 45, currentY);

        // Draw "Ans:" + Question Text to RIGHT of margin
        currentY = this.renderRichText(`Ans: ${questionText}`, { ...style, color: "#64748b" }, contentX, currentY);
        currentY += style.size * 0.5; // Gap

        // Draw Answer Step-by-Step
        const steps = answerText.split("\n");

        steps.forEach((step) => {
            // Correction Simulation: Randomly strike through words (1% chance)
            if (Math.random() > 0.99) {
                this.simulateCorrection(contentX, currentY, style);
                currentY += style.size * 1.2;
            }

            // Render formatted steps
            if (step.startsWith("Step") || step.startsWith("Given") || step.startsWith("Therefore")) {
                currentY = this.renderRichText(step, { ...style, color: "#000" }, contentX, currentY);
            } else if (step.startsWith("Final Answer")) {
                // Underline final answer
                const finalY = this.renderRichText(step, style, contentX, currentY);
                this.drawUnderline(contentX, finalY - 5, 200); // Approximate width
                currentY = finalY;
            } else {
                currentY = this.renderRichText(step, style, contentX, currentY);
            }
        });

        return currentY + 40; // Gap between questions
    }

    private simulateCorrection(x: number, y: number, style: HandwritingStyle) {
        // Write "mistake"
        const mistakeText = "wronng value";
        const width = this.ctx.measureText(mistakeText).width;
        this.renderText(mistakeText, style, x, y);

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
