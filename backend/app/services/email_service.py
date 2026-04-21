import smtplib
from email.message import EmailMessage
import os

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "your_email@gmail.com")
APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD", "xxxx xxxx xxxx xxxx")

def send_otp_email(receiver_email: str, otp: str):
    msg = EmailMessage()
    msg['Subject'] = 'Your GhostWriterAI Verification Code'
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email
    
    msg.set_content(f"Welcome to GhostWriterAI!\n\nYour 6-digit verification code is: {otp}\n\nDo not share this code with anyone.")

    # Only attempt to send if configured, otherwise just print for local debug
    if SENDER_EMAIL == "your_email@gmail.com" or APP_PASSWORD == "xxxx xxxx xxxx xxxx":
        print(f"--- MOCK EMAIL SENT ---")
        print(f"To: {receiver_email}")
        print(f"OTP: {otp}")
        print(f"-----------------------")
        return True

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.send_message(msg)
            return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
