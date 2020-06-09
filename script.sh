rsync -av --delete ~/.config/blender dotconfig
rsync -av --delete ~/.config/compton dotconfig
rsync -av --delete ~/.config/GIMP dotconfig
rsync -av --delete ~/.config/gtk-2.0 dotconfig
rsync -av --delete ~/.config/gtk-3.0 dotconfig
rsync -av --delete ~/.config/i3 dotconfig
rsync -av --delete ~/.config/inkscape dotconfig
rsync -av --delete ~/.config/mpv dotconfig
rsync -av --delete ~/.config/neofetch dotconfig
rsync -av --delete ~/.config/nvim dotconfig
rsync -av --delete ~/.config/polybar dotconfig
rsync -av --delete ~/.config/ranger dotconfig
rsync -av --delete ~/.config/rofi dotconfig
rsync -av --delete ~/.config/termite dotconfig
rsync -av --delete ~/.config/vlc dotconfig
rsync -av --delete ~/.config/zathura dotconfig

git add dotconfig
git commit -m ""
