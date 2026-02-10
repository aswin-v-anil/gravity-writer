import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set worker path (use CDN to avoid build issues)
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${"3.11.174"}/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n\n";
    }

    return fullText;
}

export async function extractTextFromImage(file: File): Promise<string> {
    // Placeholder - for images we'd need OCR (tesseract.js).
    // For now, return a placeholder or implement basic OCR later if requested.
    return "Image text extraction requires OCR (Tesseract.js). Please upload a PDF or Text file for now.";
}

export async function parseDocument(file: File): Promise<string> {
    if (file.type === "application/pdf") {
        return extractTextFromPDF(file);
    } else if (file.type.startsWith("text/")) {
        return await file.text();
    } else if (file.type.startsWith("image/")) {
        return extractTextFromImage(file);
    } else {
        throw new Error("Unsupported file type");
    }
}
