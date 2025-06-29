"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trees,
  Home,
  Snowflake,
  Bird,
  Gift,
  Star,
  Castle,
  Rabbit,
  Flower2,
  Palette,
  Sparkles,
  Cloud,
  Save,
  Trash2,
  Plus,
  Sun,
  Moon,
  HelpCircle,
  Phone,
  Shield,
  Eye,
  Cherry,
  Menu,
  X,
} from "lucide-react";

interface SnowGlobeObject {
  id: string;
  type: string;
  icon: React.ComponentType<any>;
  x: number;
  y: number;
  scale: number;
}

interface SavedGlobe {
  id: string;
  name: string;
  background: string;
  objects: SnowGlobeObject[];
  createdAt: Date;
}

interface Snowflake {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

const BACKGROUNDS = [
  {
    id: "winter",
    name: "Winter Forest",
    lightStyle: {
      background:
        "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
    },
    darkStyle: {
      background:
        "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)",
    },
  },
  {
    id: "city",
    name: "City Lights",
    lightStyle: {
      background:
        "linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 50%, #e9d5ff 100%)",
    },
    darkStyle: {
      background:
        "linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #8b5cf6 100%)",
    },
  },
  {
    id: "fantasy",
    name: "Enchanted",
    lightStyle: {
      background:
        "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
    },
    darkStyle: {
      background:
        "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
    },
  },
  {
    id: "sunset",
    name: "Golden Hour",
    lightStyle: {
      background:
        "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fed7aa 100%)",
    },
    darkStyle: {
      background:
        "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
    },
  },
];

const GLOBE_OBJECTS = [
  { type: "tree", icon: Trees, name: "Pine Tree" },
  { type: "house", icon: Home, name: "House" },
  { type: "snowman", icon: Snowflake, name: "Snowman" },
  { type: "deer", icon: Bird, name: "Bird" },
  { type: "gift", icon: Gift, name: "Gift" },
  { type: "star", icon: Star, name: "Star" },
  { type: "castle", icon: Castle, name: "Castle" },
  { type: "rabbit", icon: Rabbit, name: "Rabbit" },
  { type: "mushroom", icon: Cherry, name: "Cherry" },
  { type: "flower", icon: Flower2, name: "Flower" },
];

const FEATURE_CARDS = [
  {
    icon: Palette,
    title: "Stunning Backgrounds",
    description:
      "Choose from magical themed environments including winter forests, city lights, enchanted realms, and golden sunsets.",
  },
  {
    icon: Sparkles,
    title: "Interactive Objects",
    description:
      "Drag and drop from our collection of animated objects to create your perfect winter wonderland scene.",
  },
  {
    icon: Cloud,
    title: "Realistic Snow Physics",
    description:
      "Experience mesmerizing snowfall effects with realistic physics and beautiful particle animations.",
  },
];

export default function SnowGlobeBuilder() {
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    "landing" | "builder" | "gallery"
  >("landing");
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS[0]);
  const [globeObjects, setGlobeObjects] = useState<SnowGlobeObject[]>([]);
  const [savedGlobes, setSavedGlobes] = useState<SavedGlobe[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [backgroundSnow, setBackgroundSnow] = useState<Snowflake[]>([]);
  const [backgroundStars, setBackgroundStars] = useState<Star[]>([]);
  const [draggedObject, setDraggedObject] = useState<string | null>(null);
  const [isWhiteout, setIsWhiteout] = useState(false);

  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const globeRef = useRef<HTMLDivElement>(null);
  const [isObjectDragging, setIsObjectDragging] = useState(false);
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragClick, setIsDragClick] = useState(false);
  const [touchDragObject, setTouchDragObject] = useState<{
    type: string;
    icon: React.ComponentType<any>;
    x: number;
    y: number;
  } | null>(null);

  const handleTouchStart = (e: React.TouchEvent, objType: string) => {
    if (!globeRef.current || isShaking) return;
    const touch = e.touches[0];
    const objectType = GLOBE_OBJECTS.find((obj) => obj.type === objType);
    if (objectType) {
      setDraggedObject(objType);
      setTouchDragObject({
        type: objType,
        icon: objectType.icon,
        x: touch.clientX,
        y: touch.clientY,
      });
    }
  };

  const handleTouchMove = (e: Event) => {
    if (!touchDragObject || isShaking) return;
    e.preventDefault();
    const touchEvent = e as TouchEvent;
    const touch = touchEvent.touches[0];
    if (touch) {
      setTouchDragObject((prev) =>
        prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null
      );
    }
  };

  const handleTouchEnd = (e: Event) => {
    if (!touchDragObject || !globeRef.current || isShaking) {
      setTouchDragObject(null);
      setDraggedObject(null);
      return;
    }

    const touchEvent = e as TouchEvent;
    const touch = touchEvent.changedTouches[0];

    if (!touch) {
      setTouchDragObject(null);
      setDraggedObject(null);
      return;
    }

    const rect = globeRef.current.getBoundingClientRect();
    const globeSize = rect.width;
    const centerX = rect.left + globeSize / 2;
    const centerY = rect.top + globeSize / 2;

    const dropX = touch.clientX;
    const dropY = touch.clientY;

    const distance = Math.sqrt((dropX - centerX) ** 2 + (dropY - centerY) ** 2);
    const maxDistance = globeSize / 2 - 20;

    if (distance <= maxDistance) {
      const relativeX = ((dropX - rect.left) / globeSize) * 100;
      const relativeY = ((dropY - rect.top) / globeSize) * 100;

      const newObject: SnowGlobeObject = {
        id: `${touchDragObject.type}-${Date.now()}-${Math.random()}`,
        type: touchDragObject.type,
        icon: touchDragObject.icon,
        x: Math.max(15, Math.min(85, relativeX)),
        y: Math.max(15, Math.min(85, relativeY)),
        scale: Math.random() * 0.4 + 0.8,
      };
      setGlobeObjects((prev) => [...prev, newObject]);
    }
    setTouchDragObject(null);
    setDraggedObject(null);
  };

