import toast from "react-hot-toast"

function ChatPage() {
  return (
    <button onClick={()=> toast.success("Your Cli")}> Clekc me</button>
  )
}

export default ChatPage
