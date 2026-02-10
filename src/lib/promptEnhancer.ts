import { EngineeringSubject, SubjectDetectionResult } from "./subjectDetector";

const SUBJECT_PROMPTS: Record<EngineeringSubject, string> = {
    [EngineeringSubject.MATHEMATICS]: "Solve this engineering mathematics problem with rigorous step-by-step derivation. Use LaTeX for all equations. State all theorems used. Show the final answer clearly underlined.",
    [EngineeringSubject.PHYSICS]: "Explain the physical principles involved. Derivation should be clear with appropriate symbols ($ and $$). Mention units clearly. Describe any necessary diagrams.",
    [EngineeringSubject.CHEMISTRY]: "Explain the chemical reaction mechanism or molecular structure. Use bullet points for properties. Show the balanced chemical equation if applicable.",
    [EngineeringSubject.GRAPHICS]: "Provide detailed instructions for orthographic or isometric projection. Describe the views (Front, Top, Side) step by step. Mention dimensions.",
    [EngineeringSubject.ELECTRICAL]: "Describe the circuit behavior using KVL/KCL or component principles. Clearly state voltage and current values at each node. Include a description of the circuit diagram.",
    [EngineeringSubject.ELECTRONICS]: "Analyze the semiconductor behavior or logic gate logic. Show the truth table or characteristic equations. Describe the internal circuit schema.",
    [EngineeringSubject.CS]: "Explain the algorithm logic or data structure operation. Provide pseudo-code if needed. Analyze time and space complexity.",
    [EngineeringSubject.MECHANICAL]: "Use thermodynamic or structural analysis. Show the cycle or stress-strain logic. State assumptions clearly.",
    [EngineeringSubject.GENERAL]: "Provide a standard engineering exam answer. Be technical, structured, and clear."
};

export function enhancePrompt(question: string, detection: SubjectDetectionResult): string {
    const basePrompt = SUBJECT_PROMPTS[detection.subject];

    let enhancement = `\n[EXAM STYLE ENFORCEMENT]\n`;
    enhancement += `- Write in the tone of a student during an exam.\n`;
    enhancement += `- Use headings like "Given:", "To Prove:", "Solution:", "Conclusion:".\n`;

    if (detection.requiresDiagram) {
        enhancement += `- This answer REQUIRES a diagram. Integrate a [DIAGRAM: ${detection.diagramType}] placeholder where it makes sense.\n`;
    }

    if (detection.isDerivation) {
        enhancement += `- Focus on mathematical rigorousness.\n`;
    }

    if (detection.isNumerical) {
        enhancement += `- Clearly list given data and target values.\n`;
    }

    return `${basePrompt}\n\nQuestion: ${question}\n\n${enhancement}`;
}
