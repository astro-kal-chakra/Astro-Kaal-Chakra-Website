"use client";

import { useEffect } from "react";


const enabled = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ALLOW_DEVTOOLS !== "true";

function isBlockedShortcut( e ) {
  const key = e.key?.toLowerCase();
  if ( e.key === "F12" ) return true;
  const mod = e.ctrlKey || e.metaKey;
  if ( mod && ( e.shiftKey || e.altKey ) && [ "i", "j", "c" ].includes( key ) ) return true;
  if ( mod && key === "u" ) return true;
  return false;
}

export function DevToolsGuard() {
  useEffect( () => {
    if ( !enabled ) return;

    const onKeyDown = ( e ) => {
      if ( isBlockedShortcut( e ) ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onContextMenu = ( e ) => {
      if ( e.target.closest?.( "input, textarea, [contenteditable='true']" ) ) return;
      e.preventDefault();
    };

    window.addEventListener( "keydown", onKeyDown, true );
    window.addEventListener( "contextmenu", onContextMenu, true );
    return () => {
      window.removeEventListener( "keydown", onKeyDown, true );
      window.removeEventListener( "contextmenu", onContextMenu, true );
    };
  }, [] );

  return null;
}
