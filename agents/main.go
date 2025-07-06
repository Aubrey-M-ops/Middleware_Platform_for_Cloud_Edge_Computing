// 🙋 What an agent can do
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"time"
)

type Config struct {
	BackendURL        string
	NodeType          string // cloud or edge
	HeartbeatInterval int
}

// set default value if the environment variable is not set
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getConfig() Config {
	backendURL := getEnv("BACKEND_URL", "http://backend:3000")
	nodeType := getEnv("NODE_TYPE", "edge")
	intervalStr := getEnv("HEARTBEAT_INTERVAL", "30")
	interval, _ := strconv.Atoi(intervalStr) // transfer string to int

	return Config{
		BackendURL:        backendURL,
		NodeType:          nodeType,
		HeartbeatInterval: interval,
	}
}



func cpu() string {
	out, _ := exec.Command("sh", "-c", "grep 'cpu ' /proc/stat").Output()
	return string(out)
}

func memory() string {
	out, _ := exec.Command("sh", "-c", "free -m | grep Mem").Output()
	return string(out)
}

func sendHeartbeat(config Config) error {
	data := map[string]interface{}{
		"cpu":       cpu(),
		"memory":    memory(),
		"nodeType":  config.NodeType,
		"timestamp": time.Now().Unix(),
	}

	// use Marshal to convert data to JSON format
	// so that data can be sent in http request body
	dataJson, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %v", err)
	}

	resp, err := http.Post(config.BackendURL+"/heartbeat", "application/json", bytes.NewBuffer(dataJson))
	if err != nil {
		return fmt.Errorf("failed to send heartbeat: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("heartbeat failed with status: %d", resp.StatusCode)
	}

	return nil
}

func main() {
	config := getConfig()

	fmt.Printf("Starting agent with config: BackendURL=%s, NodeType=%s, Interval=%ds\n",
		config.BackendURL, config.NodeType, config.HeartbeatInterval)

	for {
		if err := sendHeartbeat(config); err != nil {
			fmt.Printf("Error sending heartbeat: %v\n", err)
		} else {
			fmt.Printf("Heartbeat sent successfully at %s\n", time.Now().Format("2006-01-02 15:04:05"))
		}

		time.Sleep(time.Duration(config.HeartbeatInterval) * time.Second)
	}
}
