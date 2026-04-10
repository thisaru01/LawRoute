import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MediaLightbox({ media, initialIndex, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex || 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialIndex]);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  }, [isOpen, currentIndex, media.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !media || media.length === 0) return null;

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const currentItem = media[currentIndex];
  
  const isImage =
    currentItem.resourceType === "image" ||
    (typeof currentItem.url === "string" && /\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i.test(currentItem.url));

  const isVideo =
    currentItem.resourceType === "video" ||
    (typeof currentItem.url === "string" && /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(currentItem.url));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={onClose}>
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-none">
        <div className="text-white/80 font-medium px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md">
          {currentIndex + 1} / {media.length}
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white pointer-events-auto"
        >
          <X className="size-6" />
        </button>
      </div>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button 
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white backdrop-blur-md"
            onClick={handlePrev}
          >
            <ChevronLeft className="size-8" />
          </button>
          
          <button 
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white backdrop-blur-md"
            onClick={handleNext}
          >
            <ChevronRight className="size-8" />
          </button>
        </>
      )}

      {/* Main Content */}
      <div className="w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center p-8 pointer-events-none" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full h-full flex items-center justify-center pointer-events-auto shadow-2xl">
          {isImage && (
            <img 
              src={currentItem.url} 
              alt={`Attachment ${currentIndex + 1}`} 
              className="max-w-full max-h-full object-contain rounded-md"
            />
          )}
          {isVideo && (
            <video 
              src={currentItem.url} 
              controls 
              autoPlay 
              className="max-w-full max-h-full object-contain rounded-md"
            />
          )}
          {(!isImage && !isVideo) && (
            <div className="flex flex-col items-center justify-center text-white/50 p-12 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
              <ImageIcon className="size-20 mb-4 opacity-50" />
              <span className="text-lg">{currentItem.originalFilename || `Attachment ${currentIndex + 1}`}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
