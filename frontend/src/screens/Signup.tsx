import axios from "axios"

export function Signup() {
    async function signup() {
        try {
            const response = await axios.post("http://localhost:3000/api/signup", {
                username: document.getElementById("username")!.value,
                password: document.getElementById("password")!.value,
                channelName: document.getElementById("channelName")!.value,
                gender: document.getElementById("gender")!.value,
            })
            localStorage.setItem("token", response.data.token);
            window.location = "/";
        } catch (error) {
            console.log("error:"+error.response.data.error);
            alert("Signup failed: " + (error.response?.data?.error || "Unknown error"));
        }
    }
    return <div>
        <input id="username" type="text" placeholder="Username"></input>
        <input id="password" type="password" placeholder="Password"></input>
        <input id="channelName" type="text" placeholder="Channel Name"></input>
        <select id="gender">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
        </select>
        <button onClick={signup}>Sign up</button>
    </div>
}