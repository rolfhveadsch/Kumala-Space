import { useEffect, useRef } from 'react';
import '../styles/contentProtection.css';

const DEFAULT_ALLOW_SELECTOR =
  'button,a,input,textarea,select,summary,[role="button"],[data-content-protected-allow]';

const BLOCKED_CTRL_KEYS = new Set(['c', 'x', 'a', 's', 'u', 'p', 'v']);
const BLOCKED_SHIFT_KEYS = new Set(['i', 'j', 'c', 'k']);

function isWithinScope(target, scope) {
  if (!scope || !target) return false;
  return scope === target || scope.contains(target);
}

function isAllowedTarget(target, allowSelector) {
  if (!target?.closest) return false;
  try {
    return Boolean(target.closest(allowSelector));
  } catch {
    return false;
  }
}

function clearTextSelection() {
  const selection = window.getSelection?.();
  if (selection && selection.rangeCount > 0) {
    selection.removeAllRanges();
  }
}

/**
 * Attach comprehensive copy/selection protection to a DOM subtree.
 *
 * @param {React.RefObject<HTMLElement>} scopeRef - Root element to protect
 * @param {object} options
 * @param {boolean} [options.enabled=true]
 * @param {string} [options.allowSelector] - Elements that stay interactive (buttons, inputs, etc.)
 */
export function useContentProtection(scopeRef, { enabled = true, allowSelector = DEFAULT_ALLOW_SELECTOR } = {}) {
  const longPressTimer = useRef(null);

  useEffect(() => {
    const scope = scopeRef?.current;
    if (!enabled || !scope) return;

    const inScope = (target) => isWithinScope(target, scope);
    const isAllowed = (target) => isAllowedTarget(target, allowSelector);

    const blockIfInScope = (event) => {
      if (!inScope(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const onCopy = (e) => blockIfInScope(e);
    const onCut = (e) => blockIfInScope(e);
    const onPaste = (e) => blockIfInScope(e);
    const onBeforeCopy = (e) => blockIfInScope(e);
    const onBeforeCut = (e) => blockIfInScope(e);
    const onContextMenu = (e) => {
      if (!inScope(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const onSelectStart = (e) => {
      if (!inScope(e.target) || isAllowed(e.target)) return;
      e.preventDefault();
    };

    const onDragStart = (e) => {
      if (!inScope(e.target)) return;
      e.preventDefault();
    };

    const onKeyDown = (e) => {
      if (!inScope(e.target) && !inScope(document.activeElement)) return;

      const key = e.key?.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      if (mod && BLOCKED_CTRL_KEYS.has(key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (mod && e.shiftKey && BLOCKED_SHIFT_KEYS.has(key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (key === 'f12') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (e.altKey && mod && key === 'i') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onMouseDown = (e) => {
      if (!inScope(e.target) || isAllowed(e.target)) return;
      if (e.button !== 0) {
        e.preventDefault();
        return;
      }
      clearTextSelection();
    };

    const onPointerDown = (e) => {
      if (!inScope(e.target) || isAllowed(e.target)) return;
      if (e.pointerType === 'mouse' && e.button !== 0) {
        e.preventDefault();
      }
    };

    const onTouchStart = (e) => {
      if (!inScope(e.target) || isAllowed(e.target)) return;
      clearTimeout(longPressTimer.current);
      longPressTimer.current = setTimeout(() => {
        clearTextSelection();
        e.target?.blur?.();
      }, 400);
    };

    const onTouchMove = () => clearTimeout(longPressTimer.current);
    const onTouchEnd = () => clearTimeout(longPressTimer.current);
    const onTouchCancel = () => clearTimeout(longPressTimer.current);

    const markImage = (img) => {
      if (!img || img.tagName !== 'IMG') return;
      img.setAttribute('draggable', 'false');
      img.setAttribute('loading', img.getAttribute('loading') || 'lazy');
    };

    const protectImages = (root = scope) => {
      root.querySelectorAll?.('img').forEach(markImage);
      if (root.tagName === 'IMG') markImage(root);
    };

    protectImages();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue;
          protectImages(node);
        }
      }
    });
    observer.observe(scope, { childList: true, subtree: true });

    const capture = true;
    const passiveFalse = { capture: true, passive: false };

    document.addEventListener('copy', onCopy, capture);
    document.addEventListener('cut', onCut, capture);
    document.addEventListener('paste', onPaste, capture);
    document.addEventListener('beforecopy', onBeforeCopy, capture);
    document.addEventListener('beforecut', onBeforeCut, capture);
    document.addEventListener('contextmenu', onContextMenu, capture);
    document.addEventListener('selectstart', onSelectStart, capture);
    document.addEventListener('dragstart', onDragStart, capture);
    document.addEventListener('keydown', onKeyDown, capture);
    scope.addEventListener('mousedown', onMouseDown, capture);
    scope.addEventListener('pointerdown', onPointerDown, capture);
    scope.addEventListener('touchstart', onTouchStart, passiveFalse);
    scope.addEventListener('touchmove', onTouchMove, passiveFalse);
    scope.addEventListener('touchend', onTouchEnd, capture);
    scope.addEventListener('touchcancel', onTouchCancel, capture);

    scope.setAttribute('data-content-protected', 'true');

    return () => {
      clearTimeout(longPressTimer.current);
      document.removeEventListener('copy', onCopy, capture);
      document.removeEventListener('cut', onCut, capture);
      document.removeEventListener('paste', onPaste, capture);
      document.removeEventListener('beforecopy', onBeforeCopy, capture);
      document.removeEventListener('beforecut', onBeforeCut, capture);
      document.removeEventListener('contextmenu', onContextMenu, capture);
      document.removeEventListener('selectstart', onSelectStart, capture);
      document.removeEventListener('dragstart', onDragStart, capture);
      document.removeEventListener('keydown', onKeyDown, capture);
      scope.removeEventListener('mousedown', onMouseDown, capture);
      scope.removeEventListener('pointerdown', onPointerDown, capture);
      scope.removeEventListener('touchstart', onTouchStart, passiveFalse);
      scope.removeEventListener('touchmove', onTouchMove, passiveFalse);
      scope.removeEventListener('touchend', onTouchEnd, capture);
      scope.removeEventListener('touchcancel', onTouchCancel, capture);
      scope.removeAttribute('data-content-protected');
      observer.disconnect();
    };
  }, [enabled, allowSelector, scopeRef]);
}

export { DEFAULT_ALLOW_SELECTOR };
