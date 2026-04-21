import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.db.database import get_db
from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.email_service import send_otp_email
from pydantic import BaseModel

router = APIRouter()

class VerifyOTP(BaseModel):
    email: str
    otp: str

@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    otp_code = str(random.randint(100000, 999999))
    hashed_password = get_password_hash(user.password)
    
    new_user = User(email=user.email, hashed_password=hashed_password, otp=otp_code)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    send_otp_email(user.email, otp_code)
    
    return new_user

@router.post("/verify-otp")
def verify_otp(data: VerifyOTP, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="User is already verified")
    if user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    user.is_verified = True
    user.otp = None 
    db.commit()
    
    return {"message": "Email successfully verified. You can now login!"}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email via the OTP sent to you before logging in.")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
