import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Prevents a Three.js crash from blanking the whole page
class ErrorBoundary extends React.Component {
    constructor(p) { super(p); this.state = { err: false }; }
    static getDerivedStateFromError() { return { err: true }; }
    render() { return this.state.err ? null : this.props.children; }
}

function ThreeCapsule() {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // ── Renderer ─────────────────────────────────────────────────────
        const W = mount.clientWidth;
        const H = mount.clientHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        // ── Scene & Camera ───────────────────────────────────────────────
        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 50);
        camera.position.set(0, 0, 5);

        // ── Lighting ─────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(4, 6, 5);
        scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0xa5f3fc, 0.5);
        fillLight.position.set(-4, -2, 2);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0x14b8a6, 0.35);
        rimLight.position.set(0, -5, -3);
        scene.add(rimLight);

        // ── Materials ────────────────────────────────────────────────────
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeff4fb, roughness: 0.18, metalness: 0.05 });
        const tealMat  = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.22, metalness: 0.10 });
        const seamMat  = new THREE.MeshStandardMaterial({ color: 0xd1dde8, roughness: 0.15, metalness: 0.4  });

        // ── Geometry — refined for smoothness and no artifacts ─────────
        const R  = 0.72;  // radius
        const HB = 0.75;  // height of each cylinder half
        const segments = 64; // smoother

        // spinGroup: auto-spins on Y, bobs vertically
        const spinGroup = new THREE.Group();

        // top white dome
        const topDomeMesh = new THREE.Mesh(
            new THREE.SphereGeometry(R, segments, 24, 0, Math.PI * 2, 0, Math.PI / 2),
            whiteMat
        );
        topDomeMesh.position.set(0, HB, 0);
        spinGroup.add(topDomeMesh);

        // white cylinder body (upper half)
        // Using slight overlap (0.005) to ensure no gap line
        const whiteBodyMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(R, R, HB + 0.01, segments, 1, false),
            whiteMat
        );
        whiteBodyMesh.position.set(0, HB / 2 - 0.005, 0);
        spinGroup.add(whiteBodyMesh);

        // seam ring (thin cylinder instead of torus for cleaner look)
        const seamMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(R + 0.008, R + 0.008, 0.04, segments, 1, false),
            seamMat
        );
        seamMesh.position.set(0, 0, 0);
        spinGroup.add(seamMesh);

        // teal cylinder body (lower half)
        const tealBodyMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(R, R, HB + 0.01, segments, 1, false),
            tealMat
        );
        tealBodyMesh.position.set(0, -HB / 2 + 0.005, 0);
        spinGroup.add(tealBodyMesh);

        // bottom teal dome
        const botDomeMesh = new THREE.Mesh(
            new THREE.SphereGeometry(R, segments, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
            tealMat
        );
        botDomeMesh.position.set(0, -HB, 0);
        spinGroup.add(botDomeMesh);

        // slight initial tilt so it looks interesting at t=0
        spinGroup.rotation.z = 0.12;

        // tiltGroup: responds to mouse, contains spinGroup
        const tiltGroup = new THREE.Group();
        tiltGroup.add(spinGroup);
        scene.add(tiltGroup);

        // ── Mouse Tracking ───────────────────────────────────────────────
        const tiltTarget  = { x: 0, y: 0 };
        const tiltCurrent = { x: 0, y: 0 };

        const onMouseMove = (e) => {
            tiltTarget.x = (e.clientY / window.innerHeight - 0.5) * -0.75;
            tiltTarget.y = (e.clientX / window.innerWidth  - 0.5) *  1.0;
        };
        window.addEventListener('mousemove', onMouseMove);

        // ── Resize ───────────────────────────────────────────────────────
        const onResize = () => {
            const nW = mount.clientWidth;
            const nH = mount.clientHeight;
            camera.aspect = nW / nH;
            camera.updateProjectionMatrix();
            renderer.setSize(nW, nH);
        };
        window.addEventListener('resize', onResize);

        // ── Animation Loop ───────────────────────────────────────────────
        const startTime = performance.now();
        let raf;

        const animate = () => {
            raf = requestAnimationFrame(animate);
            const t = (performance.now() - startTime) / 1000;

            // Slow auto Y-spin (~14s per revolution)
            spinGroup.rotation.y = t * 0.45;

            // Gentle bob
            spinGroup.position.y = Math.sin(t * 1.85) * 0.22;

            // Smooth mouse tilt (lerp)
            tiltCurrent.x += (tiltTarget.x - tiltCurrent.x) * 0.06;
            tiltCurrent.y += (tiltTarget.y - tiltCurrent.y) * 0.06;
            tiltGroup.rotation.x = tiltCurrent.x;
            tiltGroup.rotation.y = tiltCurrent.y;

            renderer.render(scene, camera);
        };
        animate();

        // ── Cleanup ──────────────────────────────────────────────────────
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            try { if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement); } catch (_) {}
            renderer.dispose();
            [whiteMat, tealMat, seamMat].forEach(m => m.dispose());
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />;
}

export default function HeroCapsule3D() {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Orbit ring decoration */}
            <style>{`@keyframes orbitSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 230, height: 230, borderRadius: '50%',
                border: '1.5px dashed rgba(20,184,166,0.2)',
                animation: 'orbitSpin 14s linear infinite',
            }}>
                <div style={{
                    position: 'absolute', top: -5, left: '50%', marginLeft: -5,
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#14b8a6',
                    boxShadow: '0 0 8px 3px rgba(20,184,166,0.6)',
                }} />
            </div>
            {/* Accent mini pills */}
            <div style={{
                position: 'absolute', top: '13%', right: '12%',
                width: 14, height: 34, borderRadius: 7,
                background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)',
                transform: 'rotate(32deg)',
            }} />
            <div style={{
                position: 'absolute', bottom: '17%', left: '9%',
                width: 10, height: 22, borderRadius: 5,
                background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.22)',
                transform: 'rotate(-22deg)',
            }} />
            {/* Three.js canvas — wrapped in ErrorBoundary so a WebGL crash can't blank the page */}
            <ErrorBoundary>
                <ThreeCapsule />
            </ErrorBoundary>
        </div>
    );
}
