export interface HandwritingStyle {
    font: string;
    size: number;
    color: string;
    wordSpacing: number;
    lineHeight: number;
    perturbation: number; // 0 to 1, how messy
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

    // Draw background paper texture
    drawPaper() {
        this.ctx.fillStyle = "#fffdf5";
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Grid / Ruled lines
        this.ctx.strokeStyle = "#e2e8f0";
        this.ctx.lineWidth = 1;
        const startY = 100;
        const lineHeight = 30;

        for (let y = startY; y < this.height; y += lineHeight) {
            this.ctx.beginPath();
            // Add slight curve/wobble to line for realism? Maybe too heavy.
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Margin
        this.ctx.strokeStyle = "#f87171";
        this.ctx.beginPath();
        this.ctx.moveTo(80, 0);
        this.ctx.lineTo(80, this.height);
        this.ctx.stroke();
    }

    // Render text with "human" imperfections
    renderText(text: string, style: HandwritingStyle) {
        this.ctx.font = `${style.size}px "${style.font}", cursive`;
        this.ctx.fillStyle = style.color;
        this.ctx.textBaseline = "bottom";

        const startX = 90;
        const startY = 100;
        const lineHeight = 30 * style.lineHeight;
        const maxWidth = this.width - 100;

        let cursorX = startX;
        let cursorY = startY;

        const words = text.split(" ");

        words.forEach((word) => {
            const wordWidth = this.ctx.measureText(word).width;

            // Wrap to new line
            if (cursorX + wordWidth > maxWidth + startX) {
                cursorX = startX;
                cursorY += lineHeight;
            }

            // Draw character by character for jitter
            for (let i = 0; i < word.length; i++) {
                const char = word[i];

                // Random perturbations
                const jitterX = (Math.random() - 0.5) * style.perturbation * 2;
                const jitterY = (Math.random() - 0.5) * style.perturbation * 2;
                const rotation = (Math.random() - 0.5) * style.perturbation * 0.2; // Radians

                this.ctx.save();
                this.ctx.translate(cursorX + jitterX, cursorY + jitterY);
                this.ctx.rotate(rotation);
                this.ctx.fillText(char, 0, 0);
                this.ctx.restore();

                cursorX += this.ctx.measureText(char).width + (Math.random() * style.perturbation);
            }

            cursorX += style.wordSpacing + (Math.random() * style.perturbation * 5);
        });
    }
}
