# YouTube Keyboard Focus Fix for Firefox

Fix YouTube arrow keys, player focus, and stuck playback speed in Firefox.

This userscript automatically focuses the YouTube HTML5 player when a video page opens, so keyboard controls work immediately:

- `Arrow Left` / `Arrow Right`: seek 5 seconds backward or forward
- `Arrow Up` / `Arrow Down`: change volume
- playback speed resets to `1x` when a new video loads
- YouTube preview videos that get stuck at `0.25x` are reset when they appear

The script does not force `1x` forever. After a video loads, you can still manually choose another playback speed.

## Why this exists

In Firefox, YouTube sometimes opens a video without giving the HTML5 player the right keyboard focus. Then arrow keys do not behave like they do after clicking directly on the video.

Some users also get stuck with YouTube playback speed at `0.25x`, including preview videos. Clearing cookies and cache can help, but it should not be the regular fix.

This script fixes both problems locally in the browser.

## Install

1. Install a userscript manager:
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Tampermonkey](https://www.tampermonkey.net/)
2. Open the raw userscript:
   - [youtube-keyboard-focus-fix.user.js](https://raw.githubusercontent.com/lowyabusa/youtube-keyboard-focus-fix/main/youtube-keyboard-focus-fix.user.js)
3. Confirm installation in the userscript manager.
4. Open a YouTube video in Firefox.

## Keywords

YouTube arrow keys not working, YouTube arrow keys volume not working, YouTube player focus fix, YouTube playback speed stuck at 0.25x, Firefox YouTube keyboard shortcuts, YouTube HTML5 player autofocus, Violentmonkey userscript, Tampermonkey userscript.

## Notes

- Built for Firefox, but it may also work in other browsers with a userscript manager.
- This is for the YouTube HTML5 player, not the old Flash Player.
- No tracking, no external requests, no data collection.
- Not affiliated with YouTube, Google, Mozilla, Violentmonkey, or Tampermonkey.

## License

MIT
