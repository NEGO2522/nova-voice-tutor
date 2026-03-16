"use client";

import { useEffect, useRef } from "react";

export default function FallingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── Star pool ── */
    type Star = {
      x: number; y: number;
      len: number; speed: number;
      opacity: number; width: number;
      trail: number; // trail length multiplier
    };

    const COUNT = 60;
    const stars: Star[] = [];

    const spawn = (): Star => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * -canvas.height, // start above viewport
      len:     Math.random() * 80 + 30,
      speed:   Math.random() * 3 + 1.5,
      opacity: Math.random() * 0.6 + 0.3,
      width:   Math.random() * 1.5 + 0.4,
      trail:   Math.random() * 0.6 + 0.4,
    });

    // pre-fill so screen isn't empty at start
    for (let i = 0; i < COUNT; i++) {
      const s = spawn();
      s.y = Math.random() * canvas.height; // scatter vertically at init
      stars.push(s);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const s of stars) {
        /* falling direction: straight down with a slight right drift */
        const dx = s.speed * 0.18;
        const dy = s.speed;

        s.x += dx;
        s.y += dy;

        /* recycle when off-screen */
        if (s.y - s.len > canvas.height || s.x > canvas.width) {
          Object.assign(s, spawn());
        }

        /* draw a line (head → tail going UP-LEFT) */
        const tailX = s.x - dx * s.trail * (s.len / s.speed);
        const tailY = s.y - dy * s.trail * (s.len / s.speed);

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(1, `rgba(255,255,255,${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = s.width;
        ctx.lineCap     = "round";
        ctx.stroke();

        /* bright head dot */
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.width * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.opacity})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
