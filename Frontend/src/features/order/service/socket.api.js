import { getSocket as getSharedSocket } from "../../socketio/service/track_socketio.api.js";

export function getSocket() {
  return getSharedSocket();
}

export default getSocket;
