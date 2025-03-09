import {Routes, Route } from "react-router-dom";
import AuthForm from "./components/AuthForm/Auth.jsx";
import ResetPassword from "./components/ResetPassword/ResetPassword.jsx";
import Main from "./components/Main/Main.jsx";
import Chatbot from "./components/Chatbot/Chatbot.jsx";
function App() {
    return (
        
            <Routes>
                <Route path="/" element={<Main/>}/>
                <Route path="/auth" element={<AuthForm />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/chatbot-page" element={<Chatbot/>}></Route>
            </Routes>
    );
}
export default App;
