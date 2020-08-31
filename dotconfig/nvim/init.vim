" Plugins will be downloaded under the specified directory.
call plug#begin('~/.local/share/nvim/plugged')

"""""""""""""""""""""""""""""""""""
"  List of all Plugins installed  "
"""""""""""""""""""""""""""""""""""

" Status line
Plug 'bling/vim-airline'

" fuzzy finder
Plug 'junegunn/fzf'

" Pandoc, because Markdown is love
Plug 'vim-pandoc/vim-pandoc'
Plug 'vim-pandoc/vim-pandoc-syntax'

" Org-mode syntax highlighting only
Plug 'axvr/org.vim'

" Elm support
Plug 'elmcast/elm-vim'

" Markdown live preview. If you don't have nodejs and yarn, use pre build
Plug 'iamcco/markdown-preview.nvim', { 'do': { -> mkdp#util#install() }}

" UltiSnips
Plug 'SirVer/ultisnips'
Plug 'honza/vim-snippets'

" Markdown tables
Plug 'dhruvasagar/vim-table-mode'

" Vimtex
Plug 'lervag/vimtex'

" VimWiki
Plug 'vimwiki/vimwiki'

" Using coc - completion engine
Plug 'neoclide/coc.nvim', {'branch': 'release'}

"""""""""""""""""""""
"  Markdown tables  "
"""""""""""""""""""""

let g:table_mode_corner='|'

"""""""""""""""""""""""""""""""""
"  pandoc_syntax configutation  "
"""""""""""""""""""""""""""""""""

augroup pandoc_syntax
    au! BufNewFile,BufFilePre,BufRead *.md set filetype=markdown.pandoc
augroup END

augroup pandoc_syntax
  autocmd! FileType vimwiki set syntax=markdown.pandoc
augroup END 

""""""""""""""""""""""""""""""""""""
"  Markdown Preview Configuration  "
""""""""""""""""""""""""""""""""""""

" do not close the preview tab when switching to other buffers
let g:mkdp_auto_close = 0

"""""""""""""""""""""""""""""
"  UltiSnips Configuration  "
"""""""""""""""""""""""""""""

" Trigger configuration. Do not use <tab> if you use
" https://github.com/Valloric/YouCompleteMe.
let g:UltiSnipsExpandTrigger='<c-n>'
let g:UltiSnipsListSnippets='<c-b>'
" shortcut to go to next position
let g:UltiSnipsJumpForwardTrigger='<c-k>'
" shortcut to go to previous position
let g:UltiSnipsJumpBackwardTrigger='<c-j>'
let g:UltiSnipsSnippetDirectories=["UltiSnips"]

""""""""""""""""""""""""""
"  Vimtex Configuration  "
""""""""""""""""""""""""""

" Taking vimtex plugin config from https://castel.dev/post/lecture-notes-1/
let g:tex_flavor='latex'
let g:vimtex_compiler_latexmk = { 
        \ 'executable' : 'latexmk',
        \ 'options' : [ 
        \   '-xelatex',
        \   '-file-line-error',
        \   '-synctex=1',
        \   '-interaction=nonstopmode',
        \ ],
        \}
let g:vimtex_view_method='zathura'
let g:vimtex_quickfix_mode=0
set conceallevel=1
let g:tex_conceal='abdmg'

"""""""""""""""""""""""""""
"  Vimwiki configuration  "
"""""""""""""""""""""""""""

let g:vimwiki_list = [
			\{'path': '~/Documents/notes/', 'syntax': 'markdown', 'ext': '.md'},
			\{'path': '~/Documents/Work/RWiki/', 'syntax': 'markdown', 'ext': '.md'},
			\{'path': '~/Documents/Work/Acads/Semester7/', 'syntax': 'markdown', 'ext': '.md'}
			\]
let g:vimwiki_global_ext = 0

"""""""""""""""""""""""""""""""
"  Vim-Airline Configuration  "
"""""""""""""""""""""""""""""""

let g:airline#extensions#coc#enabled = 1

""""""""""""""""""""""
"  Configuring Coc-snippets. Does not seem to be optimal."
""""""""""""""""""""""

" Use <C-l> for trigger snippet expand.
imap <C-l> <Plug>(coc-snippets-expand)
" Use <C-j> for select text for visual placeholder of snippet.
vmap <C-j> <Plug>(coc-snippets-select)
" Use <C-j> for jump to next placeholder, it's default of coc.nvim
let g:coc_snippet_next = '<c-j>'
" Use <C-k> for jump to previous placeholder, it's default of coc.nvim
let g:coc_snippet_prev = '<c-k>'
" Use <C-j> for both expand and jump (make expand higher priority.)
imap <C-j> <Plug>(coc-snippets-expand-jump)

" List ends here. Plugins become visible to Vim after this call.
call plug#end()

set nospell

set showmatch
set ignorecase smartcase
set hlsearch

set tabstop=4
set softtabstop=4
set expandtab
set smarttab
set shiftwidth=4

set autoindent smartindent

set number relativenumber
set nu rnu
set cc=80
set tw=80

filetype plugin on
syntax on

color desert
hi clear SpellBad
hi SpellBad cterm=reverse
set cursorline
hi CursorLine cterm=NONE ctermbg=0

"""""""""""""""""""""""""
"  Working with splits  "
"""""""""""""""""""""""""

" Navigation
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>

" Default split right+bottom
set splitright

" Working with the default :Vex
let g:netrw_banner = 0 " Remove banner
let g:netrw_liststyle = 3 " Tree view
let g:netrw_altv = 1
let g:netrw_browse_split = 4 " Open new file in vsplit
let g:netrw_winsize = 25

" nmap <C-n> :Vex<CR>

nnoremap <silent> <leader>f :FZF<cr>
nnoremap <silent> <leader>F :FZF ~<cr>

command! MakeTags !ctags -R .

" command to tangle org files
command! Tangle !emacs --batch --eval "(require 'org)" --eval '(org-babel-tangle-file "%")'
command! Publish !pandoc -s -f org -t html % -o %:r.html
