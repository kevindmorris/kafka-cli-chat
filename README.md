# 💬 Kafka CLI Chat

A simple two-way command-line chat application built with Node.js and Kafka.

## ⚙️ Requirements

- Node.js 18+ 🧑‍💻
- Docker 🐳 (or some Kafka server to connect)
- Docker Compose

## 🚀 Usage

1. Clone the repository

2. Install dependencies

   ```bash
   npm i
   ```

3. Start a Kafka server with Docker Compose

   ```bash
   docker compose up -d
   ```

4. Join the chat

   ```bash
   npm run chat [username]
   # or
   node chat.js [username]
   ```
