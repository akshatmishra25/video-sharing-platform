import { Appbar } from "@/components/Appbar";
import axios from "axios"
import { useEffect, useState } from "react"

export function Landing() {
    const [videos, setVideos] = useState([]);
    useEffect(() => {
        axios.get("http://localhost:3000/api/videos")
             .then(response => {
                const data = response.data;
                // Ensure data is an array
                if (Array.isArray(data)) {
                    setVideos(data);
                } else if (data && Array.isArray(data.videos)) {
                    setVideos(data.videos);
                } else {
                    setVideos([]);
                }
             })
             .catch(error => {
                console.error("Error fetching videos:", error);
                setVideos([]);
             })
    }, [])
    return <div>
        <Appbar />
        <div style={{display: "flex", padding: 10}}>
        {videos.map( video => {
            return <VideoCard
                href={`/watch?id=${video.id}`}
                imageUrl={video.thumbnail}
                title= {video.title}
                channelImage= {video.user.profilePicture}
                channelName= {video.user.channelName}
            />
        })}
        </div>
    </div>
}

interface IVideoCard {href: string, imageUrl: string, title: string, channelImage: string, channelName: string}

function VideoCard({imageUrl, title, channelImage, channelName, href}: IVideoCard) {
    return <div style={{borderRadius: 30, margin: 20}} onClick={()=> window.location = href}> 
        <img src={imageUrl} style={{display: "block", width: "100%", borderRadius: 20 }} />
        <div> {title} </div>
        <div>
            <img src={channelImage} style={{width:30, borderRadius: "50%"}}/>
            {channelName}
        </div>

    </div>
}