// server.c
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>

#define SOCKET_PATH "./chat.socket"
#define BUFFER_SIZE 128

int add_numbers(int a, int b) { return a + b; }

int main() {

  printf("Hello, LSP Test in C!\n");
  int result = add_numbers(2, 5);
  printf("2 + 5 = %d\n", result);

  int server_fd, client_fd;
  struct sockaddr_un addr;
  char buffer[BUFFER_SIZE];

  unlink(SOCKET_PATH); // Alte Socket-Datei löschen

  if ((server_fd = socket(AF_UNIX, SOCK_STREAM, 0)) == -1) {
    perror("socket");
    exit(EXIT_FAILURE);
  }

  addr.sun_family = AF_UNIX;
  strncpy(addr.sun_path, SOCKET_PATH, sizeof(addr.sun_path) - 1);

  if (bind(server_fd, (struct sockaddr *)&addr, sizeof(addr)) == -1) {
    perror("bind");
    exit(EXIT_FAILURE);
  }

  if (listen(server_fd, 1) == -1) {
    perror("listen");
    exit(EXIT_FAILURE);
  }

  printf("Warte auf Verbindung...\n");
  if ((client_fd = accept(server_fd, NULL, NULL)) == -1) {
    perror("accept");
    exit(EXIT_FAILURE);
  }

  printf("Verbindung akzeptiert. Warte auf Nachricht...\n");
  ssize_t bytes = read(client_fd, buffer, sizeof(buffer) - 1);
  if (bytes > 0) {
    buffer[bytes] = '\0';
    printf("Nachricht empfangen: %s\n", buffer);
  }

  close(client_fd);
  close(server_fd);
  unlink(SOCKET_PATH);
  return 0;
}
