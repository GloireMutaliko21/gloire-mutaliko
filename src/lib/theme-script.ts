export type Theme = "light" | "dark";
export const THEME_KEY = "theme";

/**
 * Runs in <head> before first paint: applies the saved theme, or the system
 * one when nothing is saved, so the page never flashes the wrong colors.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;
