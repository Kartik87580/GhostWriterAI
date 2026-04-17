from youtube_transcript_api import YouTubeTranscriptApi
import re

def extract_video_id(url: str) -> str:
    """
    Extracts the video ID from a YouTube URL.
    """
    video_id = None
    if "v=" in url:
        # Handle https://www.youtube.com/watch?v=VIDEO_ID&...
        parts = url.split("v=")
        if len(parts) > 1:
            video_id = parts[1].split("&")[0]
    elif "youtu.be/" in url:
        # Handle https://youtu.be/VIDEO_ID?...
        parts = url.split("/")
        if len(parts) > 0:
            video_id = parts[-1].split("?")[0]
    
    return video_id

def get_youtube_transcript(url: str) -> str:
    """
    Fetches the transcript of a YouTube video given its URL.
    """
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError(f"Could not extract video ID from URL: {url}")
    
    try:
        ytt_api = YouTubeTranscriptApi()
        # fetch returns a list of objects with .text and .start attributes
        transcript_entries = ytt_api.fetch(video_id)
        transcript_text = " ".join([t.text for t in transcript_entries])
        return transcript_text
    except Exception as e:
        raise Exception(f"Failed to fetch YouTube transcript: {str(e)}")
