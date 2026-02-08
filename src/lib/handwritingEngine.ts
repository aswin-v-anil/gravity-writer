export interface HandwritingStyle {
    font: string;
    size: number;
    color: string;
    wordSpacing: number;
    lineHeight: number;
    perturbation: number;
    rotation: number;
}

export interface PageConfig {
    paperType: "plain" | "ruled" | "grid";
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

        // Off-white background
        this.ctx.fillStyle = "#FFFEF5";
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
        this.ctx.textBaseline = "bottom";

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
                const wordWidth = this.ctx.measureText(word).width;

                // Word wrap
                if (cursorX + wordWidth > startX + maxWidth) {
                    cursorX = startX;
                    cursorY += lineHeight;
                }

                // Draw character by character with imperfections
                for (let i = 0; i < word.length; i++) {
                    const char = word[i];

                    // Random perturbations based on messiness
                    const jitterX = (Math.random() - 0.5) * style.perturbation * 4;
                    const jitterY = (Math.random() - 0.5) * style.perturbation * 3;
                    const rotation = (Math.random() - 0.5) * (style.rotation * Math.PI / 180);

                    // Baseline drift (cumulative slight movement)
                    const baselineDrift = Math.sin(cursorX / 100) * style.perturbation;

                    this.ctx.save();
                    this.ctx.translate(cursorX + jitterX, cursorY + jitterY + baselineDrift);
                    this.ctx.rotate(rotation);
                    this.ctx.fillText(char, 0, 0);
                    this.ctx.restore();

                    // Variable character spacing
                    const charWidth = this.ctx.measureText(char).width;
                    cursorX += charWidth + (Math.random() * style.perturbation * 2);
                }

                // Word spacing with variation
                cursorX += style.wordSpacing + (Math.random() * style.perturbation * 3);
            });

            // New line after paragraph
            cursorX = startX;
            cursorY += lineHeight;
        });

        return cursorY; // Return final Y position for multi-page support
    }

    // Render exam-style answer
    renderExamAnswer(question: string, answer: string, style: HandwritingStyle) {
        const config: PageConfig = {
            paperType: "plain",
            width: this.width,
            height: this.height,
            marginLeft: 60,
            marginTop: 80,
        };

        this.drawPaper(config);

        let y = config.marginTop;
        const x = config.marginLeft + 20;

        // Question number (if present)
        if (question) {
            y = this.renderText(`Q: ${question}`, { ...style, size: style.size - 2 }, x, y);
            y += 20;
        }

        // Answer with exam formatting
        y = this.renderText(answer, style, x, y);

        return y;
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
