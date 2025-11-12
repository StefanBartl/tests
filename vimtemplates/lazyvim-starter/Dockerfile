FROM alpine:edge

# Verzeichnis setzen
WORKDIR /root

# Pakete installieren
RUN apk add --no-cache \
      git \
      lazygit \
      fzf \
      curl \
      neovim \
      ripgrep \
      alpine-sdk

# LazyVim Starter klonen
RUN git clone https://github.com/LazyVim/starter /root/.config/nvim

# Standardkommando: nvim starten
CMD ["nvim"]
