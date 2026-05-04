import { Appbar } from "@/components/Appbar";
import { VideoCard } from "@/components/VideoCard";
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

