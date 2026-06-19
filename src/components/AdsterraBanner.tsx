import React, { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  placement?: 'home' | 'player' | 'footer';
}

export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ placement = 'home' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous elements to avoid duplicates on fast hot-reloads
    containerRef.current.innerHTML = '';

    // Create container element
    const containerDiv = document.createElement('div');
    containerDiv.id = `container-8dc2932844d94fd13d6b428141560056-${placement}`;
    containerDiv.style.width = '100%';
    containerDiv.style.display = 'flex';
    containerDiv.style.justifyContent = 'center';

    // Create the script tag containing the atOptions configuration
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `
      atOptions = {
        'key' : '8dc2932844d94fd13d6b428141560056',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    // Create the main invitation script tag
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.highperformanceformat.com/8dc2932844d94fd13d6b428141560056/invoke.js';

    // Append both configs inside our target container
    containerDiv.appendChild(configScript);
    containerDiv.appendChild(invokeScript);
    containerRef.current.appendChild(containerDiv);
  }, [placement]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-6 py-4 px-2 bg-gradient-to-r from-gray-900/40 via-black/60 to-gray-900/40 border border-gray-800/40 rounded-xl overflow-hidden shadow-lg shadow-black/50">
      <div className="flex items-center space-x-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block text-center">
          Sponsored Stream Content
        </span>
      </div>
      
      {/* Scrollable container on small devices to keep display layout matching 728px width */}
      <div className="w-full overflow-x-auto flex justify-center py-1">
        <div 
          ref={containerRef} 
          className="min-h-[90px] w-[728px] flex items-center justify-center bg-black/20 rounded border border-gray-800/10"
        />
      </div>
    </div>
  );
};