  useEffect(() => {
    const options: AddEventListenerOptions = { passive: false };
    window.addEventListener("touchmove", handleTouchMove, options);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove, options);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [touchDragObject]);

  useEffect(() => {
    const generateBackgroundSnow = () => {
      const newSnowflakes: Snowflake[] = [];
      for (let i = 0; i < 60; i++) {
        newSnowflakes.push({
          id: `bg-snow-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.4 + 0.2,
        });
      }
      setBackgroundSnow(newSnowflakes);
    };

    const generateBackgroundStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 40; i++) {
        newStars.push({
          id: `bg-star-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.6 + 0.3,
          twinkleSpeed: Math.random() * 3 + 2,
        });
      }
      setBackgroundStars(newStars);
    };

    generateBackgroundSnow();
    generateBackgroundStars();
  }, []);

  useEffect(() => {
    const animateBackgroundSnow = () => {
      setBackgroundSnow((prev) =>
        prev.map((flake) => ({
          ...flake,
          y: flake.y > 100 ? -5 : flake.y + flake.speed * 0.08,
          x: flake.x + Math.sin(flake.y * 0.008) * 0.08,
        }))
      );
    };

    const interval = setInterval(animateBackgroundSnow, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animateStars = () => {
      setBackgroundStars((prev) =>
        prev.map((star) => ({
          ...star,
          opacity: 0.3 + Math.sin(Date.now() * 0.001 * star.twinkleSpeed) * 0.3,
        }))
      );
    };

    const interval = setInterval(animateStars, 100);
    return () => clearInterval(interval);
  }, []);

  const generateSnowflakes = useCallback(() => {
    const newSnowflakes: Snowflake[] = [];
    for (let i = 0; i < 80; i++) {
      newSnowflakes.push({
        id: `snow-${Date.now()}-${i}`,
        x: Math.random() * 320,
        y: Math.random() * 320,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 3 + 1,
        opacity: Math.random() * 0.9 + 0.4,
      });
    }
    setSnowflakes(newSnowflakes);
  }, []);

  const shakeGlobe = () => {
    // Reset all interactive states before shaking
    setIsObjectDragging(false);
    setDraggedObjectId(null);
    setDraggedObject(null);
    setTouchDragObject(null);
    setIsDragClick(false);

    setIsShaking(true);
    generateSnowflakes();

    setTimeout(() => {
      setIsWhiteout(true);
      setGlobeObjects((prev) =>
        prev.map((obj) => ({
          ...obj,
          x: Math.random() * 70 + 15,
          y: Math.random() * 70 + 15,
          scale: Math.random() * 0.4 + 0.8,
        }))
      );
    }, 500);

    setTimeout(() => {
      setIsWhiteout(false);
    }, 1500);

    setTimeout(() => setIsShaking(false), 2000);
    setTimeout(() => setSnowflakes([]), 6000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedObject || !globeRef.current || isShaking) {
      setDraggedObject(null);
      return;
    }

    const rect = globeRef.current.getBoundingClientRect();
    const globeSize = rect.width;
    const centerX = rect.left + globeSize / 2;
    const centerY = rect.top + globeSize / 2;

    const dropX = e.clientX;
    const dropY = e.clientY;

    const distance = Math.sqrt((dropX - centerX) ** 2 + (dropY - centerY) ** 2);
    const maxDistance = globeSize / 2 - 20;

    if (distance <= maxDistance) {
      const relativeX = ((dropX - rect.left) / globeSize) * 100;
      const relativeY = ((dropY - rect.top) / globeSize) * 100;

      const objectType = GLOBE_OBJECTS.find(
        (obj) => obj.type === draggedObject
      );
      if (objectType) {
        const newObject: SnowGlobeObject = {
          id: `${draggedObject}-${Date.now()}-${Math.random()}`,
          type: draggedObject,
          icon: objectType.icon,
          x: Math.max(15, Math.min(85, relativeX)),
          y: Math.max(15, Math.min(85, relativeY)),
          scale: Math.random() * 0.4 + 0.8,
        };
        setGlobeObjects((prev) => [...prev, newObject]);
      }
    }
    setDraggedObject(null);
  };

  const saveGlobe = () => {
    if (globeObjects.length === 0) return;
    const globeName = `Globe ${savedGlobes.length + 1}`;
    const newGlobe: SavedGlobe = {
      id: `globe-${Date.now()}`,
      name: globeName,
      background: selectedBackground.id,
      objects: [...globeObjects],
      createdAt: new Date(),
    };
    setSavedGlobes((prev) => [...prev, newGlobe]);

    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const loadGlobe = (globe: SavedGlobe) => {
    const background =
      BACKGROUNDS.find((bg) => bg.id === globe.background) || BACKGROUNDS[0];
    setSelectedBackground(background);
    setGlobeObjects(globe.objects);
    setCurrentPage("builder");
  };

  const clearGlobe = () => {
    setGlobeObjects([]);
    setSnowflakes([]);
  };

  const removeObject = (objectId: string) => {
    setGlobeObjects((prev) => prev.filter((obj) => obj.id !== objectId));
  };

  const handleObjectMouseDown = (e: React.MouseEvent, objectId: string) => {
    if (isShaking) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragClick(false);
    setIsObjectDragging(true);
    setDraggedObjectId(objectId);

    const rect = globeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleObjectMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedObjectId || !globeRef.current || isShaking) return;

      setIsDragClick(true); // Mark as drag, not click

      const rect = globeRef.current.getBoundingClientRect();
      const newXPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const newYPercent = ((e.clientY - rect.top) / rect.height) * 100;

      setGlobeObjects((prev) =>
        prev.map((obj) =>
          obj.id === draggedObjectId
            ? {
                ...obj,
                x: Math.max(10, Math.min(90, newXPercent)),
                y: Math.max(10, Math.min(90, newYPercent)),
              }
            : obj
        )
      );
    },
    [draggedObjectId, isShaking]
  );

