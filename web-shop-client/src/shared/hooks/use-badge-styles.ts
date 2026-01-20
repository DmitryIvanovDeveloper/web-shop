import { useState, useEffect } from 'react';

interface BadgeStyle {
  bg: string;
  text: string;
  skew: string;
}

interface BadgeStyles {
  [key: string]: BadgeStyle;
}


export function useBadgeStyles(): BadgeStyles {
  const [badgeStyles, setBadgeStyles] = useState<BadgeStyles>({
    discount: { 
      bg: '#FF4500', 
      text: 'text-white',
      skew: '#FF4500'
    },
    limit: { 
      bg: '#4169E1', 
      text: 'text-white',
      skew: '#4169E1'
    },
    timer: { 
      bg: '#FFD700', 
      text: 'text-black',
      skew: '#FFD700'
    },
    rarity: { 
      bg: '#8A2BE2', 
      text: 'text-white',
      skew: '#8A2BE2'
    },
    purchased: { 
      bg: '#10B981', 
      text: 'text-white',
      skew: '#10B981'
    }
  });

  useEffect(() => {
    const loadBadgeStyles = async () => {
      try {
        const response = await fetch('/mocks/api/products/products.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load product styles: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.badges) {
          setBadgeStyles(data.badges);
        }
      } catch (error) {
      }
    };

    loadBadgeStyles();
  }, []);

  return badgeStyles;
}
