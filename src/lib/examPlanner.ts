export interface PageContent {
    pageNumber: number;
    content: string;
    hasDiagram: boolean;
    diagramType?: string;
}

export interface ExamPlan {
    subject: string;
    totalPages: number;
    pages: PageContent[];
}

// Heuristic: Characters per page (A4 at 24px)
const CHARS_PER_PAGE = 1200;

export function planExam(answerText: string, subject: string, requiresDiagram: boolean, diagramType?: string): ExamPlan {
    const pages: PageContent[] = [];
    const paragraphs = answerText.split('\n');

    let currentPageNum = 1;
    let currentContent = "";
    let currentChars = 0;
    let diagramPlaced = false;

    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];

        // If adding this paragraph exceeds page limit
        if (currentChars + p.length > CHARS_PER_PAGE && currentContent.trim() !== "") {
            // Finalize current page
            pages.push({
                pageNumber: currentPageNum,
                content: currentContent.trim(),
                hasDiagram: !diagramPlaced && requiresDiagram && currentPageNum === 1, // Place diagram on page 1 usually
                diagramType: !diagramPlaced && requiresDiagram && currentPageNum === 1 ? diagramType : undefined
            });

            if (pages[pages.length - 1].hasDiagram) diagramPlaced = true;

            // Start new page
            currentPageNum++;
            currentContent = "";
            currentChars = 0;
        }

        currentContent += p + "\n";
        currentChars += p.length;
    }

    // Add remaining content
    if (currentContent.trim() !== "" || pages.length === 0) {
        pages.push({
            pageNumber: currentPageNum,
            content: currentContent.trim(),
            hasDiagram: !diagramPlaced && requiresDiagram,
            diagramType: !diagramPlaced && requiresDiagram ? diagramType : undefined
        });
    }

    return {
        subject,
        totalPages: pages.length,
        pages
    };
}