  const handleObjectMouseUp = useCallback(() => {
    setIsObjectDragging(false);
    setDraggedObjectId(null);
    // Reset drag click after a small delay to prevent accidental deletion
    setTimeout(() => setIsDragClick(false), 100);
  }, []);

  const handleObjectTouchStart = (e: React.TouchEvent, objectId: string) => {
    if (isShaking) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragClick(false);
    setIsObjectDragging(true);
    setDraggedObjectId(objectId);

    const touch = e.touches[0];
    const rect = globeRef.current?.getBoundingClientRect();
    if (rect && touch) {
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
  };

  const handleObjectTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!draggedObjectId || !globeRef.current || isShaking) return;

      e.preventDefault();
      setIsDragClick(true);

      const touch = e.touches[0];
      if (!touch) return;

      const rect = globeRef.current.getBoundingClientRect();
      const newXPercent = ((touch.clientX - rect.left) / rect.width) * 100;
      const newYPercent = ((touch.clientY - rect.top) / rect.height) * 100;

      setGlobeObjects((prev) =>
        prev.map((obj) =>
          obj.id === draggedObjectId
            ? {
                ...obj,
                x: Math.max(10, Math.min(90, newXPercent)),
                y: Math.max(10, Math.min(90, newYPercent)),
              }
            : obj
        )
      );
    },
    [draggedObjectId, isShaking]
  );

  const handleObjectTouchEnd = useCallback(() => {
    setIsObjectDragging(false);
    setDraggedObjectId(null);
    setTimeout(() => setIsDragClick(false), 100);
  }, []);

  useEffect(() => {
    if (draggedObjectId) {
      // Mouse events
      document.addEventListener("mousemove", handleObjectMouseMove);
      document.addEventListener("mouseup", handleObjectMouseUp);

      // Touch events
      document.addEventListener("touchmove", handleObjectTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleObjectTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleObjectMouseMove);
        document.removeEventListener("mouseup", handleObjectMouseUp);
        document.removeEventListener("touchmove", handleObjectTouchMove);
        document.removeEventListener("touchend", handleObjectTouchEnd);
      };
    }
  }, [
    draggedObjectId,
    handleObjectMouseMove,
    handleObjectMouseUp,
    handleObjectTouchMove,
    handleObjectTouchEnd,
  ]);

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
          : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      }`}
    >
      {touchDragObject && (
        <motion.div
          className="fixed pointer-events-none z-[100]"
          style={{
            left: touchDragObject.x,
            top: touchDragObject.y,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={`p-3 rounded-full shadow-lg ${
              isDark
                ? "bg-slate-700/80 backdrop-blur-sm"
                : "bg-amber-200/80 backdrop-blur-sm"
            }`}
          >
            <touchDragObject.icon
              size={24}
              className={isDark ? "text-white" : "text-amber-800"}
            />
          </div>
        </motion.div>
      )}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {backgroundSnow.map((flake) => (
          <div
            key={flake.id}
            className={`absolute select-none transition-colors duration-500 ${
              isDark ? "text-slate-300" : "text-slate-400"
            }`}
            style={{
              left: `${flake.x}%`,
              top: `${flake.y}%`,
              fontSize: `${flake.size}px`,
              opacity: flake.opacity,
            }}
          >
            <Snowflake
              size={flake.size}
              className={isDark ? "text-slate-300" : "text-slate-400"}
            />
          </div>
        ))}
      </div>

      {!isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {backgroundStars.map((star) => (
            <div
              key={star.id}
              className="absolute select-none text-yellow-400"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                fontSize: `${star.size}px`,
                opacity: star.opacity,
              }}
            >
              <Star size={star.size} className="text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      {currentPage === "landing" && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
          <motion.button
            className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
              isDark
                ? "bg-slate-700 border-slate-600"
                : "bg-amber-200 border-black border-2"
            } ${!isDark ? "border-2" : "border-2"}`}
            style={{
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
            }}
            whileHover={{
              scale: 1.1,
              filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.25))",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark(!isDark)}
          >
            <motion.div
              className={`absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                isDark ? "bg-slate-200 right-0.5" : "bg-amber-600 left-0.5"
              }`}
              animate={{
                x: isDark ? 0 : 0,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {isDark ? <Moon size={16} /> : <Sun size={16} />}
            </motion.div>
          </motion.button>
        </div>
      )}

      {currentPage !== "landing" && (
        <>
          <nav
            className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl ${
              isDark
                ? "bg-slate-900/95 border-slate-700/50"
                : "bg-gradient-to-r from-amber-50/95 via-orange-50/95 to-yellow-50/95 border-amber-200/50"
            } border-b shadow-xl`}
          >
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <div className="flex justify-between items-center h-16 lg:h-20">
                {/* Logo/Brand */}
                <motion.div
                  className="flex items-center cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setCurrentPage("landing")}
                >
                  <div
                    className={`p-2 rounded-lg mr-3 ${
                      isDark
                        ? "bg-gradient-to-br from-slate-700 to-slate-800"
                        : "bg-gradient-to-br from-amber-400 to-amber-500"
                    }`}
                  >
                    <Sparkles size={20} className="text-white lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <h1
                      className={`text-lg lg:text-xl font-bold ${
                        isDark ? "text-slate-100" : "text-amber-900"
                      }`}
                    >
                      Snow Globe Builder
                    </h1>
                    <p
                      className={`text-xs lg:text-sm hidden sm:block ${
                        isDark ? "text-slate-400" : "text-amber-700"
                      }`}
                    >
                      Create magical experiences
                    </p>
                  </div>
                </motion.div>

                {/* Desktop Center Actions - Only show in builder mode */}
                {currentPage === "builder" && (
                  <div className="hidden lg:flex items-center space-x-3">
                    <motion.button
                      className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-all duration-200 shadow-sm ${
                        isDark
                          ? "bg-slate-600 hover:bg-slate-500 text-slate-100"
                          : "bg-amber-500 hover:bg-amber-600 text-white"
                      }`}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={shakeGlobe}
                    >
                      <Cloud size={18} />
                      <span>Shake</span>
                    </motion.button>

                    <motion.button
                      className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-all duration-200 shadow-sm ${
                        globeObjects.length === 0
                          ? isDark
                            ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                            : "bg-amber-200/50 text-amber-400 cursor-not-allowed"
                          : isDark
                          ? "bg-slate-700 hover:bg-slate-600 text-slate-100"
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                      }`}
                      whileHover={
                        globeObjects.length > 0 ? { scale: 1.02, y: -1 } : {}
                      }
                      whileTap={globeObjects.length > 0 ? { scale: 0.98 } : {}}
                      onClick={saveGlobe}
                      disabled={globeObjects.length === 0}
                    >
                      <Save size={18} />
                      <span>Save</span>
                    </motion.button>

                    <motion.button
                      className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-all duration-200 shadow-sm ${
                        isDark
                          ? "bg-red-500 hover:bg-red-500 text-red-100"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearGlobe}
                    >
                      <Trash2 size={18} />
                      <span>Clear</span>
                    </motion.button>
                  </div>
                )}

                {/* Desktop Right Section */}
                <div className="hidden lg:flex items-center space-x-4">
                  {/* Gallery Toggle */}
                  <motion.button
                    className={`px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 shadow-sm border ${
                      isDark
                        ? "bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600"
                        : "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                    }`}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setCurrentPage(
                        currentPage === "gallery" ? "builder" : "gallery"
                      )
                    }
                  >
                    {currentPage === "gallery" ? "Studio" : "Gallery"}
                  </motion.button>

                  {/* Theme Toggle */}
                  <motion.button
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                      isDark ? "bg-slate-700" : "bg-amber-200"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDark(!isDark)}
                  >
                    <motion.div
                      className={`absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                        isDark
                          ? "bg-slate-100 right-0.5"
                          : "bg-amber-50 left-0.5 border border-amber-300"
                      }`}
                      animate={{
                        x: isDark ? 0 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    >
                      {isDark ? (
                        <Moon size={14} className="text-slate-700" />
                      ) : (
                        <Sun size={14} className="text-amber-600" />
                      )}
                    </motion.div>
                  </motion.button>
                </div>

                {/* Mobile Right Section */}
                <div className="flex lg:hidden items-center space-x-2">
                  {/* Mobile Hamburger Menu Button */}
                  <motion.button
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        : "bg-amber-100/60 hover:bg-amber-200/80 text-amber-800"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                  >
                    {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                  </motion.button>
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {showMobileMenu && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 z-[50] lg:hidden bg-black/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setShowMobileMenu(false)}
                />

                {/* Sliding Sidebar */}
                <motion.div
                  className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-[60] lg:hidden shadow-2xl ${
                    isDark
                      ? "bg-slate-900/98 border-l border-slate-700/50"
                      : "bg-white/98 border-l border-amber-200/50"
                  }`}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                  {/* Sidebar Header */}
                  <div
                    className={`p-6 border-b ${
                      isDark ? "border-slate-700/50" : "border-amber-200/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isDark
                              ? "bg-gradient-to-br from-slate-700 to-slate-800"
                              : "bg-gradient-to-br from-amber-600 to-amber-700"
                          }`}
                        >
                          <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                          <h2
                            className={`text-lg font-bold ${
                              isDark ? "text-slate-100" : "text-amber-900"
                            }`}
                          >
                            Menu
                          </h2>
                          <p
                            className={`text-sm ${
                              isDark ? "text-slate-400" : "text-amber-700"
                            }`}
                          >
                            Quick actions
                          </p>
                        </div>
                      </div>
                      <motion.button
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isDark
                            ? "hover:bg-slate-800 text-slate-300"
                            : "hover:bg-amber-50 text-amber-800"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <X size={20} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-3">
                      {/* Gallery Toggle */}
                      <motion.button
                        className={`w-full p-4 rounded-xl font-medium text-left transition-all duration-200 flex items-center gap-3 ${
                          isDark
                            ? "text-slate-200 hover:bg-slate-800/50 border border-slate-700/50"
                            : "text-amber-900 hover:bg-amber-50 border border-amber-200"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setCurrentPage(
                            currentPage === "gallery" ? "builder" : "gallery"
                          );
                          setShowMobileMenu(false);
                        }}
                      >
                        <Eye size={20} />
                        <span>
                          {currentPage === "gallery" ? "Studio" : "Gallery"}
                        </span>
                      </motion.button>

                      {/* Action Buttons - Only show in builder mode */}
                      {currentPage === "builder" && (
                        <>
                          <motion.button
                            className={`w-full p-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 border ${
                              isDark
                                ? "text-slate-200 hover:bg-slate-800/50 border-slate-700/50"
                                : "text-amber-900 hover:bg-amber-50 border-amber-200"
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              shakeGlobe();
                              setShowMobileMenu(false);
                            }}
                          >
                            <Cloud size={20} />
                            <span>Shake Globe</span>
                          </motion.button>

                          <motion.button
                            className={`w-full p-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 border ${
                              globeObjects.length === 0
                                ? isDark
                                  ? "text-slate-500 border-slate-700/30 cursor-not-allowed"
                                  : "text-amber-400 border-amber-200/50 cursor-not-allowed"
                                : isDark
                                ? "text-slate-200 hover:bg-slate-800/50 border-slate-700/50"
                                : "text-amber-900 hover:bg-amber-50 border-amber-200"
                            }`}
                            whileHover={
                              globeObjects.length > 0 ? { scale: 1.02 } : {}
                            }
                            whileTap={
                              globeObjects.length > 0 ? { scale: 0.98 } : {}
                            }
                            onClick={() => {
                              if (globeObjects.length > 0) {
                                saveGlobe();
                                setShowMobileMenu(false);
                              }
                            }}
                            disabled={globeObjects.length === 0}
                          >
                            <Save size={20} />
                            <span>Save Globe</span>
                          </motion.button>

                          <motion.button
                            className={`w-full p-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 border ${
                              isDark
                                ? "text-slate-200 hover:bg-slate-800/50 border-slate-700/50"
                                : "text-amber-900 hover:bg-amber-50 border-amber-200"
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              clearGlobe();
                              setShowMobileMenu(false);
                            }}
                          >
                            <Trash2 size={20} />
                            <span>Clear Globe</span>
                          </motion.button>
                        </>
                      )}

                      {/* Theme Toggle */}
                      <motion.button
                        className={`w-full p-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                          isDark
                            ? "text-slate-200 hover:bg-slate-800/50 border border-slate-700/50"
                            : "text-amber-900 hover:bg-amber-50 border border-amber-200"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsDark(!isDark);
                          setShowMobileMenu(false);
                        }}
                      >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Sidebar Footer */}
                  <div
                    className={`p-6 border-t ${
                      isDark ? "border-slate-700/50" : "border-amber-200/50"
                    }`}
                  >
                    <p
                      className={`text-sm text-center ${
                        isDark ? "text-slate-400" : "text-amber-600"
                      }`}
                    >
                      Snow Globe Builder v1.0
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {showSaveNotification && (
          <motion.div
            className={`fixed bottom-6 right-6 z-50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl ${
              isDark
                ? "bg-slate-900/90 border-slate-700/50 text-slate-200 border-2"
                : "bg-amber-50/90 border-black text-amber-800 border-4"
            }`}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="flex items-center space-x-3">
              <Sparkles size={20} />
              <span className="font-semibold">Globe saved successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={currentPage !== "landing" ? "pt-16 sm:pt-20" : ""}>
        <AnimatePresence mode="wait">
          {currentPage === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 pt-20"
            >
              <div className="text-center max-w-6xl mx-auto">
                <motion.div
                  className={`backdrop-blur-xl rounded-3xl p-8 sm:p-12 mb-8 sm:mb-16 shadow-2xl ${
                    isDark
                      ? "bg-slate-900/40 border-slate-700/50 border-2"
                      : "bg-amber-50/40 border-black border-4"
                  }`}
                  style={{
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.1))",
                    transform: "perspective(1000px) rotateX(2deg)",
                  }}
                  initial={{ scale: 0.9, opacity: 0, rotateX: 5 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 2 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  whileHover={{
                    rotateX: 0,
                    filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.15))",
                  }}
                >
                  <motion.h2
                    className={`text-4xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 ${
                      isDark ? "text-slate-100" : "text-amber-900"
                    }`}
                    style={{
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                    }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    Create Magic
                  </motion.h2>

                  <motion.p
                    className={`text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 leading-relaxed ${
                      isDark ? "text-slate-300" : "text-amber-700"
                    }`}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    Design your own enchanting digital snow globes with stunning
                    backgrounds, magical objects, and mesmerizing snow effects.
                  </motion.p>

                  <motion.button
                    className={`px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-2xl shadow-lg transition-all duration-300 ${
                      isDark
                        ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                        : "bg-amber-700 text-amber-50 hover:bg-amber-800"
                    }`}
                    style={{
                      filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
                    }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    whileHover={{
                      scale: 1.05,
                      filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.3))",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage("builder")}
                  >
                    <div className="flex items-center gap-2">
                      Create Your Globe <Sparkles size={20} />
                    </div>
                  </motion.button>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {FEATURE_CARDS.map((card, index) => (
                    <motion.div
                      key={index}
                      className={`backdrop-blur-xl rounded-2xl p-6 sm:p-8 ${
                        isDark
                          ? "bg-slate-900/30 border-slate-700/50 border-2"
                          : "bg-amber-50/30 border-black border-4"
                      }`}
                      style={{
                        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
                        transform: "perspective(1000px) rotateY(0deg)",
                      }}
                      initial={{
                        opacity: 0,
                        y: 50,
                        rotateY: index % 2 === 0 ? -10 : 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        rotateY: 0,
                      }}
                      transition={{
                        duration: 0.6,
                        delay: 1.0 + index * 0.2,
                      }}
                      whileHover={{
                        scale: 1.05,
                        rotateY: index % 2 === 0 ? 5 : -5,
                        filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))",
                      }}
                    >
                      <div className="text-4xl sm:text-5xl mb-4 flex justify-center">
                        <card.icon
                          size={48}
                          className={
                            isDark ? "text-slate-200" : "text-amber-800"
                          }
                        />
                      </div>
                      <h3
                        className={`text-lg sm:text-xl font-semibold mb-3 ${
                          isDark ? "text-slate-100" : "text-amber-900"
                        }`}
                      >
                        {card.title}
                      </h3>
                      <p
                        className={`text-sm sm:text-base ${
                          isDark ? "text-slate-300" : "text-amber-700"
                        }`}
                      >
                        {card.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentPage === "builder" && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen p-4 md:p-8"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 lg:gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <motion.div
                      className={`backdrop-blur-xl rounded-2xl p-4 lg:p-6 ${
                        isDark
                          ? "bg-slate-900/50 border-slate-700/50 border-2"
                          : "bg-amber-50/50 border-black border-2 lg:border-4"
                      }`}
                      initial={{ opacity: 0, y: 20, x: 0, rotateY: 0 }}
                      animate={{ opacity: 1, y: 0, x: 0, rotateY: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{
                        transform: "perspective(1000px) rotateY(0)",
                        filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.15))",
                      }}
                      style={{
                        transform:
                          "perspective(1000px) rotateY(0deg) lg:rotateY(-2deg)",
                        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))",
                      }}
                    >
                      <h3
                        className={`text-base lg:text-lg font-semibold mb-3 lg:mb-4 ${
                          isDark ? "text-slate-200" : "text-amber-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Palette
                            size={16}
                            className={`lg:w-5 lg:h-5 ${
                              isDark ? "text-slate-200" : "text-amber-800"
                            }`}
                          />
                          Backgrounds
                        </div>
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-3">
                        {BACKGROUNDS.map((bg) => (
                          <motion.button
                            key={bg.id}
                            className={`p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all duration-300 ${
                              selectedBackground.id === bg.id
                                ? isDark
                                  ? "border-amber-500 shadow-lg scale-105 border-2"
                                  : "border-amber-500 shadow-lg scale-105 border-2 lg:border-4"
                                : isDark
                                ? "border-slate-600/50 hover:border-slate-400 border-2"
                                : "border-black hover:border-amber-400 border-2"
                            }`}
                            whileHover={{
                              scale: 1.05,
                              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedBackground(bg)}
                          >
                            <div
                              className="w-full h-8 lg:h-12 rounded-md lg:rounded-lg mb-1 lg:mb-2"
                              style={isDark ? bg.darkStyle : bg.lightStyle}
                            />
                            <span
                              className={`text-xs font-medium ${
                                isDark ? "text-slate-300" : "text-amber-800"
                              }`}
                            >
                              {bg.name}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  <div className="flex items-center justify-center lg:col-span-3">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <motion.div
                        ref={globeRef}
                        className={`relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full shadow-2xl overflow-hidden ${
                          isShaking
                            ? "pointer-events-none opacity-90"
                            : "cursor-crosshair"
                        } ${
                          isDark
                            ? "border-slate-300/30 border-4 sm:border-8"
                            : "border-black border-4 sm:border-8"
                        } ${isShaking ? "animate-pulse" : ""}`}
                        style={{
                          ...(isDark
                            ? selectedBackground.darkStyle
                            : selectedBackground.lightStyle),
                          filter: `drop-shadow(0 20px 40px rgba(0,0,0,0.3)) ${
                            isWhiteout ? "brightness(3) contrast(0.1)" : ""
                          }`,
                          transform: "perspective(1000px) rotateX(5deg)",
                        }}
                        onDrop={handleDrop}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "copy";
                        }}
                        animate={
                          isShaking
                            ? {
                                x: [-8, 8, -8, 8, -6, 6, -4, 4, 0],
                                y: [-4, 4, -4, 4, -2, 2, 0],
                                rotateZ: [-2, 2, -2, 2, -1, 1, 0],
                              }
                            : {}
                        }
                        transition={{ duration: 2.0 }}
                        whileHover={{
                          rotateX: 2,
                          filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.4))",
                        }}
                      >
                        <AnimatePresence>
                          {isWhiteout && (
                            <motion.div
                              className="absolute inset-0 bg-white z-50"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.95 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                            />
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {globeObjects.map((obj) => (
                            <motion.div
                              key={obj.id}
                              className={`absolute text-3xl sm:text-4xl select-none ${
                                draggedObjectId === obj.id
                                  ? "cursor-grabbing z-50"
                                  : "cursor-pointer"
                              }`}
                              style={{
                                left: `${obj.x}%`,
                                top: `${obj.y}%`,
                                transform: `translate(-50%, -50%) scale(${obj.scale})`,
                                filter:
                                  "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
                              }}
                              initial={{ scale: 0, rotateY: 180, opacity: 0 }}
                              animate={{
                                scale: obj.scale,
                                rotateY: 0,
                                opacity: 1,
                              }}
                              exit={{ scale: 0, rotateY: 180, opacity: 0 }}
                              whileHover={
                                draggedObjectId === obj.id
                                  ? {} // No hover effect while dragging
                                  : {
                                      scale: obj.scale * 1.2,
                                      filter:
                                        "drop-shadow(4px 4px 8px rgba(0,0,0,0.4))",
                                    }
                              }
                              onClick={() => {
                                if (!isObjectDragging && !isDragClick) {
                                  removeObject(obj.id);
                                }
                              }}
                              onMouseDown={(e) =>
                                handleObjectMouseDown(e, obj.id)
                              }
                              onTouchStart={(e) =>
                                handleObjectTouchStart(e, obj.id)
                              }
                            >
                              <obj.icon
                                size={48}
                                className={
                                  isDark ? "text-slate-200" : "text-amber-800"
                                }
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        <AnimatePresence>
                          {snowflakes.map((flake) => (
                            <motion.div
                              key={flake.id}
                              className="absolute text-white pointer-events-none select-none"
                              style={{
                                left: `${flake.x}px`,
                                top: `${flake.y}px`,
                                fontSize: `${flake.size}px`,
                                opacity: flake.opacity,
                                filter:
                                  "drop-shadow(1px 1px 2px rgba(0,0,0,0.5))",
                              }}
                              initial={{
                                y: -20,
                                opacity: 0,
                                rotate: 0,
                                scale: 0,
                              }}
                              animate={{
                                y: 400,
                                opacity: [0, flake.opacity, flake.opacity, 0],
                                rotate: [0, 180, 360],
                                scale: [0, 1, 1, 0],
                                x: flake.x + Math.sin(flake.y * 0.02) * 30,
                              }}
                              exit={{ opacity: 0, scale: 0 }}
                              transition={{
                                duration: 6,
                                ease: "linear",
                                rotate: {
                                  duration: 4,
                                  repeat: Infinity,
                                  ease: "linear",
                                },
                              }}
                            >
                              <Snowflake
                                size={flake.size}
                                className="text-white"
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full pointer-events-none" />
                        <div className="absolute top-8 left-8 w-16 h-16 bg-white/40 rounded-full blur-xl pointer-events-none" />
                        <div className="absolute bottom-12 right-12 w-8 h-8 bg-white/30 rounded-full blur-lg pointer-events-none" />

                        <AnimatePresence>
                          {draggedObject && (
                            <motion.div
                              className="absolute inset-4 border-4 border-dashed border-white/60 rounded-full flex items-center justify-center pointer-events-none"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <span className="text-white/80 text-lg font-semibold">
                                Drop Here
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.div>
                  </div>
                  <div className="lg:col-span-1 space-y-6">
                    <motion.div
                      className={`backdrop-blur-xl rounded-2xl p-4 lg:p-6 ${
                        isDark
                          ? "bg-slate-900/50 border-slate-700/50 border-2"
                          : "bg-amber-50/50 border-black border-2 lg:border-4"
                      }`}
                      initial={{ opacity: 0, y: 20, x: 0, rotateY: 0 }}
                      animate={{ opacity: 1, y: 0, x: 0, rotateY: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{
                        transform: "perspective(1000px) rotateY(0)",
                        filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.15))",
                      }}
                      style={{
                        transform:
                          "perspective(1000px) rotateY(0deg) lg:rotateY(2deg)",
                        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))",
                      }}
                    >
                      <h3
                        className={`text-base lg:text-lg font-semibold mb-3 lg:mb-4 ${
                          isDark ? "text-slate-200" : "text-amber-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Gift
                            size={16}
                            className={`lg:w-5 lg:h-5 ${
                              isDark ? "text-slate-200" : "text-amber-800"
                            }`}
                          />
                          Objects
                        </div>
                      </h3>
                      <div className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-1 lg:gap-3 lg:overflow-x-visible">
                        {GLOBE_OBJECTS.map((obj) => (
                          <motion.div
                            key={obj.type}
                            className={`flex-shrink-0 lg:flex-shrink p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all duration-300 w-16 lg:w-auto ${
                              isShaking
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-grab active:cursor-grabbing"
                            } ${
                              isDark
                                ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 border-2"
                                : "bg-amber-100/70 border-black hover:bg-amber-200/70 border-2"
                            }`}
                            draggable={!isShaking}
                            whileHover={
                              !isShaking
                                ? {
                                    scale: 1.05,
                                    filter:
                                      "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                                  }
                                : {}
                            }
                            whileTap={!isShaking ? { scale: 0.95 } : {}}
                            onDragStart={(e: any) => {
                              if (e.dataTransfer && !isShaking) {
                                setDraggedObject(obj.type);
                                e.dataTransfer.effectAllowed = "copy";
                              } else if (isShaking) {
                                e.preventDefault();
                              }
                            }}
                            onDragEnd={() => setDraggedObject(null)}
                            onTouchStart={(e) => handleTouchStart(e, obj.type)}
                          >
                            <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3">
                              <obj.icon
                                size={16}
                                className={`lg:w-5 lg:h-5 ${
                                  isDark ? "text-slate-200" : "text-amber-800"
                                }`}
                              />
                              <span
                                className={`text-xs font-medium text-center lg:text-left leading-tight lg:text-sm ${
                                  isDark ? "text-slate-300" : "text-amber-800"
                                }`}
                              >
                                {obj.name}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentPage === "gallery" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen p-4 md:p-8"
            >
              <div className="max-w-7xl mx-auto">
                <motion.div
                  className="text-center mb-12"
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2
                    className={`text-4xl md:text-5xl font-bold mb-4 ${
                      isDark ? "text-slate-100" : "text-amber-900"
                    }`}
                    style={{
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                    }}
                  >
                    Your Snow Globe Collection
                  </h2>
                  <p
                    className={`text-xl ${
                      isDark ? "text-slate-300" : "text-amber-700"
                    }`}
                  >
                    {savedGlobes.length} magical globes created
                  </p>
                </motion.div>

                {savedGlobes.length === 0 ? (
                  <motion.div
                    className="text-center py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-6xl mb-6 flex justify-center">
                      <Cloud
                        size={64}
                        className={isDark ? "text-slate-300" : "text-amber-800"}
                      />
                    </div>
                    <h3
                      className={`text-2xl font-semibold mb-4 ${
                        isDark ? "text-slate-300" : "text-amber-800"
                      }`}
                    >
                      No globes yet!
                    </h3>
                    <p
                      className={`mb-8 ${
                        isDark ? "text-slate-400" : "text-amber-700"
                      }`}
                    >
                      Create your first magical snow globe to get started.
                    </p>
                    <motion.button
                      className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                        isDark
                          ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                          : "bg-amber-700 text-amber-50 hover:bg-amber-800"
                      }`}
                      whileHover={{
                        scale: 1.05,
                        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage("builder")}
                    >
                      <div className="flex items-center gap-2">
                        Create First Globe <Sparkles size={20} />
                      </div>
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {savedGlobes.map((globe, index) => {
                      const background =
                        BACKGROUNDS.find((bg) => bg.id === globe.background) ||
                        BACKGROUNDS[0];
                      return (
                        <motion.div
                          key={globe.id}
                          className={`backdrop-blur-xl rounded-2xl p-6 transition-all cursor-pointer ${
                            isDark
                              ? "bg-slate-900/50 border-slate-700/50 hover:bg-slate-800/50 border-2"
                              : "bg-amber-50/50 border-black hover:bg-amber-100/70 border-4"
                          }`}
                          style={{
                            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))",
                            transform: "perspective(1000px) rotateY(0deg)",
                          }}
                          initial={{
                            opacity: 0,
                            y: 50,
                            rotateY: index % 2 === 0 ? -5 : 5,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            rotateY: 0,
                          }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{
                            scale: 1.02,
                            y: -5,
                            rotateY: index % 2 === 0 ? 3 : -3,
                            filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.2))",
                          }}
                          onClick={() => loadGlobe(globe)}
                        >
                          <div
                            className={`w-full h-40 rounded-full shadow-lg overflow-hidden relative mb-4 ${
                              isDark
                                ? "border-slate-300/20 border-4"
                                : "border-black border-4"
                            }`}
                            style={
                              isDark
                                ? background.darkStyle
                                : background.lightStyle
                            }
                          >
                            {globe.objects.map((obj) => (
                              <div
                                key={obj.id}
                                className="absolute text-lg"
                                style={{
                                  left: `${obj.x}%`,
                                  top: `${obj.y}%`,
                                  transform: `translate(-50%, -50%) scale(${
                                    obj.scale * 0.7
                                  })`,
                                }}
                              >
                                <obj.icon
                                  size={14}
                                  className={
                                    isDark ? "text-slate-200" : "text-amber-800"
                                  }
                                />
                              </div>
                            ))}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-full" />
                          </div>

                          <div className="text-center">
                            <h3
                              className={`text-lg font-semibold mb-2 ${
                                isDark ? "text-slate-200" : "text-amber-900"
                              }`}
                            >
                              {globe.name}
                            </h3>
                            <p
                              className={`text-sm mb-2 ${
                                isDark ? "text-slate-400" : "text-amber-700"
                              }`}
                            >
                              {background.name}
                            </p>
                            <p
                              className={`text-xs ${
                                isDark ? "text-slate-500" : "text-amber-600"
                              }`}
                            >
                              {globe.objects.length} objects •{" "}
                              {globe.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer
        className={`mt-20 backdrop-blur-xl ${
          isDark
            ? "bg-slate-900/30 border-slate-700/30 border-t-2"
            : "bg-amber-50/30 border-black border-t-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDark ? "text-slate-200" : "text-amber-900"
                }`}
              >
                Snow Globe Builder
              </h3>
              <p
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-amber-700"
                }`}
              >
                Create magical digital snow globes with stunning 3D effects and
                animations.
              </p>
            </div>

            <div>
              <h4
                className={`text-md font-semibold mb-3 ${
                  isDark ? "text-slate-300" : "text-amber-800"
                }`}
              >
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    Enterprise
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4
                className={`text-md font-semibold mb-3 ${
                  isDark ? "text-slate-300" : "text-amber-800"
                }`}
              >
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    Press
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4
                className={`text-md font-semibold mb-3 ${
                  isDark ? "text-slate-300" : "text-amber-800"
                }`}
              >
                Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={`mt-8 pt-8 ${
              isDark
                ? "border-slate-700/50 border-t-2"
                : "border-black border-t-2"
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div
                className={`flex items-center space-x-4 mb-4 md:mb-0 ${
                  isDark ? "text-slate-400" : "text-amber-700"
                }`}
              >
                <span className="text-sm">
                  © 2025 Snow Globe Builder, Inc. All rights reserved.
                </span>
              </div>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className={`text-sm transition-colors ${
                    isDark
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-amber-700 hover:text-amber-900"
                  }`}
                >
                  Status
                </a>
                <a
                  href="#"
                  className={`text-sm transition-colors ${
                    isDark
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-amber-700 hover:text-amber-900"
                  }`}
                >
                  Security
                </a>
                <a
                  href="#"
                  className={`text-sm transition-colors ${
                    isDark
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-amber-700 hover:text-amber-900"
                  }`}
                >
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
