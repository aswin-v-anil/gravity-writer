import { jsPDF } from 'jspdf';

/**
 * Exports canvas elements as a multi-page PDF
 * @param canvases - Array of canvas elements (one per page)
 * @param filename - Name of the downloaded PDF file
 */
export async function exportToPDF(canvases: HTMLCanvasElement[], filename: string = "handwritten_notes.pdf") {
    if (canvases.length === 0) return;

    // A4 dimensions in mm
    const a4Width = 210;
    const a4Height = 297;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) {
            pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, a4Width, a4Height);
    }

    pdf.save(filename);
}

/**
 * Exports a single canvas as PNG image
 * @param canvas - The canvas element to export
 * @param filename - Name of the downloaded PNG file
 */
export function exportToPNG(canvas: HTMLCanvasElement, filename: string = "handwritten_page.png") {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
