
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoveButtonProps {
  productId: string;
  className?: string;
}

const LoveButton = ({ productId, className = '' }: LoveButtonProps) => {
  const [isLoved, setIsLoved] = useState(false);
  const [loveCount, setLoveCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Load love status and count from localStorage
    const loves = JSON.parse(localStorage.getItem('productLoves') || '{}');
    const userLoves = JSON.parse(localStorage.getItem('userLoves') || '[]');
    
    setLoveCount(loves[productId] || 0);
    setIsLoved(userLoves.includes(productId));
  }, [productId]);

  const handleLoveClick = () => {
    const loves = JSON.parse(localStorage.getItem('productLoves') || '{}');
    const userLoves = JSON.parse(localStorage.getItem('userLoves') || '[]');
    
    if (isLoved) {
      // Remove love
      loves[productId] = Math.max(0, (loves[productId] || 0) - 1);
      const newUserLoves = userLoves.filter((id: string) => id !== productId);
      localStorage.setItem('userLoves', JSON.stringify(newUserLoves));
      setIsLoved(false);
      toast({
        title: "Removed from favorites",
        description: "Product removed from your favorites",
      });
    } else {
      // Add love
      loves[productId] = (loves[productId] || 0) + 1;
      userLoves.push(productId);
      localStorage.setItem('userLoves', JSON.stringify(userLoves));
      setIsLoved(true);
      toast({
        title: "Added to favorites",
        description: "Product added to your favorites",
      });
    }
    
    localStorage.setItem('productLoves', JSON.stringify(loves));
    setLoveCount(loves[productId]);
  };

  return (
    <button
      onClick={handleLoveClick}
      className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${className}`}
    >
      <Heart 
        className={`w-5 h-5 ${isLoved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
      />
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {loveCount}
      </span>
    </button>
  );
};

export default LoveButton;
