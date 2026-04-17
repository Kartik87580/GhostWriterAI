from youtube_transcript_api import YouTubeTranscriptApi

url = "https://www.youtube.com/watch?v=z_BX6blB_iU"

video_id = url.replace("https://www.youtube.com/watch?v=", "")
print(video_id)

ytt_api = YouTubeTranscriptApi()

transcript = ytt_api.fetch(video_id)

text = " ".join([t.text for t in transcript])

print(text) 