import asyncio
class ConnectionManager:
 def __init__(self): self.connections=set()
 async def connect(self,socket): await socket.accept();self.connections.add(socket)
 def disconnect(self,socket): self.connections.discard(socket)
 async def broadcast(self,payload):
  # FIX: on fige la liste AVANT le await. Avant, un client qui se (dé)connectait pendant le gather
  # décalait le zip(results) et pouvait déconnecter le mauvais socket.
  sockets=list(self.connections)
  results=await asyncio.gather(*(s.send_json(payload) for s in sockets),return_exceptions=True)
  for s,r in zip(sockets,results):
   if isinstance(r,Exception):self.disconnect(s)
manager=ConnectionManager()