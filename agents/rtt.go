package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	pb "./cloud-edge-agent/proto"
)

// RTT server in every agent
// for example:
// {
//   "nodeA": {
//     "nodeB": 1200000,  // RTT from A to B is 1.2ms
//     "nodeC": 980000    // RTT from A to C is 0.98ms
//   },
//   "nodeB": {
//     "nodeA": 1250000
//   }
// }
type rttServer struct {
	// extend the UnimplementedAgentServiceServer
	pb.UnimplementedAgentServiceServer // ensure the server can be used as a gRPC server
	nodeID                             string
	mu                                 sync.RWMutex                // mutex for thread-safe access to rttData
	rttData                            map[string]map[string]int64 // from -> to -> rtt(ns)
}

func newRTTServer(nodeID string) *rttServer {
	return &rttServer{
		nodeID:  nodeID,
		rttData: make(map[string]map[string]int64),
	}
}

// Ping handler – respond with Pong and timestamps
// NOTE: this method is mounted to rttServer struct
func (s *rttServer) Ping(ctx context.Context, req *pb.PingRequest) (*pb.PongResponse, error) {
	return &pb.PongResponse{
		FromNodeID:    s.nodeID,
		ToNodeID:      req.FromNodeID,
		Timestamp:     req.Timestamp,
		PongTimestamp: time.Now().UnixNano(),
	}, nil
}

// GetRTTMatrix – center/backend can pull RTT matrix
// NOTE: this method is mounted to rttServer struct
func (s *rttServer) GetRTTMatrix(ctx context.Context, _ *pb.Empty) (*pb.RTTMatrixResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var nodes []string
	var entries []*pb.RTTEntry
	for from, m := range s.rttData {
		nodes = append(nodes, from)
		for to, rtt := range m {
			entries = append(entries, &pb.RTTEntry{
				FromNodeID: from,
				ToNodeID:   to,
				Rtt:        rtt,
			})
		}
	}
	return &pb.RTTMatrixResponse{Nodes: nodes, Entries: entries}, nil
}

// recordRTT stores RTT in map (thread-safe)
// NOTE: save RTT to rttServer.rttData (local)
func (s *rttServer) recordRTT(to string, rtt int64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.rttData[s.nodeID] == nil {
		s.rttData[s.nodeID] = make(map[string]int64)
	}
	s.rttData[s.nodeID][to] = rtt
}

// pushRTT push RTT data to backend
// NOTE: push RTT to backend (remote)
func (s *rttServer) pushRTT(backendURL string) {
	ticker := time.NewTicker(30 * time.Second)
	for {
		<-ticker.C
		s.mu.RLock()
		payload, _ := json.Marshal(s.rttData[s.nodeID]) // map[string]int64
		s.mu.RUnlock()

		_, err := http.Post(backendURL+"/api/rtt", "application/json", bytes.NewBuffer(payload))
		if err != nil {
			log.Printf("RTT push failed: %v", err)
		}
	}
}

// startGRPCServer starts agent gRPC server on given port
func startGRPCServer(port string, srv *rttServer) {
	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	g := grpc.NewServer()
	pb.RegisterAgentServiceServer(g, srv)
	reflection.Register(g)
	log.Printf("gRPC server listening on %s", port)
	if err := g.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

// probePeers periodically pings peers to measure RTT
func (s *rttServer) probePeers(peers []string, port string) {
	ticker := time.NewTicker(30 * time.Second)
	for {
		<-ticker.C
		for _, peer := range peers {
			if peer == s.nodeID || peer == "" {
				continue
			}
			go func(target string) { // target = peer
				addr := target + ":" + port
				conn, err := grpc.Dial(addr, grpc.WithInsecure(), grpc.WithBlock(), grpc.WithTimeout(5*time.Second))
				if err != nil {
					return
				}
				defer conn.Close()
				c := pb.NewAgentServiceClient(conn)
				start := time.Now().UnixNano()
				ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
				defer cancel()
				// send ping to peer
				// NOTE: this Ping() is rttServer.Ping() defined above
				// c.xxx() will be sent to target node (not the method on itself)
				_, err = c.Ping(ctx, &pb.PingRequest{
					FromNodeID: s.nodeID,
					ToNodeID:   target,
					Timestamp:  start,
				})
				// if return Pong without error
				if err == nil {
					rtt := time.Now().UnixNano() - start
					s.recordRTT(target, rtt)
				}
			}(peer) // target = peer
		}
	}
}

// init function starts server and probes automatically
// NOTE: this function is called when the agent starts
func init() {
	nodeID := os.Getenv("NODE_ID")
	if nodeID == "" {
		hostname, _ := os.Hostname()
		nodeID = hostname
	}
	port := os.Getenv("GRPC_PORT")
	if port == "" {
		port = "50052"
	}
	peerEnv := os.Getenv("PEER_NODES") // comma-separated list of peer hostnames/IPs

	// get all peers
	peers := strings.Split(peerEnv, ",") 

	srv := newRTTServer(nodeID)

	go startGRPCServer(port, srv)

	// send pings to all peers
	go srv.probePeers(peers, port)

	backend := os.Getenv("BACKEND_URL")
	if backend == "" {
		backend = "http://backend:3000"
	}

	go srv.pushRTT(backend) // ⬅️ 开始定时上报 RTT
}
