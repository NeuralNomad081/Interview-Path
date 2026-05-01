# Use a slim Python image
FROM python:3.11-slim

# Install system dependencies for OpenCV and DeepFace
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download AI models to avoid slow first runs or timeouts
RUN python -c "import whisper; whisper.load_model('base')"
RUN python -c "from deepface import DeepFace; DeepFace.build_model('VGG-Face')"

# Copy application code
COPY . .

# Set environment variables
ENV PRODUCTION=true
ENV PORT=8000

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
