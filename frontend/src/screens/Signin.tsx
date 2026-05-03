import axios from "axios"

export function Signin() {
    async function signin() {
        const response = await axios.post("http://localhost:3000/api/signin", {
            username: document.getElementById("username")!.value,
            password: document.getElementById("password")!.value,
        })
        localStorage.setItem("token", response.data.token);
        window.location = "/";
    }
    return <div>
        <input id="username" type="text" placeholder="Username"></input>
        <input id="password" type="text" placeholder="Password"></input>
        <button onClick={signin}>Sign in</button>
    </div>
}