@echo off

powershell -Command "magick convert private/logo.png -resize 16x  public/icons/icon_16.png"
powershell -Command "magick convert private/logo.png -resize 32x  public/icons/icon_32.png"
powershell -Command "magick convert private/logo.png -resize 48x  public/icons/icon_48.png"
powershell -Command "magick convert private/logo.png -resize 128x public/icons/icon_128.png"

pause