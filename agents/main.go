import ("time"; "net/http"; "os/exec"; "encoding/json"; "bytes")
func cpu() string { out,_:=exec.Command("sh","-c","grep 'cpu ' /proc/stat").Output(); return string(out)}
func main(){
  for { data:=map[string]string{"cpu":cpu()}
    b,_:=json.Marshal(data); http.Post("http://backend:3000/heartbeat","application/json",bytes.NewBuffer(b))
    time.Sleep(30*time.Second)
  }
}