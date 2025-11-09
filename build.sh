#!/usr/bin/env bash
# Build script for Render deployment

# Exit on error
set -o errexit

echo "📦 Building React frontend..."
npm install
npm run build

echo "🐍 Installing Python dependencies..."
pip install -r backend/requirements.txt

echo "📁 Collecting static files..."
cd backend
python manage.py collectstatic --noinput

echo "🗄️  Running database migrations..."
python manage.py migrate --noinput

echo "✅ Build complete!"
