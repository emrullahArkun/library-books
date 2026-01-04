import React from 'react';
import './StringLights.css';

export const StringLights = () => {
    // We separate the wire (SVG) which needs to stretch, 
    // from the bulbs (HTML divs) which must remain perfectly circular.

    // SVG Coordinate system: 0-100 X, 0-100 Y
    // Curve: M0,0 Q50,150 100,0 -> Peak at t=0.5 is y=75.
    // So lowest point is at 75% of container height.
    // Bulb positions must match the curve Y at their X coordinate.
    // Formula: y = 2 * t * (1-t) * 150.  t = x/100.

    const darkYellow = "#e0a800";

    // Recalculated exact positions for the wire path y values:
    // x=10 -> t=0.1 -> y=2*0.1*0.9*150 = 27  -> 27%
    // x=25 -> t=0.25 -> y=2*0.25*0.75*150 = 56.25 -> ~56%
    // x=40 -> t=0.4 -> y=2*0.4*0.6*150 = 72 -> 72%
    // x=55 -> t=0.55 -> y=2*0.55*0.45*150 = 74.25 -> ~74%
    // x=70 -> t=0.7 -> y=2*0.7*0.3*150 = 63 -> 63%
    // x=85 -> t=0.85 -> y=2*0.85*0.15*150 = 38.25 -> ~38%

    const lights = [
        { left: "10%", top: "27%", delay: "0s", color: darkYellow },
        { left: "25%", top: "56%", delay: "1s", color: darkYellow },
        { left: "40%", top: "72%", delay: "0.5s", color: darkYellow },
        { left: "55%", top: "74%", delay: "1.5s", color: darkYellow },
        { left: "70%", top: "63%", delay: "0.2s", color: darkYellow },
        { left: "85%", top: "38%", delay: "1.2s", color: darkYellow },
    ];

    return (
        <div className="string-lights-container">
            {/* The Wire - stretches with SVG */}
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="string-lights-svg"
            >
                <path
                    d="M0,0 Q50,150 100,0"
                    fill="none"
                    stroke="var(--neutral-800)"
                    strokeWidth="0.5"
                    className="string-lights__cord"
                />
            </svg>

            {/* The Bulbs - absolute HTML elements */}
            {lights.map((light, index) => (
                <div
                    key={index}
                    className="string-lights__bulb-wrapper"
                    style={{
                        left: light.left,
                        top: light.top,
                    }}
                >
                    {/* The Cord Socket (small connecting line) */}
                    <div className="string-lights__socket" />

                    {/* The Bulb itself */}
                    <div
                        className="string-lights__bulb"
                        style={{
                            animationDelay: light.delay,
                            backgroundColor: light.color,
                            boxShadow: `0 0 8px ${light.color}`
                        }}
                    />
                </div>
            ))}
        </div>
    );
};
