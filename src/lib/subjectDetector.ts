
export enum EngineeringSubject {
    MATHEMATICS = "Engineering Mathematics",
    PHYSICS = "Engineering Physics",
    CHEMISTRY = "Engineering Chemistry",
    GRAPHICS = "Engineering Graphics",
    ELECTRICAL = "Electrical Engineering",
    ELECTRONICS = "Electronics Engineering",
    CS = "Computer Science",
    MECHANICAL = "Mechanical Engineering",
    GENERAL = "General Engineering"
}

export interface SubjectDetectionResult {
    subject: EngineeringSubject;
    confidence: number;
    requiresDiagram: boolean;
    diagramType?: "circuit" | "graph" | "projection" | "mechanism" | "freehand";
    isDerivation: boolean;
    isNumerical: boolean;
}

const KEYWORDS: Record<EngineeringSubject, string[]> = {
    [EngineeringSubject.MATHEMATICS]: [
        "integral", "differential", "matrix", "eigenvalue", "laplace", "fourier", "probability", "calculus", "vector", "theorem", "prove that", "evaluate", "solve"
    ],
    [EngineeringSubject.PHYSICS]: [
        "quantum", "relativity", "optics", "laser", "interference", "diffraction", "heisenberg", "schrodinger", "maxwell", "wave", "photon", "velocity", "acceleration"
    ],
    [EngineeringSubject.CHEMISTRY]: [
        "molecule", "atom", "organic", "inorganic", "reaction", "polymer", "corrosion", "electrode", "ph", "titration", "bond", "synthesis"
    ],
    [EngineeringSubject.GRAPHICS]: [
        "projection", "isometric", "orthographic", "top view", "front view", "side view", "plane", "solid", "section", "development of surfaces", "scale"
    ],
    [EngineeringSubject.ELECTRICAL]: [
        "transformer", "motor", "generator", "kvl", "kcl", "circuit", "voltage", "current", "power", "induction", "magnetic", "three phase"
    ],
    [EngineeringSubject.ELECTRONICS]: [
        "diode", "transistor", "bjt", "fet", "amplifier", "oscillator", "gate", "logic", "microprocessor", "semiconductor", "op-amp"
    ],
    [EngineeringSubject.CS]: [
        "algorithm", "data structure", "code", "program", "complexity", "database", "network", "operating system", "automata", "compiler"
    ],
    [EngineeringSubject.MECHANICAL]: [
        "thermodynamics", "stress", "strain", "fluid", "gear", "engine", "cycle", "refrigeration", "entropy", "beams"
    ],
    [EngineeringSubject.GENERAL]: []
};

const DIAGRAM_KEYWORDS = {
    circuit: ["circuit", "diagram", "schematic", "connection"],
    graph: ["plot", "graph", "chart", "characteristic"],
    projection: ["projection", "view", "draw"],
    mechanism: ["mechanism", "structure", "setup"],
    freehand: ["sketch", "draw", "illustrate"]
};

export function detectSubject(text: string): SubjectDetectionResult {
    const lowerText = text.toLowerCase();
    const scores: Record<string, number> = {};

    // 1. Calculate scores based on keyword frequency
    for (const [subject, keywords] of Object.entries(KEYWORDS)) {
        scores[subject] = 0;
        for (const keyword of keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                scores[subject] += 1;
            }
        }
    }

    // 2. Find max score
    let bestSubject = EngineeringSubject.GENERAL;
    let maxScore = 0;

    for (const [subject, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestSubject = subject as EngineeringSubject;
        }
    }

    // 3. Detect Diagram Requirements
    let requiresDiagram = false;
    let diagramType: SubjectDetectionResult["diagramType"] = undefined;

    if (lowerText.includes("draw") || lowerText.includes("sketch") || lowerText.includes("plot") || lowerText.includes("circuit")) {
        requiresDiagram = true;

        // Refine types
        if (bestSubject === EngineeringSubject.ELECTRICAL || bestSubject === EngineeringSubject.ELECTRONICS) {
            diagramType = "circuit";
        } else if (lowerText.includes("graph") || lowerText.includes("plot")) {
            diagramType = "graph";
        } else if (bestSubject === EngineeringSubject.GRAPHICS) {
            diagramType = "projection";
        } else if (bestSubject === EngineeringSubject.CHEMISTRY) {
            diagramType = "mechanism";
        } else {
            diagramType = "freehand";
        }
    }

    // 4. Detect Derivation/Numerical
    const isDerivation = lowerText.includes("derive") || lowerText.includes("prove") || lowerText.includes("expression");
    const isNumerical = lowerText.includes("calculate") || lowerText.includes("determine") || lowerText.includes("find the value");

    return {
        subject: bestSubject,
        confidence: maxScore > 0 ? Math.min(1, maxScore / 3) : 0, // Heuristic confidence
        requiresDiagram,
        diagramType,
        isDerivation,
        isNumerical
    };
}
