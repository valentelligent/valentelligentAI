'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FC } from 'react';
import Split from 'react-split'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid, LayoutTemplate, Play, Pause, Menu, Lock, Unlock } from 'lucide-react'

const AnimatedBackground = () => {
  return (
    <div className="animated-background">
      {[...Array(50)].map((_, i) => (
        <div key={i} className="circle-container">
          <div className="circle"></div>
        </div>
      ))}
      <style jsx>{`
        .animated-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: linear-gradient(to bottom right, #000000, #1a1a1a);
          z-index: 0;
        }
        .circle-container {
          position: absolute;
          transform: translateY(10%);
        }
        .circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.1);
          animation: rise 15s infinite ease-in;
        }
        @keyframes rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-1000px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
interface LockIconProps {
  side: 'left' | 'right';
  isLocked: boolean;
  onLock: () => void;
  splitView: boolean;
}

const LockIcon: FC<LockIconProps> = ({ side, isLocked, onLock, splitView }) => {
  return (
    <motion.div
      className={`absolute ${side}-4 top-1/2 transform -translate-y-1/2 z-20 cursor-pointer`}
      onClick={onLock}
      initial={false}
      animate={{
        x: splitView ? 0 : side === 'left' ? -100 : 100,
        opacity: splitView ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-white rounded-full p-3 shadow-md"
      >
        {isLocked ? (
          <Lock className="w-6 h-6 text-black" />
        ) : (
          <Unlock className="w-6 h-6 text-black" />
        )}
      </motion.div>
    </motion.div>
  );
};
}

export default function AdvancedDynamicSplitScreen() {
  const [splitView, setSplitView] = useState(true)
  const [sizes, setSizes] = useState([50, 50])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isLeftLocked, setIsLeftLocked] = useState(false)
  const [isRightLocked, setIsRightLocked] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!splitView || isLeftLocked || isRightLocked) return
      const container = containerRef.current
      if (!container) return

      const { left, width } = container.getBoundingClientRect()
      const mouseX = e.clientX - left
      const percentage = (mouseX / width) * 100
      setSizes([percentage, 100 - percentage])
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [splitView, isLeftLocked, isRightLocked])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setSplitView(true)
        if (!isLeftLocked && !isRightLocked) {
          setSizes(prev => e.key === 'ArrowLeft' ? [Math.max(prev[0] - 5, 20), Math.min(prev[1] + 5, 80)] : [Math.min(prev[0] + 5, 80), Math.max(prev[1] - 5, 20)])
        }
      } else if (e.key === 'g') {
        setSplitView(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLeftLocked, isRightLocked])

  const toggleView = () => setSplitView(!splitView)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleLock = (side: 'left' | 'right') => {
    if (side === 'left') {
      setIsLeftLocked(!isLeftLocked)
    } else {
      setIsRightLocked(!isRightLocked)
    }
  }

  const textReveal = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <motion.div
          animate={{
            scale: [1, 2, 2, 1, 1],
            rotate: [0, 0, 270, 270, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="w-16 h-16 bg-white"
        />
      </div>
    )
  }

  return (
    <div className="h-screen w-full relative overflow-hidden" ref={containerRef}>
      <LockIcon side="left" isLocked={isLeftLocked} onLock={handleLock} splitView={splitView} />
      <LockIcon side="right" isLocked={isRightLocked} onLock={handleLock} splitView={splitView} />
      <AnimatePresence mode="wait">
        {splitView ? (
          <motion.div
            key="split"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <Split
              sizes={sizes}
              minSize={20}
              expandToMin={false}
              gutterSize={4}
              gutterAlign="center"
              snapOffset={30}
              dragInterval={1}
              direction="horizontal"
              cursor="col-resize"
              className="split-flex h-full"
              onDrag={(newSizes) => {
                if (!isLeftLocked && !isRightLocked) {
                  setSizes(newSizes)
                }
              }}
            >
              <div className="h-full flex items-center justify-center overflow-hidden relative">
                <AnimatedBackground />
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={textReveal}
                  className="text-center relative z-10"
                >
                  <h2 className="text-4xl font-bold mb-4 text-white">Photography</h2>
                  <p className="mb-6 text-lg text-white">Explore our photography projects</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black px-6 py-3 rounded-full text-lg font-semibold transition-colors duration-300 hover:bg-black hover:text-white"
                  >
                    View Gallery
                  </motion.button>
                </motion.div>
              </div>
              <div className="h-full relative overflow-hidden">
                <video
                  ref={videoRef}
                  loop
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: `translateY(${-sizes[1] * 0.5}px)` }}
                >
                  <source src="/placeholder.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={textReveal}
                    className="text-center text-white"
                  >
                    <h2 className="text-4xl font-bold mb-4">Film Projects</h2>
                    <p className="mb-6 text-lg">Discover our latest film works</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-black px-6 py-3 rounded-full text-lg font-semibold transition-colors duration-300 hover:bg-black hover:text-white"
                      onClick={togglePlay}
                    >
                      {isPlaying ? <Pause className="inline-block mr-2" /> : <Play className="inline-block mr-2" />}
                      {isPlaying ? 'Pause' : 'Play'} Showreel
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </Split>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 h-full"
          >
            <div className="flex items-center justify-center p-8 relative overflow-hidden">
              <AnimatedBackground />
              <motion.div
                initial="hidden"
                animate="visible"
                variants={textReveal}
                className="text-center relative z-10"
              >
                <h2 className="text-4xl font-bold mb-4 text-white">Photography</h2>
                <p className="mb-6 text-lg text-white">Explore our photography projects</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black px-6 py-3 rounded-full text-lg font-semibold transition-colors duration-300 hover:bg-black hover:text-white"
                >
                  View Gallery
                </motion.button>
              </motion.div>
            </div>
            <div className="relative overflow-hidden">
              <video
                ref={videoRef}
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'translateY(-20px)' }}
              >
                <source src="/placeholder.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={textReveal}
                  className="text-center text-white"
                >
                  <h2 className="text-4xl font-bold mb-4">Film Projects</h2>
                  <p className="mb-6 text-lg">Discover our latest film works</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black px-6 py-3 rounded-full text-lg font-semibold transition-colors duration-300 hover:bg-black hover:text-white"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="inline-block mr-2" /> : <Play className="inline-block mr-2" />}
                    {isPlaying ? 'Pause' : 'Play'} Showreel
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={toggleView}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-full p-3 shadow-md"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={splitView ? "Switch to grid view" : "Switch to split view"}
      >
        {splitView ? <Grid className="w-6 h-6" /> : <LayoutTemplate className="w-6 h-6" />}
      </motion.button>
      <motion.div
        className="absolute bottom-4 right-4 z-10"
        initial={false}
        animate={showMenu ? "open" : "closed"}
      >
        <motion.button
          className="bg-white rounded-full p-3 shadow-md"
          onClick={() => setShowMenu(!showMenu)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="w-6 h-6" />
        </motion.button>
        <motion.div
          className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-md overflow-hidden"
          variants={{
            open: { opacity: 1, height: "auto" },
            closed: { opacity: 0, height: 0 }
          }}
          transition={{ duration: 0.2 }}
        >
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => {}}>About Us</button>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => {}}>Contact</button>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => {}}>Portfolio</button>
        </motion.div>
      </motion.div>
    </div>
  )
}