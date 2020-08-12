dir=`pwd`

echo "Moving .config"
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

echo "Moving home"
rsync -av --delete ~/.bashrc $dir/home/
rsync -av --delete ~/.bash_profile $dir/home/
rsync -av --delete ~/.condarc $dir/home/
rsync -av --delete ~/.ctags $dir/home/
rsync -av --delete ~/.emacs.d $dir/home/
rsync -av --delete ~/.fehbg $dir/home/
rsync -av --delete ~/.gitconfig $dir/home/
rsync -av --delete ~/.viminfo $dir/home/
rsync -av --delete ~/.vimrc $dir/home/
rsync -av --delete ~/.xinitrc $dir/home/
rsync -av --delete ~/.Xresources $dir/home/
rsync -av --delete ~/.zsh_history $dir/home/
rsync -av --delete ~/.zshrc $dir/home/

echo "Moving Scripts"
rsync -av --delete ~/Scripts/ $dir/Scripts

git add $dir/dotconfig
git add $dir/home
git add $dir/Scripts
git add $dir/script.sh

git commit -m "`date`"
git push origin zxc3
