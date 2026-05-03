import axios from "axios"

export function Upload() {
    async function upload() {
        try{
            console.log("Going to try uploading");
            const response = await axios.post("http://localhost:3000/api/videos", {
            title: document.getElementById("title")!.value,
            videoUrl: document.getElementById("videoUrl")!.value,
            thumbnail: document.getElementById("thumbnail")!.value,
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        console.log("Upload successful:", response.data);
        alert("Video uploaded successfully!");
    } catch(error: any) {
        console.log("Full Error:", error);
        console.log("Error Response:", error.response?.data);
        alert("Error: " + (error.response?.data?.error || error.message));
    }
    }
    return <div>
        <input id="title" type="text" placeholder="video title"></input>
        <input id="videoUrl" type="text" placeholder="video url"></input>
        <input id="thumbnail" type="text" placeholder="thumbnail url"></input>
        <button onClick={upload}>Complete Upload</button>
        Upload page
    </div>
}