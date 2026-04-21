import smtplib
from email.message import EmailMessage
import os
from datetime import datetime

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "your_email@gmail.com")
APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD", "xxxx xxxx xxxx xxxx")

def send_otp_email(receiver_email: str, otp: str):
    msg = EmailMessage()
    msg['Subject'] = f'{otp} is your GhostWriterAI verification code'
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .email-container {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 500px;
                margin: 0 auto;
                padding: 40px 20px;
                background-color: #f9fafb;
            }}
            .card {{
                background-color: #ffffff;
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                border: 1px solid #e5e7eb;
            }}
            .logo {{
                font-size: 24px;
                font-weight: bold;
                color: #111827;
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }}
            .logo-span {{ color: #7c3aed; }}
            .title {{
                font-size: 20px;
                color: #1f2937;
                margin-bottom: 8px;
            }}
            .subtitle {{
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 32px;
            }}
            .otp-container {{
                background-color: #f3f4f6;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 32px;
            }}
            .otp-code {{
                font-size: 36px;
                font-weight: 800;
                color: #7c3aed;
                letter-spacing: 8px;
            }}
            .footer {{
                font-size: 12px;
                color: #9ca3af;
                margin-top: 32px;
                line-height: 1.5;
            }}
            .warning {{
                color: #ef4444;
                font-weight: 500;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="card">
                <div class="logo">
                    GhostWriter<span class="logo-span">AI</span>
                </div>
                <h1 class="title">Verify your email</h1>
                <p class="subtitle">Use the verification code below to complete your signup.</p>
                
                <div class="otp-container">
                    <span class="otp-code">{otp}</span>
                </div>
                
                <p class="footer">
                    This code will expire in 24 hours. <br>
                    <span class="warning">Do not share this code with anyone.</span> our team will never ask for this code.
                </p>
            </div>
            <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #9ca3af;">
                &copy; {datetime.now().year} GhostWriterAI. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """
    
    # Set plain text first
    msg.set_content(f"Your GhostWriterAI verification code is: {otp}")
    
    # Add HTML alternative second
    msg.add_alternative(html_content, subtype='html')

    # Only attempt to send if configured, otherwise just print for local debug
    if SENDER_EMAIL == "your_email@gmail.com" or APP_PASSWORD == "xxxx xxxx xxxx xxxx":
        print(f"--- MOCK HTML EMAIL SENT ---")
        print(f"To: {receiver_email}")
        print(f"OTP: {otp}")
        print(f"----------------------------")
        return True

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.send_message(msg)
            return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
