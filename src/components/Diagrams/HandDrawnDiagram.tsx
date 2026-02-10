"use client";

import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';

interface HandDrawnDiagramProps {
    type: "circuit" | "graph" | "projection" | "mechanism" | "freehand";
    width?: number;
    height?: number;
    intensity?: number; // 0-1 for roughness
}

export const HandDrawnDiagram: React.FC<HandDrawnDiagramProps> = ({
    type,
    width = 400,
    height = 300,
    intensity = 0.5
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        // Clear previous
        while (svgRef.current.firstChild) {
            svgRef.current.removeChild(svgRef.current.firstChild);
        }

        const rc = rough.svg(svgRef.current);
        const roughness = 1 + intensity * 2;
        const stroke = "#444";
        const strokeWidth = 1.5;

        if (type === "circuit") {
            // Draw a basic battery + resistor circuit
            // Wires
            svgRef.current.appendChild(rc.line(50, 50, 350, 50, { roughness }));
            svgRef.current.appendChild(rc.line(350, 50, 350, 250, { roughness }));
            svgRef.current.appendChild(rc.line(350, 250, 50, 250, { roughness }));
            svgRef.current.appendChild(rc.line(50, 250, 50, 50, { roughness }));

            // Battery
            svgRef.current.appendChild(rc.line(40, 140, 60, 140, { strokeWidth: 3, roughness }));
            svgRef.current.appendChild(rc.line(30, 160, 70, 160, { strokeWidth: 1.5, roughness }));

            // Resistor (Zig-zag)
            const rx = 150;
            const ry = 50;
            svgRef.current.appendChild(rc.path(`M ${rx} ${ry} l 10 -10 l 20 20 l 20 -20 l 20 20 l 20 -20 l 10 10`, { roughness }));

            // Label
            addText(svgRef.current, 175, 25, "R1 = 10 \u03a9");
            addText(svgRef.current, 10, 150, "12V");
        }
        else if (type === "graph") {
            // Axes
            svgRef.current.appendChild(rc.line(50, 250, 350, 250, { roughness })); // X
            svgRef.current.appendChild(rc.line(50, 250, 50, 50, { roughness })); // Y

            // Curve (Sine-ish)
            let path = "M 50 200";
            for (let x = 50; x <= 350; x += 30) {
                const y = 150 + Math.sin((x - 50) / 50) * 50;
                path += ` L ${x} ${y}`;
            }
            svgRef.current.appendChild(rc.path(path, { roughness, stroke: "#2563eb" }));

            addText(svgRef.current, 360, 255, "x");
            addText(svgRef.current, 35, 45, "y");
            addText(svgRef.current, 150, 280, "Fig: Characteristic Curve");
        }
        else if (type === "projection") {
            // Orthographic Box
            svgRef.current.appendChild(rc.rectangle(100, 100, 150, 100, { roughness }));
            svgRef.current.appendChild(rc.rectangle(130, 70, 150, 100, { roughness, stroke: "#888" }));
            // Connect corners
            svgRef.current.appendChild(rc.line(100, 100, 130, 70, { roughness }));
            svgRef.current.appendChild(rc.line(250, 100, 280, 70, { roughness }));
            svgRef.current.appendChild(rc.line(100, 200, 130, 170, { roughness }));
            svgRef.current.appendChild(rc.line(250, 200, 280, 170, { roughness }));

            addText(svgRef.current, 150, 230, "Isometric View of Block");
        }
        else {
            // Freehand / Mechanism
            svgRef.current.appendChild(rc.circle(100, 100, 40, { roughness, fill: "rgba(200,0,0,0.1)", fillStyle: 'hachure' }));
            svgRef.current.appendChild(rc.line(100, 100, 250, 150, { strokeWidth: 4, roughness }));
            svgRef.current.appendChild(rc.circle(250, 150, 20, { roughness, fill: "rgba(0,0,200,0.1)" }));

            addText(svgRef.current, 150, 180, "Linkage Mechanism");
        }

    }, [type, width, height, intensity]);

    const addText = (svg: SVGSVGElement, x: number, y: number, text: string) => {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", x.toString());
        t.setAttribute("y", y.toString());
        t.setAttribute("style", "font-family: 'Inter', cursive; font-size: 14px; fill: #333;");
        t.textContent = text;
        svg.appendChild(t);
    };

    return (
        <div className="my-4 flex justify-center bg-slate-50 rounded-lg p-4 border border-slate-100 overflow-hidden">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="max-w-full h-auto"
            />
        </div>
    );
};
