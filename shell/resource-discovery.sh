#TODO: 用于资源发现
# 3. 启动 node-agent.js
# echo "Starting node-agent.js on all nodes..."
# ALL_NODES=("${CLOUD_NODES[@]}" "${EDGE_NODES[@]}")
# for node in "${ALL_NODES[@]}"; do
#   docker exec $node npm install axios
#   docker exec -d $node node /node-agent.js
# done

# 4. 验证资源发现
# echo "Verifying resource discovery..."
# sleep 10 # 等待 node-agent.js 发送数据
# docker exec -it mongodb mongo cloud_edge_db --eval "db.nodes.find().pretty()"