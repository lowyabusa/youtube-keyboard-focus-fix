// ==UserScript==
// @name         YouTube Keyboard Focus Fix
// @namespace    https://github.com/lowyabusa/youtube-keyboard-focus-fix
// @version      1.0.0
// @description  Auto-focuses the YouTube HTML5 player in Firefox, fixes arrow keys, and resets stuck playback speed to 1x when videos load.
// @author       lowyabusa
// @license      MIT
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @run-at       document-start
// @grant        none
// @homepageURL  https://github.com/lowyabusa/youtube-keyboard-focus-fix
// @supportURL   https://github.com/lowyabusa/youtube-keyboard-focus-fix/issues
// @downloadURL  https://raw.githubusercontent.com/lowyabusa/youtube-keyboard-focus-fix/main/youtube-keyboard-focus-fix.user.js
// @updateURL    https://raw.githubusercontent.com/lowyabusa/youtube-keyboard-focus-fix/main/youtube-keyboard-focus-fix.user.js
// ==/UserScript==

(() => {
  'use strict';

  const VIDEO_RESET_ROUTE = new WeakMap();
  const VIDEO_LISTENERS_ATTACHED = new WeakSet();
  const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

  let setupRunId = 0;

  function isWatchPage() {
    return location.pathname === '/watch' && new URLSearchParams(location.search).has('v');
  }

  function getRouteKey() {
    const params = new URLSearchParams(location.search);

    if (location.pathname === '/watch' && params.has('v')) {
      return `watch:${params.get('v')}`;
    }

    if (location.pathname.startsWith('/shorts/')) {
      return `shorts:${location.pathname}`;
    }

    return `page:${location.pathname}${location.search}`;
  }

  function userIsTyping() {
    const element = document.activeElement;

    if (!element) {
      return false;
    }

    return (
      element.matches?.('input, textarea, select, [contenteditable="true"]') ||
      element.closest?.('input, textarea, select, [contenteditable="true"]')
    );
  }

  function getPlayer() {
    return document.querySelector('#movie_player');
  }

  function getMainVideo() {
    return (
      document.querySelector('video.html5-main-video') ||
      document.querySelector('#movie_player video')
    );
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function resetSpeed(video) {
    if (!video) {
      return;
    }

    video.defaultPlaybackRate = 1;

    if (video.playbackRate !== 1) {
      video.playbackRate = 1;
    }
  }

  function attachVideoListeners(video) {
    if (!video || VIDEO_LISTENERS_ATTACHED.has(video)) {
      return;
    }

    VIDEO_LISTENERS_ATTACHED.add(video);

    video.addEventListener('loadedmetadata', () => {
      resetSpeed(video);
    });
  }

  function prepareVideo(video) {
    if (!video) {
      return;
    }

    attachVideoListeners(video);

    const routeKey = getRouteKey();

    if (VIDEO_RESET_ROUTE.get(video) !== routeKey) {
      VIDEO_RESET_ROUTE.set(video, routeKey);
      resetSpeed(video);
    }
  }

  function prepareExistingVideos() {
    document.querySelectorAll('video').forEach(prepareVideo);
  }

  function focusPlayer() {
    if (!isWatchPage() || userIsTyping()) {
      return false;
    }

    const player = getPlayer();
    const video = getMainVideo();

    if (!player || !video) {
      return false;
    }

    if (!player.hasAttribute('tabindex')) {
      player.setAttribute('tabindex', '-1');
    }

    prepareVideo(video);
    player.focus({ preventScroll: true });

    return true;
  }

  function scheduleSetup() {
    const currentRunId = ++setupRunId;
    let attempts = 0;

    const intervalId = setInterval(() => {
      if (currentRunId !== setupRunId || attempts++ > 24) {
        clearInterval(intervalId);
        return;
      }

      prepareExistingVideos();

      if (!isWatchPage() || focusPlayer()) {
        clearInterval(intervalId);
      }
    }, 250);
  }

  function seekBy(seconds) {
    const video = getMainVideo();

    if (!video) {
      return;
    }

    const duration = Number.isFinite(video.duration) ? video.duration : Number.MAX_SAFE_INTEGER;
    const targetTime = clamp(video.currentTime + seconds, 0, duration);

    video.currentTime = targetTime;
  }

  function changeVolume(delta) {
    const player = getPlayer();
    const video = getMainVideo();

    if (!video) {
      return;
    }

    if (
      player &&
      typeof player.getVolume === 'function' &&
      typeof player.setVolume === 'function'
    ) {
      const nextVolume = clamp(player.getVolume() + delta, 0, 100);

      if (delta > 0 && typeof player.unMute === 'function') {
        player.unMute();
      }

      player.setVolume(nextVolume);

      if (nextVolume === 0 && typeof player.mute === 'function') {
        player.mute();
      }

      return;
    }

    const nextVolume = clamp((video.volume * 100) + delta, 0, 100);

    if (delta > 0) {
      video.muted = false;
    }

    video.volume = nextVolume / 100;

    if (nextVolume === 0) {
      video.muted = true;
    }
  }

  function handleArrowKeys(event) {
    if (!isWatchPage() || userIsTyping()) {
      return;
    }

    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      !ARROW_KEYS.has(event.key)
    ) {
      return;
    }

    const video = getMainVideo();

    if (!video) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    if (event.key === 'ArrowLeft') {
      seekBy(-5);
    } else if (event.key === 'ArrowRight') {
      seekBy(5);
    } else if (event.key === 'ArrowUp') {
      changeVolume(5);
    } else if (event.key === 'ArrowDown') {
      changeVolume(-5);
    }
  }

  function observeNewVideos() {
    const root = document.documentElement;

    if (!root) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) {
            continue;
          }

          if (node.matches('video')) {
            prepareVideo(node);
          }

          node.querySelectorAll?.('video').forEach(prepareVideo);
        }
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true
    });
  }

  document.addEventListener('keydown', handleArrowKeys, true);
  document.addEventListener('DOMContentLoaded', () => {
    observeNewVideos();
    scheduleSetup();
  });

  window.addEventListener('load', scheduleSetup);
  window.addEventListener('yt-navigate-finish', scheduleSetup);

  if (document.readyState !== 'loading') {
    observeNewVideos();
    scheduleSetup();
  }
})();
