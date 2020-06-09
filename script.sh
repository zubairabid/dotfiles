dir=`pwd`

rsync -av --delete ~/.config/blender $dir/dotconfig
rsync -av --delete ~/.config/compton $dir/dotconfig
rsync -av --delete ~/.config/GIMP $dir/dotconfig
rsync -av --delete ~/.config/gtk-2.0 $dir/dotconfig
rsync -av --delete ~/.config/gtk-3.0 $dir/dotconfig
rsync -av --delete ~/.config/i3 $dir/dotconfig
rsync -av --delete ~/.config/inkscape $dir/dotconfig
rsync -av --delete ~/.config/mpv $dir/dotconfig
rsync -av --delete ~/.config/neofetch $dir/dotconfig
rsync -av --delete ~/.config/nvim $dir/dotconfig
rsync -av --delete ~/.config/polybar $dir/dotconfig
rsync -av --delete ~/.config/ranger $dir/dotconfig
rsync -av --delete ~/.config/rofi $dir/dotconfig
rsync -av --delete ~/.config/termite $dir/dotconfig
rsync -av --delete ~/.config/vlc $dir/dotconfig
rsync -av --delete ~/.config/zathura $dir/dotconfig

git add $dir/dotconfig
git commit -m "`date`"
git push origin zxc3
