FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install motor dnspython pymongo # Ensure mongodb async dependencies are installed

COPY backend/ ./backend/

# Hugging Face Spaces exposes port 7860
EXPOSE 7860

CMD ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "7860"]
