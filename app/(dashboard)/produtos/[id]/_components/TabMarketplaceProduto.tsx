"use client";

import { ImageIcon, Link } from "lucide-react";

export interface MarketplaceImage {
  id: string;
  url: string;
  productId: string;
}

export function TabMarketplaceProduto({ images }: { images: MarketplaceImage[] }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-xs">Imagens do produto para o Marketplace.</p>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3 border border-dashed border-slate-700/50 rounded-lg">
          <ImageIcon className="w-10 h-10 opacity-30" />
          <p className="text-sm">Nenhuma imagem cadastrada para este produto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-lg border border-slate-700/50 overflow-hidden bg-slate-900/30 aspect-square"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt="Imagem do produto"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-xs bg-slate-700 px-2 py-1 rounded flex items-center gap-1"
                >
                  <Link className="w-3 h-3" /> Ver
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
