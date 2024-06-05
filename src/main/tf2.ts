import NodeHandle from 'rosnodejs/dist/lib/NodeHandle'
import Subscriber from 'rosnodejs/dist/lib/Subscriber'
import { now } from 'rosnodejs/dist/lib/time/time_utils'

class Node {
  value: string
  neighbors: Node[]

  constructor(value: string) {
    this.value = value
    this.neighbors = []
  }

  addNeighbor(node: Node) {
    this.neighbors.push(node)
  }
}

class Graph {
  nodes: Map<string, Node>

  constructor() {
    this.nodes = new Map()
  }

  addNode(value: string) {
    this.nodes.set(value, new Node(value))
  }

  addEdge(value1: string, value2: string) {
    const node1 = this.nodes.get(value1)
    const node2 = this.nodes.get(value2)
    if (node1 && node2) {
      node1.addNeighbor(node2)
      node2.addNeighbor(node1)
    }
  }
}
const g: Graph = new Graph()
class Connection {
  to: string
  from: string
  timestamp: number
  constructor(to, from, timestamp) {
    this.to = to
    this.from = from
    this.timestamp = timestamp
  }
}
const connections: Connection[] = []
function exo(nh: NodeHandle) {
  /**
   * @deprecated Use {@link sub} instead.
   */ // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sub: Subscriber<'tf2_msgs/TFMessage'> = nh.subscribe(
    '/tf',
    'tf2_msgs/TFMessage',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (msg: any) => {
      //console.log(msg.transforms[0])
      if (
        msg.transforms[0].header.frame_id === 'map' &&
        msg.transforms[0].child_frame_id === 'base_link'
      ) {
        //console.log(msg.transforms[0])
        for (let i = 0; i < msg.transforms.length; i++) {
          //console.log(msg.transforms[i].header.frame_id)
          g.addNode(msg.transforms[i].header.frame_id)
          g.addNode(msg.transforms[i].child_frame_id)
          g.addEdge(msg.transforms[i].header.frame_id, msg.transforms[i].child_frame_id)
          if (connections.length != 0) {
            for (const Connection of connections) {
              if (Connection.to === msg.transforms[i].header.frame_id) {
                if (Connection.from === msg.transforms[i].child_frame_id) {
                  connections[connections.indexOf(Connection)].timestamp = msg.transforms[i].header.stamp
                } else {
                  connections.push(
                    msg.transforms[i].header.frame_id,
                    msg.transforms[i].child_frame_id,
                    msg.transforms[i].header.stamp.secs
                  )
                }
                connections.push(
                  msg.transforms[i].header.frame_id,
                  msg.transforms[i].child_frame_id,
                  msg.transforms[i].header.stamp
                )
              }
            }
          } else
            connections.push(
              msg.transforms[i].header.frame_id,
              msg.transforms[i].child_frame_id,
              msg.transforms[i].header.stamp
            )
          //connections.push(msg.transforms[i].header.frame_id, msg.transforms[i].child_frame_id)
          //console.log(typeof msg.transforms[i].header.frame_id)
          //console.log(g)
          /*for (const [key, value] of g.nodes.entries()) {
            console.log(key, value)
          }
          console.log(' *************************** ')*/
          find()
        }
      }
    }
  )
}
export { exo }

function find() {
  console.log(connections)
}
export { find }
