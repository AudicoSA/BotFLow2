'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
    id: number;
    x: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
    rotation: number;
}

const COLORS = [
    '#00B4D8', // surf
    '#0077B6', // ocean
    '#F4A261', // sand
    '#E76F51', // sunset
    '#10B981', // green
    '#8B5CF6', // violet
    '#F59E0B', // amber
];

export default function Confetti() {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Generate confetti pieces
        const newPieces: ConfettiPiece[] = [];
        for (let i = 0; i < 50; i++) {
            newPieces.push({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 0.5,
                duration: 2 + Math.random() * 2,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: 8 + Math.random() * 8,
                rotation: Math.random() * 360,
            });
        }
        setPieces(newPieces);

        // Hide after animation
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {pieces.map((piece) => (
                        <motion.div
                            key={piece.id}
                            initial={{
                                x: `${piece.x}vw`,
                                y: -20,
                                rotate: 0,
                                opacity: 1,
                            }}
                            animate={{
                                y: '110vh',
                                rotate: piece.rotation + 720,
                                opacity: [1, 1, 0],
                            }}
                            transition={{
                                duration: piece.duration,
                                delay: piece.delay,
                                ease: 'linear',
                            }}
                            style={{
                                position: 'absolute',
                                width: piece.size,
                                height: piece.size,
                                backgroundColor: piece.color,
                                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                            }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}
