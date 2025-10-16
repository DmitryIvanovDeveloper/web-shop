"use client";

import type { CSSProperties } from "react";
import { Badge } from "../atoms/badge";

export interface BuyButtonStyle {
  readonly backgroundColor?: string;
  readonly textColor?: string;
  readonly borderRadius?: string;
  readonly padding?: string;
  readonly fontWeight?: string;
}

export interface BuyButton {
  readonly text?: string;
  readonly enabled?: boolean;
  readonly style?: BuyButtonStyle;
}

export interface OfferCardProps {
  readonly mainImage?: string;
  readonly mainImageAlt?: string;
  readonly sideImage?: string;
  readonly includedItems?: string[];
  readonly discount?: string;
  readonly playerLimit?: string;
  readonly timer?: string;
  readonly title?: string;
  readonly rarity?: string;
  readonly originalPrice?: string;
  readonly currentPrice?: string;
  readonly rpBonus?: number;
  readonly lpBonus?: number;
  readonly buyButton?: BuyButton;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onClick?: () => void;
}

export function OfferCard({
  mainImage = "",
  mainImageAlt = "Product",
  sideImage,
  includedItems = [],
  discount,
  playerLimit,
  timer,
  title = "",
  rarity,
  originalPrice,
  currentPrice = "",
  rpBonus,
  lpBonus,
  buyButton,
  className = "",
  style,
  onClick,
}: OfferCardProps): JSX.Element {
  return (
    <div
      className={`relative grid bg-gray-800 rounded-lg overflow-hidden shadow-lg !w-[280px] ${className}`}
      style={style}
      onClick={onClick}
    >
      {/* Discount Badge */}
      {discount && (
        <Badge
          text={discount}
          variant="discount"
          className="absolute top-2 left-2 z-10"
          style={{ backgroundColor: "#FF4500", color: "white" }}
        />
      )}

      {/* Player Limit Badge */}
      {playerLimit && (
        <Badge
          text={playerLimit}
          variant="limit"
          className="absolute top-2 right-2 z-10"
          style={{ backgroundColor: "#4169E1", color: "white" }}
        />
      )}

      {/* Timer Badge */}
      {timer && (
        <Badge
          text={timer}
          variant="timer"
          className="absolute bottom-2 left-2 z-10"
          style={{ backgroundColor: "#FFD700", color: "black" }}
        />
      )}

      {/* Main Image Section */}
      <div className="relative w-full h-48 bg-gray-700 flex items-center justify-center">
        {mainImage && (
          <img
            src={mainImage}
            alt={mainImageAlt}
            className="object-cover w-full h-full"
          />
        )}
        {/* {sideImage && (
          <img
            src={sideImage}
            alt="Side"
            className="absolute bottom-0 right-0 h-24 w-24 object-contain"
          />
        )} */}
        {/* {includedItems && includedItems.length > 0 && (
          <div className="absolute bottom-0 left-0 flex p-2 bg-black bg-opacity-50 rounded-tr-lg">
            {includedItems.map((item, index) => (
              <img
                key={index}
                src={item}
                alt={`Item ${index + 1}`}
                className="w-10 h-10 object-contain mx-1"
              />
            ))}
          </div>
        )} */}
      </div>


       {/* Content Section */}
           <div className="p-4 !grid !justify-center h-full">
         <div className="!flex-grow">
            <div>
                
            </div>
           {/* {rarity && (
             <Badge
               text={rarity ?? ""}
               variant="rarity"
               className="mb-2"
               style={{ backgroundColor: "#8A2BE2", color: "white" }}
             />
           )} */}
           
           {title && (
             <h3 className="text-white text-lg font-bold mb-2 truncate">
               {title}
             </h3>
           )}

           <div className="flex flex-col">
             {originalPrice && (
               <span className="text-gray-400 line-through text-sm truncate">
                 {originalPrice}
               </span>
             )}
             {currentPrice && (
               <span className="text-white text-xl font-extrabold truncate">
                 {currentPrice}
               </span>
             )}
           </div>

           <div className="flex flex-row text-sm text-gray-400 mt-2 justify-between">
             {rpBonus && <span className="truncate">+{rpBonus} RP</span>}
             {lpBonus && <span className="truncate">+{lpBonus} LP</span>}
           </div>
         </div>
             
         {/* Buy Button - Always at bottom */}
         {buyButton && buyButton.enabled && (
           <button
             className="w-full mt-auto py-3 px-4 text-white font-bold rounded-lg transition-colors hover:opacity-90"
             style={{
               backgroundColor: buyButton.style?.backgroundColor || "#FF6B35",
               color: buyButton.style?.textColor || "#FFFFFF",
               borderRadius: buyButton.style?.borderRadius || "8px",
               padding: buyButton.style?.padding || "12px 24px",
               fontWeight: buyButton.style?.fontWeight || "bold",
             }}
             onClick={(e) => {
               e.stopPropagation();
               console.log(`Buy button clicked for: ${title}`);
             }}
           >
             {buyButton.text || "BUY NOW"}
           </button>
         )}
       </div>
      
    </div>
  );
}
