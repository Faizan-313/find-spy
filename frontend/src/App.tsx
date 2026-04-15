import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import CreateRoom from "./pages/CreateRoom"
import JoinRoom from "./pages/JoinRoom"
import Footer from "./components/Footer"
import Room from "./pages/RoomWaiting"
import { Toaster } from "react-hot-toast"
import RoomWaiting from "./pages/RoomWaiting"

function AppContent(){
  return(
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-room" element={<CreateRoom />} />
      <Route path="/join-room" element={<JoinRoom />} />
      <Route path="/room-waiting" element={<RoomWaiting />} />
      <Route path="/room" element={<Room />} />
    </Routes>
  )
}


function App() {

  return (
    <>
        <Router>
          <Navbar />
          <Toaster position="top-center" reverseOrder={false} />
          <AppContent />
          <Footer />
        </Router>
    </>
  )
}

export default App
