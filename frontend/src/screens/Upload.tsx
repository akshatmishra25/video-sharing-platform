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
        <input type="file" onChange={async (e, files) => {
            const file = (e.target.files[0]);
            console.log(file)
            const response = await axios.post("http://localhost:3000/getPresignedUrl");
            const {putUrl, finalVideoUrl} = response.data;
            const options = {
                method: 'PUT',
                url: putUrl,
                headers: {'Content-Length': file.size, 'Content-Type':'multipart/form-data'
                } 
            }
            axios
                .request(options)
                .then(res => console.log(res.data))
                .catch(err => console.error(err));
        }}></input>
        <input id="thumbnail" type="text" placeholder="thumbnail url"></input>
        <button onClick={upload}>Complete Upload</button>
        Upload page
    </div>
}