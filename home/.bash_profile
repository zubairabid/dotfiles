#
# ~/.bash_profile
#

[[ -f ~/.bashrc ]] && . ~/.bashrc
if [ -e /home/zubair/.nix-profile/etc/profile.d/nix.sh ]; then . /home/zubair/.nix-profile/etc/profile.d/nix.sh; fi # added by Nix installer
