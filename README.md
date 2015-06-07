# Agar

Contains some code to interact with the game agar.io.

- AgarBackend
  - Connects to agar
  - Receives messages
  - Parses messages
  - Sends messages (on behalf of controller)

- GameState
  - Holds state of the game
  - Gets messages from backend and updates game state

- Controller
  - Receives high level actions and translates into message to agar backend
  - Note: This is not complete at all.

- Agent
  - Uses game state to make intelligent descision, sends actions to controller
  - Note: This is not complete at all.

- Server
  - Serves index.html
  - Initializes all of the above when a new client connects
