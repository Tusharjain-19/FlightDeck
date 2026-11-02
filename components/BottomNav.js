'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();
  
  // Drag State (Horizontal Left / Right Move)
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startDragXRef = useRef(0);
  const navRef = useRef(null);
  const [hasMoved, setHasMoved] = useState(false);

  // Restore saved dock position if available
  useEffect(() => {
    try {
      const savedX = localStorage.getItem('flightdeck_dock_x');
      if (savedX) {
        setDragX(parseFloat(savedX) || 0);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handlePointerDown = (e) => {
    // Only drag from handle or container background, avoid blocking direct tab clicks
    startXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startDragXRef.current = dragX;
    setIsDragging(true);
    setHasMoved(false);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = currentX - startXRef.current;
    
    if (Math.abs(deltaX) > 4) {
      setHasMoved(true);
    }

    // Bounded drag limits (-120px to +120px)
    const newX = Math.max(-130, Math.min(130, startDragXRef.current + deltaX));
    setDragX(newX);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap magnetics: if near left edge (<-60px), snap to -85px; if near right edge (>60px), snap to +85px; if near center, snap to 0
    let finalX = dragX;
    if (dragX < -55) finalX = -85;
    else if (dragX > 55) finalX = 85;
    else if (Math.abs(dragX) < 30) finalX = 0;

    setDragX(finalX);
    try {
      localStorage.setItem('flightdeck_dock_x', finalX.toString());
    } catch (e) {
      // ignore
    }
  };

  // Reset to center on double tap or handle click
  const handleResetCenter = (e) => {
    e.stopPropagation();
    setDragX(0);
    try {
      localStorage.setItem('flightdeck_dock_x', '0');
    } catch (e) {
      // ignore
    }
  };

  const navItems = [
    {
      href: '/',
      label: 'Radar',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m4.93 4.93 4.24 4.24"/>
          <path d="m14.83 9.17 4.24-4.24"/>
          <path d="m14.83 14.83 4.24 4.24"/>
          <path d="m9.17 14.83-4.24 4.24"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )
    },
    {
      href: '/airports',
      label: 'Airports',
      badge: '144',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      )
    },
    {
      href: '/airlines',
      label: 'Fleet',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
        </svg>
      )
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )
    }
  ];

  return (
    <div 
      className={styles.bottomNavContainer} 
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <nav 
        ref={navRef}
        className={`${styles.bottomNav} ${isDragging ? styles.isDragging : ''}`}
        style={{ transform: `translateX(${dragX}px)` }}
        aria-label="Bottom Navigation Dock"
      >
        {/* Drag Handle Top Bar */}
        <div 
          className={styles.dragGripArea}
          onPointerDown={handlePointerDown}
          onDoubleClick={handleResetCenter}
          title="Drag left/right to reposition dock (Double click to center)"
        >
          <div className={styles.dragHandleGrip}>
            <span className={styles.gripDot}></span>
            <span className={styles.gripDot}></span>
            <span className={styles.gripDot}></span>
          </div>
          {dragX !== 0 && (
            <button 
              type="button" 
              className={styles.centerDockBtn}
              onClick={handleResetCenter}
              title="Reset dock to center"
            >
              Reset
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className={styles.navItemsList}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                aria-label={item.label}
                onClick={(e) => {
                  if (hasMoved) {
                    e.preventDefault();
                  }
                }}
              >
                <div className={styles.iconWrapper}>
                  {item.icon}
                  {item.badge && (
                    <span className={styles.itemBadge}>{item.badge}</span>
                  )}
                </div>
                <span className={styles.navLabel}>{item.label}</span>
                {isActive && <span className={styles.activePillGlow} />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
