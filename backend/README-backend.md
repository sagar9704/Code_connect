Prerequisites: Docker installed and running, Node.js (16+)
2. cd backend
3. npm install
4. node server.js
5. Open http://localhost:3000


Notes:
- Running this example requires the Node process to access Docker socket: /var/run/docker.sock
- In production, do NOT expose docker.sock to untrusted processes. Use a container manager or daemon with restricted permissions.