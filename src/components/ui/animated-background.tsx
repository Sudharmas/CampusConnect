
'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
  particleColor?: string;
  lineColor?: string;
  particleAmount?: number;
  defaultSpeed?: number;
  variant?: 'login' | 'app';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className,
  particleColor = 'rgba(128, 255, 255, 0.7)', // Cyan-like color with some transparency
  lineColor = 'rgba(128, 255, 255, 0.1)', // Faint lines
  particleAmount = 50,
  defaultSpeed = 0.5,
  variant = 'app'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles: Particle[] = [];
    const particleBaseSize = 2;

    class Particle {
      x: number;
      y: number;
      speed: number;
      directionAngle: number;
      color: string;
      size: number;
      dx: number;
      dy: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.speed = defaultSpeed + Math.random() * defaultSpeed;
        this.directionAngle = Math.floor(Math.random() * 360);
        this.color = particleColor;
        this.size = particleBaseSize + Math.random() * (particleBaseSize / 2);

        const angle = (this.directionAngle * Math.PI) / 180;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
      }

      update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x > width || this.x < 0) this.dx *= -1;
        if (this.y > height || this.y < 0) this.dy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleAmount; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      if (!ctx) return;
      let x1, y1, x2, y2, length, opacity;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          x1 = particles[i].x;
          y1 = particles[i].y;
          x2 = particles[j].x;
          y2 = particles[j].y;
          length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

          if (length < 200) {
            opacity = 1 - length / 200;
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = lineColor.replace(/,s*([0-9.]+)\)/, `, ${opacity})`);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
    };

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawLines();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    };
    
    window.addEventListener('resize', handleResize);
    createParticles();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleColor, lineColor, particleAmount, defaultSpeed]);

  return (
    <canvas 
      ref={canvasRef} 
      className={cn(
        "fixed top-0 left-0 w-full h-full -z-10",
        variant === 'app' && 'bg-background',
        variant === 'login' && 'bg-background',
        className
      )}
    />
  );
};

export default AnimatedBackground;
